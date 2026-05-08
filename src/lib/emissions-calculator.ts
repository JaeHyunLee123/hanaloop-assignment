// 탄소 배출량 자동 계산 및 Company별 분산 할당 핵심 비즈니스 로직
import { ExtendedGhgEmission } from "@/types/base-types";
import { EMISSION_FACTORS, COMPANY_IDS } from "@/lib/constants";
import { roundTo4 } from "@/lib/utils";

/**
 * ExtendedGhgEmission 객체를 생성하는 헬퍼
 */
function createEmission(
  yearMonth: string,
  scope: 1 | 2 | 3,
  pcfStage: 1 | 2 | 3 | 4 | 5,
  emissions: number
): ExtendedGhgEmission {
  return {
    yearMonth,
    source: "",
    scope,
    pcfStage,
    emissions: roundTo4(emissions),
  };
}

/**
 * 기타 생산량 입력 시 배출량 계산.
 * Kender에 Scope 1(2단계), Scope 2(2단계), Scope 3(4단계), Scope 3(5단계) 할당.
 */
export function processGuitarProduction(
  quantity: number,
  yearMonth: string
): Map<string, ExtendedGhgEmission[]> {
  const result = new Map<string, ExtendedGhgEmission[]>();

  result.set(COMPANY_IDS.KENDER, [
    createEmission(yearMonth, 1, 2, quantity * EMISSION_FACTORS.PRODUCTION_FOSSIL_FUEL_PER_UNIT),
    createEmission(yearMonth, 2, 2, quantity * EMISSION_FACTORS.PRODUCTION_ELECTRICITY_PER_UNIT),
    createEmission(yearMonth, 3, 4, quantity * EMISSION_FACTORS.PRODUCT_USE_PER_UNIT),
    createEmission(yearMonth, 3, 5, quantity * EMISSION_FACTORS.PRODUCT_DISPOSAL_PER_UNIT),
  ]);

  return result;
}

/**
 * 기타 배송 총 거리 입력 시 배출량 계산.
 * 국내배송회사에 Scope 3(3단계) 할당.
 */
export function processDeliveryDistance(
  distanceKm: number,
  yearMonth: string
): Map<string, ExtendedGhgEmission[]> {
  const result = new Map<string, ExtendedGhgEmission[]>();

  result.set(COMPANY_IDS.KR_DELIVERY, [
    createEmission(yearMonth, 3, 3, distanceKm * EMISSION_FACTORS.DELIVERY_PER_KM),
  ]);

  return result;
}

/**
 * 픽업 수입 개수 입력 시 배출량 계산.
 * 인도네시아픽업회사(1단계), 인도네시아수입회사(3단계), 국내배송회사(3단계) 분산 할당.
 */
export function processPickupImport(
  quantity: number,
  yearMonth: string
): Map<string, ExtendedGhgEmission[]> {
  const result = new Map<string, ExtendedGhgEmission[]>();

  result.set(COMPANY_IDS.ID_PICKUP, [
    createEmission(yearMonth, 3, 1, quantity * EMISSION_FACTORS.PICKUP_PRODUCTION_PER_UNIT),
  ]);

  result.set(COMPANY_IDS.ID_IMPORT, [
    createEmission(yearMonth, 3, 3, quantity * EMISSION_FACTORS.PICKUP_INTL_SHIPPING_PER_UNIT),
  ]);

  result.set(COMPANY_IDS.KR_DELIVERY, [
    createEmission(yearMonth, 3, 3, quantity * EMISSION_FACTORS.PICKUP_DOMESTIC_SHIPPING_PER_UNIT),
  ]);

  return result;
}

/**
 * 기타줄 수입 개수 입력 시 배출량 계산.
 * 중국기타줄회사(1단계), 중국수입회사(3단계), 국내배송회사(3단계) 분산 할당.
 */
export function processGuitarStringImport(
  quantity: number,
  yearMonth: string
): Map<string, ExtendedGhgEmission[]> {
  const result = new Map<string, ExtendedGhgEmission[]>();

  result.set(COMPANY_IDS.CN_GUITAR_STRING, [
    createEmission(yearMonth, 3, 1, quantity * EMISSION_FACTORS.GUITAR_STRING_PRODUCTION_PER_UNIT),
  ]);

  result.set(COMPANY_IDS.CN_IMPORT, [
    createEmission(yearMonth, 3, 3, quantity * EMISSION_FACTORS.GUITAR_STRING_INTL_SHIPPING_PER_UNIT),
  ]);

  result.set(COMPANY_IDS.KR_DELIVERY, [
    createEmission(yearMonth, 3, 3, quantity * EMISSION_FACTORS.GUITAR_STRING_DOMESTIC_SHIPPING_PER_UNIT),
  ]);

  return result;
}

/**
 * 기존 emissions 배열에 새 emission을 병합.
 * yearMonth, source, scope, pcfStage가 모두 일치하면 합산, 아니면 새 레코드로 추가.
 * 원본 배열을 변경하지 않고 새 배열을 반환.
 */
export function mergeEmissions(
  existing: ExtendedGhgEmission[],
  newEmission: ExtendedGhgEmission
): ExtendedGhgEmission[] {
  const matchIndex = existing.findIndex(
    (e) =>
      e.yearMonth === newEmission.yearMonth &&
      e.source === newEmission.source &&
      e.scope === newEmission.scope &&
      e.pcfStage === newEmission.pcfStage
  );

  if (matchIndex >= 0) {
    return existing.map((e, i) =>
      i === matchIndex
        ? { ...e, emissions: e.emissions + newEmission.emissions }
        : e
    );
  }

  return [...existing, newEmission];
}
