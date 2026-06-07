/* eslint-disable @typescript-eslint/no-explicit-any */
// 데이터베이스 초기 국가, 회사 정보 및 탄소 배출 이력 데이터 시딩
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./index";
import { countries, companies, emissions, posts } from "./schema";
import {
  processGuitarProduction,
  processDeliveryDistance,
  processPickupImport,
  processGuitarStringImport,
} from "../lib/emissions-calculator";
import { buildPostContent } from "../lib/post-content-builder";
import { sql } from "drizzle-orm";
import crypto from "crypto";

// --- 더미 데이터 생성 헬퍼 ---
function generateYearMonths(
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number,
): string[] {
  const result: string[] = [];
  let y = startYear;
  let m = startMonth;
  while (y < endYear || (y === endYear && m <= endMonth)) {
    result.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return result;
}

// 시드 기반 의사 난수
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function randBetween(min: number, max: number, isInt = true): number {
  const val = min + rand() * (max - min);
  return isInt ? Math.floor(val) : Math.round(val * 100) / 100;
}

const staticCompanies = [
  { id: "kender", name: "Kender", countryCode: "KR" },
  { id: "cn-guitar-string", name: "중국기타줄회사", countryCode: "CN" },
  { id: "id-pickup", name: "인도네시아픽업회사", countryCode: "ID" },
  { id: "cn-import", name: "중국수입회사", countryCode: "CN" },
  { id: "id-import", name: "인도네시아수입회사", countryCode: "ID" },
  { id: "kr-delivery", name: "국내배송회사", countryCode: "KR" },
];

const staticCountries = [
  { code: "KR", name: "대한민국" },
  { code: "CN", name: "중국" },
  { code: "ID", name: "인도네시아" },
];

async function main() {
  console.log("시딩을 시작합니다...");

  // 1. 테이블 초기화 (Cascade 처리가 되어 있어 기존 데이터를 비웁니다.)
  await db.delete(posts);
  await db.delete(emissions);
  await db.delete(companies);
  await db.delete(countries);

  console.log("기존 테이블 데이터를 초기화했습니다.");

  // 2. 국가 및 회사 데이터 삽입
  await db.insert(countries).values(staticCountries);
  await db.insert(companies).values(staticCompanies);
  console.log("국가 및 회사 초기 데이터를 삽입했습니다.");

  // 3. 2025-01부터 현재 전월까지의 연월 목록 생성
  const now = new Date();
  const yearMonths = generateYearMonths(
    2025,
    1,
    now.getFullYear(),
    now.getMonth(),
  );

  // 임시 메모리 구조 생성 (배출량 누적용 및 포스트 빌더용)
  const localCompaniesState = staticCompanies.map((c) => ({
    id: c.id,
    name: c.name,
    country: c.countryCode,
    emissions: [] as any[],
  }));

  // 포스트 내용 맵 (월/회사별 본문)
  const postsMap = new Map<string, { title: string; content: string }>();

  // Drizzle 스키마에서는 emissions 테이블에 upsert를 할 것이므로,
  // 시딩할 배출 내역을 매월 생성 후 DB에 직접 Insert/Upsert합니다.
  for (const ym of yearMonths) {
    const payloads = [
      {
        actionType: "guitar_production" as const,
        quantity: randBetween(50, 150),
        itemType: "guitar" as const,
      },
      {
        actionType: "pickup_import" as const,
        quantity: randBetween(100, 300),
        itemType: "pickup" as const,
      },
      {
        actionType: "string_import" as const,
        quantity: randBetween(200, 500),
        itemType: "string" as const,
      },
      {
        actionType: "delivery" as const,
        quantity: randBetween(500, 2000, false),
        itemType: "guitar" as const,
      },
    ];

    for (const payload of payloads) {
      let emissionMap: Map<string, any[]>;
      switch (payload.actionType) {
        case "guitar_production":
          emissionMap = processGuitarProduction(payload.quantity, ym);
          break;
        case "pickup_import":
          emissionMap = processPickupImport(payload.quantity, ym);
          break;
        case "string_import":
          emissionMap = processGuitarStringImport(payload.quantity, ym);
          break;
        case "delivery":
          emissionMap = processDeliveryDistance(payload.quantity, ym);
          break;
      }

      for (const [companyId, newEmissions] of Array.from(
        emissionMap.entries(),
      )) {
        const localCompany = localCompaniesState.find(
          (c) => c.id === companyId,
        );
        if (!localCompany) continue;

        // 배출 데이터를 DB에 Upsert (ON CONFLICT DO UPDATE)
        for (const e of newEmissions) {
          // 로컬 상태에도 반영 (포스트 빌드 및 누적 데이터 전달용)
          const existing = localCompany.emissions.find(
            (le) =>
              le.yearMonth === e.yearMonth &&
              le.source === e.source &&
              le.scope === e.scope &&
              le.pcfStage === e.pcfStage,
          );
          if (existing) {
            existing.emissions += e.emissions;
          } else {
            localCompany.emissions.push({ ...e });
          }

          // DB Upsert
          await db
            .insert(emissions)
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
                emissions.companyId,
                emissions.yearMonth,
                emissions.source,
                emissions.scope,
                emissions.pcfStage,
              ],
              set: {
                emissions: sql`emissions.emissions + ${e.emissions}`,
              },
            });
        }

        // 포스트 빌드
        const content = buildPostContent(
          localCompany,
          newEmissions,
          payload.quantity,
          payload.itemType,
        );
        const postKey = `${companyId}_${ym}`;
        const existingPost = postsMap.get(postKey);
        if (existingPost) {
          existingPost.content = `${existingPost.content}\n${content}`;
        } else {
          postsMap.set(postKey, {
            title: `${localCompany.name} ${ym} 배출 이력`,
            content,
          });
        }
      }
    }
  }

  // 생성된 포스트 일괄 삽입
  for (const [key, val] of Array.from(postsMap.entries())) {
    const [companyId, ym] = key.split("_");
    await db.insert(posts).values({
      id: crypto.randomUUID(),
      title: val.title,
      resourceUid: companyId,
      dateTime: ym,
      content: val.content,
    });
  }

  console.log("시딩이 성공적으로 완료되었습니다.");
}

main().catch((err) => {
  console.error("시딩 중 오류가 발생했습니다:", err);
  process.exit(1);
});
