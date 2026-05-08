// 회사별 Post content 문자열을 생성하는 유틸리티 함수
import { Company, ExtendedGhgEmission } from "@/types/base-types";

function sumEmissions(emissions: ExtendedGhgEmission[]): string {
  return emissions.reduce((sum, e) => sum + e.emissions, 0).toFixed(2);
}

/**
 * 회사 ID와 해당 월의 emission, 생산/수입 수량을 기반으로
 * PRD에 정의된 형식의 Post content 문자열을 생성한다.
 */
export function buildPostContent(
  company: Company,
  monthEmissions: ExtendedGhgEmission[],
  quantity: number
): string {
  const total = sumEmissions(monthEmissions);

  switch (company.id) {
    case "kender":
      return `기타 ${quantity}대 생산, ${total}tCO2e 배출`;

    case "cn-guitar-string":
      return `기타줄 ${quantity}세트 생산, ${total}tCO2e 배출`;

    case "id-pickup":
      return `픽업 ${quantity}세트 생산, ${total}tCO2e 배출`;

    case "cn-import":
      return `기타줄 ${quantity}세트 수입, ${total}tCO2e 배출`;

    case "id-import":
      return `픽업 ${quantity}세트 수입, ${total}tCO2e 배출`;

    case "kr-delivery": {
      // 국내배송회사는 3건의 운송 이력을 줄바꿈으로 누적
      const stringQty = Math.ceil(quantity * 0.8);
      const pickupQty = Math.ceil(quantity * 0.5);
      const deliveryKm = Math.ceil(quantity * 12);
      const emissionEntries = monthEmissions;
      const perEntry = (
        emissionEntries.reduce((s, e) => s + e.emissions, 0) / 3
      ).toFixed(2);
      return [
        `기타줄 ${stringQty}개 운송, ${perEntry}tCO2e 배출`,
        `픽업 ${pickupQty}개 운송, ${perEntry}tCO2e 배출`,
        `기타 배송 총 ${deliveryKm}km 운송, ${perEntry}tCO2e 배출`,
      ].join("\n");
    }

    default:
      return `${total}tCO2e 배출`;
  }
}
