// 탄소 배출량 계산에 사용되는 배출계수 및 BOM 상수 정의

/**
 * 배출계수(Emission Factors) 상수
 *
 * MVP용 가상 데이터이며, 실제 LCA 데이터가 확보되면 교체 예정.
 * 모든 단위: tCO2e (톤 CO2 환산)
 */
export const EMISSION_FACTORS = {
  // ─── Scope 1: 직접 배출 (Kender 자사 제조, 2단계) ───
  // 기타 1대 제조 시 화석연료(디젤) 연소 배출계수
  // 가정: 기타 1대 제조에 약 5L 디젤 사용
  // 출처: IPCC 2006 Guidelines, Vol.2 Ch.2 Table 2.3 - Diesel: 74,100 kgCO2/TJ
  //       US EPA GHG Emission Factors Hub - 디젤 약 2.68 kgCO2/L
  // 계산: 5L × 2.68 kgCO2/L = 13.4 kgCO2 = 0.0134 tCO2e
  PRODUCTION_FOSSIL_FUEL_PER_UNIT: 0.0134, // tCO2e/대

  // ─── Scope 2: 간접 배출 (Kender 전력 사용, 2단계) ───
  // 기타 1대 제조 시 전력 사용 배출계수
  // 가정: 기타 1대 제조에 약 50kWh 전력 사용
  // 출처: 환경부/온실가스종합정보센터(GIR) 2023년 전력 배출계수 0.4173 tCO2eq/MWh
  // 계산: 50kWh × 0.0004173 tCO2e/kWh = 0.0209 tCO2e
  PRODUCTION_ELECTRICITY_PER_UNIT: 0.0209, // tCO2e/대

  // ─── Scope 3, 4단계: 제품 사용 ───
  // 전기기타 사용 시 앰프 전력 소비 기반 배출계수 (전체 수명 기준 1회 계상)
  // 가정: 100W 앰프, 하루 1시간, 10년 수명 → 365kWh/년 × 10년 = 3,650kWh
  // 출처: 한국 전력 배출계수 0.4173 kgCO2e/kWh (GIR 2023)
  // 계산: 3,650kWh × 0.0004173 tCO2e/kWh = 1.523 tCO2e
  PRODUCT_USE_PER_UNIT: 1.523, // tCO2e/대

  // ─── Scope 3, 5단계: 제품 폐기 ───
  // 전기기타 폐기 시 WEEE 처리 배출계수
  // 가정: 기타 무게 약 4kg
  // 출처: UK DEFRA GHG Conversion Factors 2023 - WEEE 혼합 폐기물 처리
  // MVP 조정: 운송 및 처리 에너지 포함하여 0.05 tCO2e/대로 설정
  PRODUCT_DISPOSAL_PER_UNIT: 0.05, // tCO2e/대

  // ─── 소비자 배송 (국내배송회사, Scope 3, 3단계) ───
  // 출처: GLEC Framework / GHG Protocol - 한국 중형 트럭 평균 0.062 kgCO2e/t-km
  // 가정: 기타 1대 약 4kg, 평균 적재율 고려
  // MVP 단순화: km당 고정 배출계수
  DELIVERY_PER_KM: 0.00021, // tCO2e/km
  
  // 과거 데이터 기반 평균 예상 배송 거리
  AVERAGE_DELIVERY_DISTANCE_PER_UNIT: 50, // km/대
  // 소비자 배송 1대당 배출계수 (거리 * 계수)
  CONSUMER_DELIVERY_PER_UNIT: 50 * 0.00021, // tCO2e/대

  // ─── 부품 생산 배출계수 (Scope 3, 1단계) ───
  // 기타줄 1세트 생산 시 Cradle-to-gate 배출계수
  // 출처: 공급원별 산정 방법 (Supplier-specific method) 가정치
  GUITAR_STRING_PRODUCTION_PER_UNIT: 0.005, // tCO2e/세트

  // 픽업 1세트 생산 시 Cradle-to-gate 배출계수
  // 출처: 공급원별 산정 방법 (Supplier-specific method) 가정치
  PICKUP_PRODUCTION_PER_UNIT: 0.008, // tCO2e/세트

  // ─── 국제 운송 배출계수 (Scope 3, 3단계) ───
  // 기타줄 1세트 국제 해상 운송 (중국→한국)
  // 출처: IMO, UK DEFRA - 컨테이너선 평균 0.016 kgCO2e/t-km
  // 가정: 기타줄 세트 0.5kg, 해상 거리 약 1,000km, 포장/항만 작업 포함
  GUITAR_STRING_INTL_SHIPPING_PER_UNIT: 0.003, // tCO2e/세트

  // 픽업 1세트 국제 해상 운송 (인도네시아→한국)
  // 가정: 픽업 세트 0.3kg, 해상 거리 약 5,000km, 포장/항만 작업 포함
  PICKUP_INTL_SHIPPING_PER_UNIT: 0.005, // tCO2e/세트

  // ─── 국내 내륙 운송 배출계수 (국내배송회사, Scope 3, 3단계) ───
  // 부품 수입 후 항구→공장 내륙 운송
  // 출처: GLEC Framework - 한국 트럭 0.062 kgCO2e/t-km
  // MVP 단순화: 단위당 고정값
  GUITAR_STRING_DOMESTIC_SHIPPING_PER_UNIT: 0.001, // tCO2e/세트
  PICKUP_DOMESTIC_SHIPPING_PER_UNIT: 0.002, // tCO2e/세트
} as const;

/**
 * BOM (Bill of Materials) - 표준 부품 비율
 *
 * 기타 1대 생산에 필요한 표준 부품 수량.
 * 대시보드에서 제품 단위당 PCF 산출 시에만 사용됨.
 * 재고 변동으로 인한 단위당 배출량 왜곡 방지 목적.
 */
export const BOM = {
  GUITAR_STRINGS_PER_GUITAR: 1, // 기타줄 세트/대
  PICKUPS_PER_GUITAR: 1, // 픽업 세트/대
} as const;

/**
 * 회사 ID 상수 (Company.id와 일치)
 */
export const COMPANY_IDS = {
  KENDER: "kender",
  CN_GUITAR_STRING: "cn-guitar-string",
  ID_PICKUP: "id-pickup",
  CN_IMPORT: "cn-import",
  ID_IMPORT: "id-import",
  KR_DELIVERY: "kr-delivery",
} as const;
