// 페이크 DB 더미 데이터의 무결성을 검증하는 테스트
import { describe, it, expect } from "vitest";
import { companies, posts } from "@/lib/fake-db";
import { countries } from "@/data/country-data";

const YEAR_MONTH_REGEX = /^\d{4}-\d{2}$/;

describe("fake-db 더미 데이터 검증", () => {
  describe("companies", () => {
    it("6개의 회사가 존재해야 한다", () => {
      expect(companies).toHaveLength(6);
    });

    it("모든 Company의 country가 countries 데이터에 실제로 있어야 한다", () => {
      const validCodes = countries.map((c) => c.code);
      for (const company of companies) {
        expect(validCodes).toContain(company.country);
      }
    });

    it("모든 emission의 yearMonth가 YYYY-MM 형식이어야 한다", () => {
      for (const company of companies) {
        for (const emission of company.emissions) {
          expect(emission.yearMonth).toMatch(YEAR_MONTH_REGEX);
        }
      }
    });

    it("모든 emission의 scope가 1, 2, 3 중 하나여야 한다", () => {
      for (const company of companies) {
        for (const emission of company.emissions) {
          expect([1, 2, 3]).toContain(emission.scope);
        }
      }
    });

    it("모든 emission의 pcfStage가 1~5 중 하나여야 한다", () => {
      for (const company of companies) {
        for (const emission of company.emissions) {
          expect([1, 2, 3, 4, 5]).toContain(emission.pcfStage);
        }
      }
    });
  });

  describe("posts", () => {
    it("Post의 dateTime이 YYYY-MM 형식이어야 한다", () => {
      for (const post of posts) {
        expect(post.dateTime).toMatch(YEAR_MONTH_REGEX);
      }
    });

    it("Post의 resourceUid가 companies에 실제로 있는 id여야 한다", () => {
      const validIds = companies.map((c) => c.id);
      for (const post of posts) {
        expect(validIds).toContain(post.resourceUid);
      }
    });
  });
});
