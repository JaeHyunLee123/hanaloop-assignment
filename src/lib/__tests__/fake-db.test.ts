// 데이터베이스의 실제 데이터 구조 및 비즈니스 제약조건 무결성 검증 테스트
import { describe, it, expect, beforeAll } from "vitest";
import { fetchCompanies, fetchPosts, fetchCountries } from "@/lib/api";
import { Company, Post, Country } from "@/types/base-types";

const YEAR_MONTH_REGEX = /^\d{4}-\d{2}$/;

describe("데이터베이스 실제 데이터 검증", () => {
  let companies: Company[] = [];
  let posts: Post[] = [];
  let countries: Country[] = [];

  beforeAll(async () => {
    companies = await fetchCompanies();
    posts = await fetchPosts();
    countries = await fetchCountries();
  });

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
