import { describe, it, expect } from "vitest";
import { GET as getDashboardStatsRoute } from "@/app/api/dashboard-stats/route";
import {
  fetchCountries,
  fetchCompanies,
  fetchPosts,
  createOrUpdatePost,
  submitEmissions,
  getDashboardStats,
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

  describe("getDashboardStats 기간 필터링 테스트", () => {
    it("인자 없이 호출 시 디폴트로 최근 12개월 데이터를 반환해야 한다", async () => {
      const stats = await getDashboardStats();
      expect(stats.emissionsByMonth).toHaveLength(12);

      const now = new Date();
      const lastMonth = stats.emissionsByMonth[11].name;
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
      expect(lastMonth).toBe(`${currentYear}-${currentMonth}`);
    });

    it("startDate와 endDate 범위를 전달하면 해당 범위의 달만 오름차순 반환해야 한다", async () => {
      const startDate = "2026-01";
      const endDate = "2026-03";
      const stats = await getDashboardStats(startDate, endDate);

      expect(stats.emissionsByMonth).toHaveLength(3);
      expect(stats.emissionsByMonth[0].name).toBe("2026-01");
      expect(stats.emissionsByMonth[1].name).toBe("2026-02");
      expect(stats.emissionsByMonth[2].name).toBe("2026-03");
    });

    it("startDate만 전달할 경우 단일 월 데이터로 조회해야 한다 (하위 호환성)", async () => {
      const month = "2026-02";
      const stats = await getDashboardStats(month);

      expect(stats.emissionsByMonth).toHaveLength(1);
      expect(stats.emissionsByMonth[0].name).toBe("2026-02");
    });
  });

  describe("GET /api/dashboard-stats API 라우트 통합 테스트", () => {
    it("startDate와 endDate 파라미터로 범위 조회 시 올바른 데이터를 JSON 형태로 반환해야 한다", async () => {
      const req = new Request("http://localhost/api/dashboard-stats?startDate=2026-01&endDate=2026-02");
      
      let response;
      for (let i = 0; i < 10; i++) {
        try {
          response = await getDashboardStatsRoute(req);
          break;
        } catch {
          // retry due to jitter/maybeFail
        }
      }

      expect(response).toBeDefined();
      expect(response!.status).toBe(200);
      
      const data = await response!.json();
      expect(data.emissionsByMonth).toHaveLength(2);
      expect(data.emissionsByMonth[0].name).toBe("2026-01");
      expect(data.emissionsByMonth[1].name).toBe("2026-02");
    });

    it("month 단일 파라미터로 단일 월 조회 시 하위 호환성을 제공해야 한다", async () => {
      const req = new Request("http://localhost/api/dashboard-stats?month=2026-03");
      
      let response;
      for (let i = 0; i < 10; i++) {
        try {
          response = await getDashboardStatsRoute(req);
          break;
        } catch {
          // retry
        }
      }

      expect(response).toBeDefined();
      expect(response!.status).toBe(200);
      
      const data = await response!.json();
      expect(data.emissionsByMonth).toHaveLength(1);
      expect(data.emissionsByMonth[0].name).toBe("2026-03");
    });
  });
});
