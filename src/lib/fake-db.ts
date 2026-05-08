// 페이크 인메모리 DB: 고정 6개 회사, 더미 배출 및 포스트 데이터
import { Company, ExtendedGhgEmission, Post } from "@/types/base-types";

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

const yearMonths = generateYearMonths(2025, 1, 2026, 4);

// 시드 기반 의사 난수 (재현 가능한 더미 데이터)
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function randBetween(min: number, max: number): number {
  return Math.round((min + rand() * (max - min)) * 100) / 100;
}

// --- Kender 배출 데이터 생성 ---
// Scope 1 (2단계: 제조), Scope 2 (2단계: 전력), Scope 3 (4단계: 사용, 5단계: 폐기)
function generateKenderEmissions(): ExtendedGhgEmission[] {
  const emissions: ExtendedGhgEmission[] = [];
  for (const ym of yearMonths) {
    emissions.push(
      { yearMonth: ym, source: "", emissions: randBetween(5, 15), scope: 1, pcfStage: 2 },
      { yearMonth: ym, source: "", emissions: randBetween(8, 20), scope: 2, pcfStage: 2 },
      { yearMonth: ym, source: "", emissions: randBetween(2, 8), scope: 3, pcfStage: 4 },
      { yearMonth: ym, source: "", emissions: randBetween(1, 4), scope: 3, pcfStage: 5 }
    );
  }
  return emissions;
}

// --- 중국기타줄회사 배출 데이터 (Scope 3, 1단계: 원자재 생산) ---
function generateCnStringEmissions(): ExtendedGhgEmission[] {
  const emissions: ExtendedGhgEmission[] = [];
  for (const ym of yearMonths) {
    emissions.push({
      yearMonth: ym, source: "", emissions: randBetween(3, 10), scope: 3, pcfStage: 1,
    });
  }
  return emissions;
}

// --- 인도네시아픽업회사 배출 데이터 (Scope 3, 1단계: 원자재 생산) ---
function generateIdPickupEmissions(): ExtendedGhgEmission[] {
  const emissions: ExtendedGhgEmission[] = [];
  for (const ym of yearMonths) {
    emissions.push({
      yearMonth: ym, source: "", emissions: randBetween(4, 12), scope: 3, pcfStage: 1,
    });
  }
  return emissions;
}

// --- 중국수입회사 배출 데이터 (Scope 3, 3단계: 국제 운송) ---
function generateCnImportEmissions(): ExtendedGhgEmission[] {
  const emissions: ExtendedGhgEmission[] = [];
  for (const ym of yearMonths) {
    emissions.push({
      yearMonth: ym, source: "", emissions: randBetween(2, 7), scope: 3, pcfStage: 3,
    });
  }
  return emissions;
}

// --- 인도네시아수입회사 배출 데이터 (Scope 3, 3단계: 국제 운송) ---
function generateIdImportEmissions(): ExtendedGhgEmission[] {
  const emissions: ExtendedGhgEmission[] = [];
  for (const ym of yearMonths) {
    emissions.push({
      yearMonth: ym, source: "", emissions: randBetween(3, 9), scope: 3, pcfStage: 3,
    });
  }
  return emissions;
}

// --- 국내배송회사 배출 데이터 (Scope 3, 3단계: 국내 운송 + 소비자 배송) ---
function generateKrDeliveryEmissions(): ExtendedGhgEmission[] {
  const emissions: ExtendedGhgEmission[] = [];
  for (const ym of yearMonths) {
    emissions.push(
      { yearMonth: ym, source: "", emissions: randBetween(1, 5), scope: 3, pcfStage: 3 },
      { yearMonth: ym, source: "", emissions: randBetween(1, 4), scope: 3, pcfStage: 3 }
    );
  }
  return emissions;
}

// --- 회사 데이터 조립 ---
COMPANY_KENDER.emissions = generateKenderEmissions();
COMPANY_CN_STRING.emissions = generateCnStringEmissions();
COMPANY_ID_PICKUP.emissions = generateIdPickupEmissions();
COMPANY_CN_IMPORT.emissions = generateCnImportEmissions();
COMPANY_ID_IMPORT.emissions = generateIdImportEmissions();
COMPANY_KR_DELIVERY.emissions = generateKrDeliveryEmissions();

export const companies: Company[] = [
  COMPANY_KENDER,
  COMPANY_CN_STRING,
  COMPANY_ID_PICKUP,
  COMPANY_CN_IMPORT,
  COMPANY_ID_IMPORT,
  COMPANY_KR_DELIVERY,
];

// --- Post 더미 데이터 생성 ---
function generatePosts(): Post[] {
  const result: Post[] = [];
  let postId = 1;

  for (const company of companies) {
    // 각 회사별로 3개월에 1건씩 Post 생성
    for (let i = 0; i < yearMonths.length; i += 3) {
      const ym = yearMonths[i];
      const totalEmissions = company.emissions
        .filter((e) => e.yearMonth === ym)
        .reduce((sum, e) => sum + e.emissions, 0)
        .toFixed(2);

      result.push({
        id: `post-${postId++}`,
        title: `${company.name} ${ym} 통합 배출 이력`,
        resourceUid: company.id,
        dateTime: ym,
        content: `기타 ${Math.floor(rand() * 20 + 5)}대 생산, ${totalEmissions}tCO2e 배출`,
      });
    }
  }

  return result;
}

export const posts: Post[] = generatePosts();
