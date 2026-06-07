// lib/api.ts의 모의 함수 동작을 검증하는 테스트
import { describe, it, expect } from "vitest";
import {
  fetchCountries,
  fetchCompanies,
  fetchPosts,
  createOrUpdatePost,
  submitEmissions,
} from "@/lib/api";

describe("lib/api 모의 함수 테스트", () => {
  it("fetchCountries는 배열을 반환해야 한다", async () => {
    const result = await fetchCountries();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("fetchCompanies는 6개의 회사를 반환해야 한다", async () => {
    const result = await fetchCompanies();
    expect(result).toHaveLength(6);
  });

  it("fetchPosts는 배열을 반환해야 한다", async () => {
    const result = await fetchPosts();
    expect(Array.isArray(result)).toBe(true);
  });

  it("createOrUpdatePost는 id 없이 호출하면 새 Post를 생성해야 한다", async () => {
    const newPost = {
      title: "테스트 포스트",
      resourceUid: "kender",
      dateTime: "2026-01",
      content: "테스트 내용",
    };

    // maybeFail 15% 확률로 실패할 수 있으므로 재시도
    let result;
    for (let i = 0; i < 10; i++) {
      try {
        result = await createOrUpdatePost(newPost);
        break;
      } catch {
        // retry
      }
    }

    expect(result).toBeDefined();
    expect(result!.id).toBeDefined();
    expect(result!.title).toBe("테스트 포스트");
  });

  it("submitEmissions는 정상적으로 트랜잭션을 처리하고 포스트 목록을 반환해야 한다", async () => {
    const payload = {
      actionType: "guitar_production" as const,
      quantity: 100,
      yearMonth: "2026-06",
    };

    let result;
    for (let i = 0; i < 10; i++) {
      try {
        result = await submitEmissions(payload);
        break;
      } catch (e) {
        if ((e as Error).message.includes("No transactions support") || (e as Error).message.includes("transactions support")) {
          throw e;
        }
      }
    }

    expect(result).toBeDefined();
    expect(result!.length).toBeGreaterThan(0);
  });
});
