// 지연, 실패 시뮬레이션이 포함된 페이크 API 함수
import { countries } from "@/data/country-data";
import { companies, posts } from "@/lib/fake-db";
import { Post, ExtendedGhgEmission } from "@/types/base-types";

import {
  processGuitarProduction,
  processDeliveryDistance,
  processPickupImport,
  processGuitarStringImport,
  mergeEmissions
} from "./emissions-calculator";
import { buildPostContent } from "./post-content-builder";

const _countries = [...countries];
const _companies = [...companies];
let _posts = [...posts];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const jitter = () => 200 + Math.random() * 600;
const maybeFail = () => Math.random() < 0.15;

export async function fetchCountries() {
  await delay(jitter());
  return _countries;
}

export async function fetchCompanies() {
  await delay(jitter());
  return _companies;
}

export async function fetchPosts() {
  await delay(jitter());
  return _posts;
}

export async function createOrUpdatePost(
  p: Omit<Post, "id"> & { id?: string }
) {
  await delay(jitter());
  if (maybeFail()) throw new Error("Save failed");
  if (p.id) {
    _posts = _posts.map((x) => (x.id === p.id ? (p as Post) : x));
    return p as Post;
  }
  const created = { ...p, id: crypto.randomUUID() };
  _posts = [..._posts, created];
  return created;
}



export async function submitEmissions(payload: { actionType: string; quantity: number; yearMonth: string }) {
  await delay(jitter());
  if (maybeFail()) throw new Error("Save failed");

  let map: Map<string, ExtendedGhgEmission[]>;
  switch (payload.actionType) {
    case "guitar_production":
      map = processGuitarProduction(payload.quantity, payload.yearMonth);
      break;
    case "delivery":
      map = processDeliveryDistance(payload.quantity, payload.yearMonth);
      break;
    case "pickup_import":
      map = processPickupImport(payload.quantity, payload.yearMonth);
      break;
    case "string_import":
      map = processGuitarStringImport(payload.quantity, payload.yearMonth);
      break;
    default:
      throw new Error("Invalid actionType");
  }

  const newPosts: Post[] = [];

  for (const [companyId, newEmissions] of Array.from(map.entries())) {
    const company = _companies.find((c) => c.id === companyId);
    if (company) {
      for (const e of newEmissions) {
        company.emissions = mergeEmissions(company.emissions, e);
      }
      
      let post:Post;
      const content = buildPostContent(company, newEmissions, payload.quantity);
      
      const existingPost = _posts.find((post) => post.resourceUid === company.id && post.dateTime === payload.yearMonth)
      
      if(existingPost){
        post = existingPost    
        post.content = `${post.content}\n${content}`;
      }else {
        post = {
          id: crypto.randomUUID(),
          title: `${company.name} ${payload.yearMonth} 배출 이력`,
          resourceUid: company.id,
          dateTime: payload.yearMonth,
          content,
        };

        _posts = [..._posts, post];
      }
      newPosts.push(post);
    }
  }

  return newPosts;
}

import { EMISSION_FACTORS, BOM } from "./constants";

const PCF_STAGE_NAMES: Record<number, string> = {
  1: "1단계: 원자재 생산 및 조달",
  2: "2단계: 제조 및 가공",
  3: "3단계: 유통 및 물류",
  4: "4단계: 제품 사용",
  5: "5단계: 제품 폐기",
};

export async function getDashboardStats(monthFilter?: string) {
  await delay(jitter());

  let totalEmissions = 0;
  const scopeMap = new Map<number, number>();
  const companyMap = new Map<string, number>();
  const stageMap = new Map<number, number>();
  const monthlyMap = new Map<string, number>();

  for (const company of _companies) {
    let companyTotal = 0;
    for (const e of company.emissions) {
      if (monthFilter && e.yearMonth !== monthFilter) {
        continue;
      }

      totalEmissions += e.emissions;
      companyTotal += e.emissions;

      scopeMap.set(e.scope, (scopeMap.get(e.scope) || 0) + e.emissions);
      stageMap.set(e.pcfStage, (stageMap.get(e.pcfStage) || 0) + e.emissions);
      
      const key = e.yearMonth;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + e.emissions);
    }
    companyMap.set(company.name, companyTotal);
  }

  // Calculate static PCF per unit
  const stringStage1 = EMISSION_FACTORS.GUITAR_STRING_PRODUCTION_PER_UNIT * BOM.GUITAR_STRINGS_PER_GUITAR;
  const pickupStage1 = EMISSION_FACTORS.PICKUP_PRODUCTION_PER_UNIT * BOM.PICKUPS_PER_GUITAR;
  const kenderStage2 = EMISSION_FACTORS.PRODUCTION_FOSSIL_FUEL_PER_UNIT + EMISSION_FACTORS.PRODUCTION_ELECTRICITY_PER_UNIT;

  const cradleToGatePcf = stringStage1 + pickupStage1 + kenderStage2;

  const stringStage3 = (EMISSION_FACTORS.GUITAR_STRING_INTL_SHIPPING_PER_UNIT + EMISSION_FACTORS.GUITAR_STRING_DOMESTIC_SHIPPING_PER_UNIT) * BOM.GUITAR_STRINGS_PER_GUITAR;
  const pickupStage3 = (EMISSION_FACTORS.PICKUP_INTL_SHIPPING_PER_UNIT + EMISSION_FACTORS.PICKUP_DOMESTIC_SHIPPING_PER_UNIT) * BOM.PICKUPS_PER_GUITAR;
  
  const cradleToGravePcf = cradleToGatePcf 
    + stringStage3 
    + pickupStage3 
    + EMISSION_FACTORS.CONSUMER_DELIVERY_PER_UNIT
    + EMISSION_FACTORS.PRODUCT_USE_PER_UNIT
    + EMISSION_FACTORS.PRODUCT_DISPOSAL_PER_UNIT;

  // Ordered Stages
  const emissionsByPcfStage = Array.from(stageMap.entries())
    .sort(([k1], [k2]) => k1 - k2)
    .map(([k, v]) => ({ name: PCF_STAGE_NAMES[k] || `Stage ${k}`, value: v }));

  // Last 12 months
  const now = new Date();
  const emissionsByMonth = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const key = `${y}-${m}`;
    emissionsByMonth.push({ name: key, value: monthlyMap.get(key) || 0 });
  }

  return {
    totalEmissions,
    emissionsByScope: Array.from(scopeMap.entries())
      .sort(([k1], [k2]) => k1 - k2)
      .map(([k, v]) => ({ name: `Scope ${k}`, value: v })),
    emissionsByCompany: Array.from(companyMap.entries()).map(([k, v]) => ({ name: k, value: v })),
    emissionsByPcfStage,
    emissionsByMonth,
    cradleToGatePcf,
    cradleToGravePcf,
  };
}
