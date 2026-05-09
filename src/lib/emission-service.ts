// 탄소 배출 액션을 실제 데이터에 적용하는 핵심 서비스 로직
import { Company, Post, ExtendedGhgEmission } from "@/types/base-types";
import {
  processGuitarProduction,
  processDeliveryDistance,
  processPickupImport,
  processGuitarStringImport,
  mergeEmissions
} from "./emissions-calculator";
import { buildPostContent, PayloadItemType } from "./post-content-builder";

type PayloadActionType = "guitar_production" | "delivery" | "pickup_import" | "string_import";


export interface EmissionPayload {
  actionType: PayloadActionType;
  quantity: number;
  yearMonth: string;
}

/**
 * 주어진 배출 액션 페이로드를 바탕으로 회사 데이터와 포스트 데이터를 업데이트합니다.
 * 이 함수는 동기적으로 작동하며 외부 API 호출이나 지연이 없습니다.
 */
export function applyEmissions(
  companies: Company[],
  posts: Post[],
  payload: EmissionPayload
): Post[] {
  let map: Map<string, ExtendedGhgEmission[]>;
  let itemType:PayloadItemType = "guitar"
  
  switch (payload.actionType) {
    case "guitar_production":
      map = processGuitarProduction(payload.quantity, payload.yearMonth);
      itemType = "guitar"
      break;
    case "delivery":
      map = processDeliveryDistance(payload.quantity, payload.yearMonth);
      itemType = "guitar"
      break;
    case "pickup_import":
      map = processPickupImport(payload.quantity, payload.yearMonth);
      itemType = "pickup"
      break;
    case "string_import":
      map = processGuitarStringImport(payload.quantity, payload.yearMonth);
      itemType = "string"
      break;
    default:
      throw new Error(`Invalid actionType: ${payload.actionType}`);
  }

  const updatedPosts: Post[] = [];

  for (const [companyId, newEmissions] of Array.from(map.entries())) {
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      // 배출 데이터 병합
      for (const e of newEmissions) {
        company.emissions = mergeEmissions(company.emissions, e);
      }

      
      const content = buildPostContent(company, newEmissions, payload.quantity, itemType);
      
      // 해당 월/회사에 대한 기존 포스트가 있는지 확인
      const existingPostIndex = posts.findIndex(
        (p) => p.resourceUid === company.id && p.dateTime === payload.yearMonth
      );
      
      if (existingPostIndex >= 0) {
        // 기존 포스트 내용에 추가
        const existingPost = posts[existingPostIndex];
        existingPost.content = `${existingPost.content}\n${content}`;
        updatedPosts.push(existingPost);
      } else {
        // 새 포스트 생성
        const newPost: Post = {
          id: crypto.randomUUID(),
          title: `${company.name} ${payload.yearMonth} 배출 이력`,
          resourceUid: company.id,
          dateTime: payload.yearMonth,
          content,
        };
        posts.push(newPost);
        updatedPosts.push(newPost);
      }
    }
  }

  return updatedPosts;
}
