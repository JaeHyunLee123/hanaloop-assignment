// Drizzle ORM 기반 실제 데이터베이스 연동 API 함수
import { db } from "@/db";
import {
  countries as countriesTable,
  companies as companiesTable,
  emissions as emissionsTable,
  posts as postsTable,
} from "@/db/schema";
import { Post, Company, ExtendedGhgEmission } from "@/types/base-types";
import { EMISSION_FACTORS, BOM } from "./constants";
import {
  processGuitarProduction,
  processDeliveryDistance,
  processPickupImport,
  processGuitarStringImport,
} from "./emissions-calculator";
import { buildPostContent, PayloadItemType } from "./post-content-builder";
import { eq, and, sql, sum, gte, lte } from "drizzle-orm";
import crypto from "crypto";

export type PayloadActionType = "guitar_production" | "delivery" | "pickup_import" | "string_import";

export interface EmissionPayload {
  actionType: PayloadActionType;
  quantity: number;
  yearMonth: string;
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const jitter = () => 200 + Math.random() * 600;
const maybeFail = () => Math.random() < 0.15;

export async function fetchCountries() {
  await delay(jitter());
  const dbCountries = await db.select().from(countriesTable);
  return dbCountries;
}

export async function fetchCompanies() {
  await delay(jitter());
  const dbCompanies = await db.query.companies.findMany({
    with: {
      emissions: true,
    },
  });

  return dbCompanies.map((c) => ({
    id: c.id,
    name: c.name,
    country: c.countryCode,
    emissions: c.emissions.map((e) => ({
      yearMonth: e.yearMonth,
      source: e.source,
      emissions: e.emissions,
      scope: e.scope as 1 | 2 | 3,
      pcfStage: e.pcfStage as 1 | 2 | 3 | 4 | 5,
    })),
  }));
}

export async function fetchPosts() {
  await delay(jitter());
  const dbPosts = await db.select().from(postsTable);
  return dbPosts.map((p) => ({
    id: p.id,
    title: p.title,
    resourceUid: p.resourceUid,
    dateTime: p.dateTime,
    content: p.content,
  }));
}

export async function createOrUpdatePost(
  p: Omit<Post, "id"> & { id?: string }
) {
  await delay(jitter());
  if (maybeFail()) throw new Error("Save failed");

  if (p.id) {
    await db
      .update(postsTable)
      .set({
        title: p.title,
        resourceUid: p.resourceUid,
        dateTime: p.dateTime,
        content: p.content,
      })
      .where(eq(postsTable.id, p.id));
    return p as Post;
  }

  const createdId = crypto.randomUUID();
  await db.insert(postsTable).values({
    id: createdId,
    title: p.title,
    resourceUid: p.resourceUid,
    dateTime: p.dateTime,
    content: p.content,
  });

  return { ...p, id: createdId } as Post;
}

export async function submitEmissions(payload: EmissionPayload) {
  await delay(jitter());
  if (maybeFail()) throw new Error("Save failed");

  let map: Map<string, ExtendedGhgEmission[]>;
  let itemType: PayloadItemType = "guitar";

  switch (payload.actionType) {
    case "guitar_production":
      map = processGuitarProduction(payload.quantity, payload.yearMonth);
      itemType = "guitar";
      break;
    case "delivery":
      map = processDeliveryDistance(payload.quantity, payload.yearMonth);
      itemType = "guitar";
      break;
    case "pickup_import":
      map = processPickupImport(payload.quantity, payload.yearMonth);
      itemType = "pickup";
      break;
    case "string_import":
      map = processGuitarStringImport(payload.quantity, payload.yearMonth);
      itemType = "string";
      break;
    default:
      throw new Error(`Invalid actionType: ${payload.actionType}`);
  }

  return await db.transaction(async (tx) => {
    const updatedPosts: Post[] = [];

    for (const [companyId, newEmissions] of Array.from(map.entries())) {
      const companyRecord = await tx.query.companies.findFirst({
        where: eq(companiesTable.id, companyId),
      });

      if (!companyRecord) continue;

      for (const e of newEmissions) {
        await tx
          .insert(emissionsTable)
          .values({
            companyId,
            yearMonth: e.yearMonth,
            source: e.source,
            emissions: e.emissions,
            scope: e.scope,
            pcfStage: e.pcfStage,
          })
          .onConflictDoUpdate({
            target: [
              emissionsTable.companyId,
              emissionsTable.yearMonth,
              emissionsTable.source,
              emissionsTable.scope,
              emissionsTable.pcfStage,
            ],
            set: {
              emissions: sql`${emissionsTable.emissions} + ${e.emissions}`,
            },
          });
      }

      // 해당 회사의 전체 연관 배출량을 다시 조회 (buildPostContent 전달용)
      const updatedEmissions = await tx
        .select()
        .from(emissionsTable)
        .where(eq(emissionsTable.companyId, companyId));

      const companyForPost: Company = {
        id: companyRecord.id,
        name: companyRecord.name,
        country: companyRecord.countryCode,
        emissions: updatedEmissions.map((ue) => ({
          yearMonth: ue.yearMonth,
          source: ue.source,
          emissions: ue.emissions,
          scope: ue.scope as 1 | 2 | 3,
          pcfStage: ue.pcfStage as 1 | 2 | 3 | 4 | 5,
        })),
      };

      const content = buildPostContent(
        companyForPost,
        newEmissions,
        payload.quantity,
        itemType
      );

      const existingPost = await tx.query.posts.findFirst({
        where: and(
          eq(postsTable.resourceUid, companyId),
          eq(postsTable.dateTime, payload.yearMonth)
        ),
      });

      if (existingPost) {
        const newContent = `${existingPost.content}\n${content}`;
        await tx
          .update(postsTable)
          .set({ content: newContent })
          .where(eq(postsTable.id, existingPost.id));

        updatedPosts.push({
          id: existingPost.id,
          title: existingPost.title,
          resourceUid: existingPost.resourceUid,
          dateTime: existingPost.dateTime,
          content: newContent,
        });
      } else {
        const newPostId = crypto.randomUUID();
        const title = `${companyRecord.name} ${payload.yearMonth} 배출 이력`;
        await tx.insert(postsTable).values({
          id: newPostId,
          title,
          resourceUid: companyId,
          dateTime: payload.yearMonth,
          content,
        });

        updatedPosts.push({
          id: newPostId,
          title,
          resourceUid: companyId,
          dateTime: payload.yearMonth,
          content,
        });
      }
    }

    return updatedPosts;
  });
}

const PCF_STAGE_NAMES: Record<number, string> = {
  1: "1단계: 원자재 생산 및 조달",
  2: "2단계: 제조 및 가공",
  3: "3단계: 유통 및 물류",
  4: "4단계: 제품 사용",
  5: "5단계: 제품 폐기",
};

export async function getDashboardStats(startDate?: string, endDate?: string) {
  await delay(jitter());

  // 기간 파라미터 파싱 및 디폴트 값 할당 (당월 포함 최근 12개월)
  let start = startDate;
  let end = endDate;

  if (!start && !end) {
    const now = new Date();
    const endD = now;
    const startD = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    
    start = `${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, "0")}`;
    end = `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, "0")}`;
  } else if (start && !end) {
    end = start;
  } else if (!start && end) {
    start = end;
  }

  const startMonth = start!;
  const endMonth = end!;

  // 1. totalEmissions
  const [totalRes] = await db
    .select({ value: sum(emissionsTable.emissions) })
    .from(emissionsTable)
    .where(and(gte(emissionsTable.yearMonth, startMonth), lte(emissionsTable.yearMonth, endMonth)));
  const totalEmissions = Number(totalRes?.value || 0);

  // 2. emissionsByScope
  const scopeRes = await db
    .select({
      scope: emissionsTable.scope,
      value: sum(emissionsTable.emissions),
    })
    .from(emissionsTable)
    .where(and(gte(emissionsTable.yearMonth, startMonth), lte(emissionsTable.yearMonth, endMonth)))
    .groupBy(emissionsTable.scope)
    .orderBy(emissionsTable.scope);

  const emissionsByScope = scopeRes.map((r) => ({
    name: `Scope ${r.scope}`,
    value: Number(r.value || 0),
  }));

  // 3. emissionsByCompany
  const joinCondition = and(
    eq(companiesTable.id, emissionsTable.companyId),
    gte(emissionsTable.yearMonth, startMonth),
    lte(emissionsTable.yearMonth, endMonth)
  );

  const companyRes = await db
    .select({
      companyName: companiesTable.name,
      value: sum(emissionsTable.emissions),
    })
    .from(companiesTable)
    .leftJoin(emissionsTable, joinCondition)
    .groupBy(companiesTable.id, companiesTable.name);

  const emissionsByCompany = companyRes.map((r) => ({
    name: r.companyName,
    value: Number(r.value || 0),
  }));

  // 4. emissionsByPcfStage
  const stageRes = await db
    .select({
      pcfStage: emissionsTable.pcfStage,
      value: sum(emissionsTable.emissions),
    })
    .from(emissionsTable)
    .where(and(gte(emissionsTable.yearMonth, startMonth), lte(emissionsTable.yearMonth, endMonth)))
    .groupBy(emissionsTable.pcfStage)
    .orderBy(emissionsTable.pcfStage);

  const emissionsByPcfStage = stageRes.map((r) => ({
    name: PCF_STAGE_NAMES[r.pcfStage] || `Stage ${r.pcfStage}`,
    value: Number(r.value || 0),
  }));

  // 5. emissionsByMonth (월별 차트 데이터 동적 생성)
  const monthlyRes = await db
    .select({
      yearMonth: emissionsTable.yearMonth,
      value: sum(emissionsTable.emissions),
    })
    .from(emissionsTable)
    .where(and(gte(emissionsTable.yearMonth, startMonth), lte(emissionsTable.yearMonth, endMonth)))
    .groupBy(emissionsTable.yearMonth);

  const monthlyMap = new Map<string, number>();
  for (const r of monthlyRes) {
    if (r.yearMonth) {
      monthlyMap.set(r.yearMonth, Number(r.value || 0));
    }
  }

  // startDate부터 endDate까지의 모든 월을 YYYY-MM 배열로 도출
  const targetMonths: string[] = [];
  const [startYear, startM] = startMonth.split("-").map(Number);
  const [endYear, endM] = endMonth.split("-").map(Number);
  
  let currYear = startYear;
  let currMonth = startM;
  
  while (currYear < endYear || (currYear === endYear && currMonth <= endM)) {
    targetMonths.push(`${currYear}-${String(currMonth).padStart(2, "0")}`);
    currMonth++;
    if (currMonth > 12) {
      currMonth = 1;
      currYear++;
    }
  }

  const emissionsByMonth = targetMonths.map((m) => ({
    name: m,
    value: monthlyMap.get(m) || 0,
  }));

  // Calculate static PCF per unit (BOM & 배출계수 기준 이론값 유지)
  const stringStage1 =
    EMISSION_FACTORS.GUITAR_STRING_PRODUCTION_PER_UNIT *
    BOM.GUITAR_STRINGS_PER_GUITAR;
  const pickupStage1 =
    EMISSION_FACTORS.PICKUP_PRODUCTION_PER_UNIT * BOM.PICKUPS_PER_GUITAR;
  const kenderStage2 =
    EMISSION_FACTORS.PRODUCTION_FOSSIL_FUEL_PER_UNIT +
    EMISSION_FACTORS.PRODUCTION_ELECTRICITY_PER_UNIT;

  const cradleToGatePcf = stringStage1 + pickupStage1 + kenderStage2;

  const stringStage3 =
    (EMISSION_FACTORS.GUITAR_STRING_INTL_SHIPPING_PER_UNIT +
      EMISSION_FACTORS.GUITAR_STRING_DOMESTIC_SHIPPING_PER_UNIT) *
    BOM.GUITAR_STRINGS_PER_GUITAR;
  const pickupStage3 =
    (EMISSION_FACTORS.PICKUP_INTL_SHIPPING_PER_UNIT +
      EMISSION_FACTORS.PICKUP_DOMESTIC_SHIPPING_PER_UNIT) *
    BOM.PICKUPS_PER_GUITAR;

  const cradleToGravePcf =
    cradleToGatePcf +
    stringStage3 +
    pickupStage3 +
    EMISSION_FACTORS.CONSUMER_DELIVERY_PER_UNIT +
    EMISSION_FACTORS.PRODUCT_USE_PER_UNIT +
    EMISSION_FACTORS.PRODUCT_DISPOSAL_PER_UNIT;

  return {
    totalEmissions,
    emissionsByScope,
    emissionsByCompany,
    emissionsByPcfStage,
    emissionsByMonth,
    cradleToGatePcf,
    cradleToGravePcf,
  };
}
