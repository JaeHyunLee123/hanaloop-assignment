// 배출량 계산 및 분산 할당 비즈니스 로직 TDD 테스트
import { describe, it, expect } from "vitest";
import {
  processGuitarProduction,
  processDeliveryDistance,
  processPickupImport,
  processGuitarStringImport,
  mergeEmissions,
} from "@/lib/emissions-calculator";
import { EMISSION_FACTORS, COMPANY_IDS } from "@/lib/constants";
import { ExtendedGhgEmission } from "@/types/base-types";
import { roundTo4 } from "@/lib/utils";

const YM = "2026-05";

describe("emissions-calculator", () => {
  // ─── 2.1. 기타 생산량 입력 ───
  describe("processGuitarProduction", () => {
    it("10대 생산 시 Kender에 4건의 emission이 생성되어야 한다", () => {
      const result = processGuitarProduction(10, YM);
      const kenderEmissions = result.get(COMPANY_IDS.KENDER);

      expect(kenderEmissions).toBeDefined();
      expect(kenderEmissions).toHaveLength(4);
    });

    it("Scope 1(2단계) 화석연료 배출량이 정확히 산정되어야 한다", () => {
      const result = processGuitarProduction(10, YM);
      const kenderEmissions = result.get(COMPANY_IDS.KENDER)!;

      const scope1 = kenderEmissions.find(
        (e) => e.scope === 1 && e.pcfStage === 2
      );
      expect(scope1).toBeDefined();
      expect(roundTo4(scope1!.emissions)).toBe(
        roundTo4(10 * EMISSION_FACTORS.PRODUCTION_FOSSIL_FUEL_PER_UNIT)
      );
      expect(scope1!.yearMonth).toBe(YM);
      expect(scope1!.source).toBe("");
    });

    it("Scope 2(2단계) 전력 배출량이 정확히 산정되어야 한다", () => {
      const result = processGuitarProduction(10, YM);
      const kenderEmissions = result.get(COMPANY_IDS.KENDER)!;

      const scope2 = kenderEmissions.find(
        (e) => e.scope === 2 && e.pcfStage === 2
      );
      expect(scope2).toBeDefined();
      expect(roundTo4(scope2!.emissions)).toBe(
        roundTo4(10 * EMISSION_FACTORS.PRODUCTION_ELECTRICITY_PER_UNIT)
      );
    });

    it("Scope 3(4단계) 제품 사용 배출량이 정확히 산정되어야 한다", () => {
      const result = processGuitarProduction(10, YM);
      const kenderEmissions = result.get(COMPANY_IDS.KENDER)!;

      const scope3stage4 = kenderEmissions.find(
        (e) => e.scope === 3 && e.pcfStage === 4
      );
      expect(scope3stage4).toBeDefined();
      expect(roundTo4(scope3stage4!.emissions)).toBe(
        roundTo4(10 * EMISSION_FACTORS.PRODUCT_USE_PER_UNIT)
      );
    });

    it("Scope 3(5단계) 제품 폐기 배출량이 정확히 산정되어야 한다", () => {
      const result = processGuitarProduction(10, YM);
      const kenderEmissions = result.get(COMPANY_IDS.KENDER)!;

      const scope3stage5 = kenderEmissions.find(
        (e) => e.scope === 3 && e.pcfStage === 5
      );
      expect(scope3stage5).toBeDefined();
      expect(roundTo4(scope3stage5!.emissions)).toBe(
        roundTo4(10 * EMISSION_FACTORS.PRODUCT_DISPOSAL_PER_UNIT)
      );
    });

    it("Kender 이외의 회사에는 emission이 할당되지 않아야 한다", () => {
      const result = processGuitarProduction(10, YM);
      expect(result.size).toBe(1);
      expect(result.has(COMPANY_IDS.KENDER)).toBe(true);
    });
  });

  // ─── 2.2. 기타 배송 총 거리 입력 ───
  describe("processDeliveryDistance", () => {
    it("거리 입력 시 국내배송회사에 Scope 3(3단계) emission 1건이 생성되어야 한다", () => {
      const result = processDeliveryDistance(500, YM);
      const deliveryEmissions = result.get(COMPANY_IDS.KR_DELIVERY);

      expect(deliveryEmissions).toBeDefined();
      expect(deliveryEmissions).toHaveLength(1);
      expect(result.size).toBe(1);
    });

    it("배출량이 거리 × km당 배출계수로 정확히 산정되어야 한다", () => {
      const result = processDeliveryDistance(500, YM);
      const emission = result.get(COMPANY_IDS.KR_DELIVERY)![0];

      expect(emission.scope).toBe(3);
      expect(emission.pcfStage).toBe(3);
      expect(roundTo4(emission.emissions)).toBe(
        roundTo4(500 * EMISSION_FACTORS.DELIVERY_PER_KM)
      );
    });
  });

  // ─── 2.3. 픽업 수입 개수 입력 ───
  describe("processPickupImport", () => {
    it("3개 회사로 배출량이 분산되어야 한다", () => {
      const result = processPickupImport(100, YM);

      expect(result.has(COMPANY_IDS.ID_PICKUP)).toBe(true);
      expect(result.has(COMPANY_IDS.ID_IMPORT)).toBe(true);
      expect(result.has(COMPANY_IDS.KR_DELIVERY)).toBe(true);
      expect(result.size).toBe(3);
    });

    it("인도네시아픽업회사에 Scope 3(1단계) 부품 생산 배출량이 할당되어야 한다", () => {
      const result = processPickupImport(100, YM);
      const emission = result.get(COMPANY_IDS.ID_PICKUP)![0];

      expect(emission.scope).toBe(3);
      expect(emission.pcfStage).toBe(1);
      expect(roundTo4(emission.emissions)).toBe(
        roundTo4(100 * EMISSION_FACTORS.PICKUP_PRODUCTION_PER_UNIT)
      );
    });

    it("인도네시아수입회사에 Scope 3(3단계) 국제 운송 배출량이 할당되어야 한다", () => {
      const result = processPickupImport(100, YM);
      const emission = result.get(COMPANY_IDS.ID_IMPORT)![0];

      expect(emission.scope).toBe(3);
      expect(emission.pcfStage).toBe(3);
      expect(roundTo4(emission.emissions)).toBe(
        roundTo4(100 * EMISSION_FACTORS.PICKUP_INTL_SHIPPING_PER_UNIT)
      );
    });

    it("국내배송회사에 Scope 3(3단계) 국내 운송 배출량이 할당되어야 한다", () => {
      const result = processPickupImport(100, YM);
      const emission = result.get(COMPANY_IDS.KR_DELIVERY)![0];

      expect(emission.scope).toBe(3);
      expect(emission.pcfStage).toBe(3);
      expect(roundTo4(emission.emissions)).toBe(
        roundTo4(100 * EMISSION_FACTORS.PICKUP_DOMESTIC_SHIPPING_PER_UNIT)
      );
    });

    it("모든 emission의 Scope가 3이어야 한다 (Kender 기준 치환)", () => {
      const result = processPickupImport(100, YM);
      for (const [, emissions] of result) {
        for (const e of emissions) {
          expect(e.scope).toBe(3);
        }
      }
    });
  });

  // ─── 2.3. 기타줄 수입 개수 입력 ───
  describe("processGuitarStringImport", () => {
    it("3개 회사로 배출량이 분산되어야 한다", () => {
      const result = processGuitarStringImport(200, YM);

      expect(result.has(COMPANY_IDS.CN_GUITAR_STRING)).toBe(true);
      expect(result.has(COMPANY_IDS.CN_IMPORT)).toBe(true);
      expect(result.has(COMPANY_IDS.KR_DELIVERY)).toBe(true);
      expect(result.size).toBe(3);
    });

    it("중국기타줄회사에 Scope 3(1단계) 부품 생산 배출량이 할당되어야 한다", () => {
      const result = processGuitarStringImport(200, YM);
      const emission = result.get(COMPANY_IDS.CN_GUITAR_STRING)![0];

      expect(emission.scope).toBe(3);
      expect(emission.pcfStage).toBe(1);
      expect(roundTo4(emission.emissions)).toBe(
        roundTo4(200 * EMISSION_FACTORS.GUITAR_STRING_PRODUCTION_PER_UNIT)
      );
    });

    it("중국수입회사에 Scope 3(3단계) 국제 운송 배출량이 할당되어야 한다", () => {
      const result = processGuitarStringImport(200, YM);
      const emission = result.get(COMPANY_IDS.CN_IMPORT)![0];

      expect(emission.scope).toBe(3);
      expect(emission.pcfStage).toBe(3);
      expect(roundTo4(emission.emissions)).toBe(
        roundTo4(200 * EMISSION_FACTORS.GUITAR_STRING_INTL_SHIPPING_PER_UNIT)
      );
    });

    it("국내배송회사에 Scope 3(3단계) 국내 운송 배출량이 할당되어야 한다", () => {
      const result = processGuitarStringImport(200, YM);
      const emission = result.get(COMPANY_IDS.KR_DELIVERY)![0];

      expect(emission.scope).toBe(3);
      expect(emission.pcfStage).toBe(3);
      expect(roundTo4(emission.emissions)).toBe(
        roundTo4(
          200 * EMISSION_FACTORS.GUITAR_STRING_DOMESTIC_SHIPPING_PER_UNIT
        )
      );
    });
  });

  // ─── 2.4. 마이너스(-) 차감 입력 ───
  describe("마이너스 입력 (Rollback)", () => {
    it("생산량 음수 입력 시 배출량이 음수로 산정되어야 한다", () => {
      const result = processGuitarProduction(-5, YM);
      const kenderEmissions = result.get(COMPANY_IDS.KENDER)!;

      for (const e of kenderEmissions) {
        expect(e.emissions).toBeLessThan(0);
      }
    });

    it("수입 개수 음수 입력 시 모든 분산 배출량이 음수로 산정되어야 한다", () => {
      const result = processPickupImport(-10, YM);
      for (const [, emissions] of result) {
        for (const e of emissions) {
          expect(e.emissions).toBeLessThan(0);
        }
      }
    });

    it("배송 거리 음수 입력 시 배출량이 음수로 산정되어야 한다", () => {
      const result = processDeliveryDistance(-100, YM);
      const emission = result.get(COMPANY_IDS.KR_DELIVERY)![0];
      expect(emission.emissions).toBeLessThan(0);
    });
  });

  // ─── mergeEmissions: 합산 로직 ───
  describe("mergeEmissions", () => {
    it("yearMonth, source, scope, pcfStage가 모두 일치하면 합산되어야 한다", () => {
      const existing: ExtendedGhgEmission[] = [
        { yearMonth: YM, source: "", emissions: 1.0, scope: 1, pcfStage: 2 },
      ];
      const newEmission: ExtendedGhgEmission = {
        yearMonth: YM,
        source: "",
        emissions: 0.5,
        scope: 1,
        pcfStage: 2,
      };

      const result = mergeEmissions(existing, newEmission);

      expect(result).toHaveLength(1);
      expect(result[0].emissions).toBe(1.5);
    });

    it("scope가 다르면 새 레코드로 추가되어야 한다", () => {
      const existing: ExtendedGhgEmission[] = [
        { yearMonth: YM, source: "", emissions: 1.0, scope: 1, pcfStage: 2 },
      ];
      const newEmission: ExtendedGhgEmission = {
        yearMonth: YM,
        source: "",
        emissions: 0.5,
        scope: 2,
        pcfStage: 2,
      };

      const result = mergeEmissions(existing, newEmission);

      expect(result).toHaveLength(2);
    });

    it("pcfStage가 다르면 새 레코드로 추가되어야 한다", () => {
      const existing: ExtendedGhgEmission[] = [
        { yearMonth: YM, source: "", emissions: 1.0, scope: 3, pcfStage: 3 },
      ];
      const newEmission: ExtendedGhgEmission = {
        yearMonth: YM,
        source: "",
        emissions: 0.5,
        scope: 3,
        pcfStage: 4,
      };

      const result = mergeEmissions(existing, newEmission);

      expect(result).toHaveLength(2);
    });

    it("yearMonth가 다르면 새 레코드로 추가되어야 한다", () => {
      const existing: ExtendedGhgEmission[] = [
        {
          yearMonth: "2026-04",
          source: "",
          emissions: 1.0,
          scope: 1,
          pcfStage: 2,
        },
      ];
      const newEmission: ExtendedGhgEmission = {
        yearMonth: "2026-05",
        source: "",
        emissions: 0.5,
        scope: 1,
        pcfStage: 2,
      };

      const result = mergeEmissions(existing, newEmission);

      expect(result).toHaveLength(2);
    });

    it("마이너스 합산 후 배출량이 감소되어야 한다", () => {
      const existing: ExtendedGhgEmission[] = [
        { yearMonth: YM, source: "", emissions: 2.0, scope: 3, pcfStage: 3 },
      ];
      const newEmission: ExtendedGhgEmission = {
        yearMonth: YM,
        source: "",
        emissions: -0.5,
        scope: 3,
        pcfStage: 3,
      };

      const result = mergeEmissions(existing, newEmission);

      expect(result).toHaveLength(1);
      expect(result[0].emissions).toBe(1.5);
    });

    it("빈 배열에 새 emission 추가 시 1건이 되어야 한다", () => {
      const existing: ExtendedGhgEmission[] = [];
      const newEmission: ExtendedGhgEmission = {
        yearMonth: YM,
        source: "",
        emissions: 1.0,
        scope: 1,
        pcfStage: 2,
      };

      const result = mergeEmissions(existing, newEmission);

      expect(result).toHaveLength(1);
      expect(result[0].emissions).toBe(1.0);
    });
  });
});
