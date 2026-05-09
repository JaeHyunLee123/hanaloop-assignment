import { Company, Post } from "@/types/base-types";
import { applyEmissions } from "./emission-service";

// --- 고정 6개 Company ---
const COMPANY_KENDER: Company = {
  id: "kender",
  name: "Kender",
  country: "KR",
  emissions: [],
};

const COMPANY_CN_STRING: Company = {
  id: "cn-guitar-string",
  name: "중국기타줄회사",
  country: "CN",
  emissions: [],
};

const COMPANY_ID_PICKUP: Company = {
  id: "id-pickup",
  name: "인도네시아픽업회사",
  country: "ID",
  emissions: [],
};

const COMPANY_CN_IMPORT: Company = {
  id: "cn-import",
  name: "중국수입회사",
  country: "CN",
  emissions: [],
};

const COMPANY_ID_IMPORT: Company = {
  id: "id-import",
  name: "인도네시아수입회사",
  country: "ID",
  emissions: [],
};

const COMPANY_KR_DELIVERY: Company = {
  id: "kr-delivery",
  name: "국내배송회사",
  country: "KR",
  emissions: [],
};

export const companies: Company[] = [
  COMPANY_KENDER,
  COMPANY_CN_STRING,
  COMPANY_ID_PICKUP,
  COMPANY_CN_IMPORT,
  COMPANY_ID_IMPORT,
  COMPANY_KR_DELIVERY,
];

export const posts: Post[] = [];

// --- 더미 데이터 생성 헬퍼 ---
function generateYearMonths(
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
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

// 시드 기반 의사 난수 (재현 가능한 더미 데이터)
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

// --- 시딩 실행 ---
const yearMonths = generateYearMonths(2025, 1, new Date().getFullYear(), new Date().getMonth());

for (const ym of yearMonths) {
  // 1. 기타 생산 (Kender 배출 및 사용/폐기 단계 배출 발생)
  applyEmissions(companies, posts, {
    actionType: "guitar_production",
    quantity: randBetween(50, 150),
    yearMonth: ym,
  });

  // 2. 픽업 수입 (인도네시아 업체들 및 국내 배송 배출 발생)
  applyEmissions(companies, posts, {
    actionType: "pickup_import",
    quantity: randBetween(100, 300),
    yearMonth: ym,
  });

  // 3. 기타줄 수입 (중국 업체들 및 국내 배송 배출 발생)
  applyEmissions(companies, posts, {
    actionType: "string_import",
    quantity: randBetween(200, 500),
    yearMonth: ym,
  });

  // 4. 추가 배송 활동 (국내배송회사 거리 기반 배출 발생)
  applyEmissions(companies, posts, {
    actionType: "delivery",
    quantity: randBetween(500, 2000, false),
    yearMonth: ym,
  });
}
