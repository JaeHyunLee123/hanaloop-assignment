<!-- 프로젝트 기초 환경 설정 및 페이크 API 구성 계획 -->
# Phase 1: 환경 설정 및 페이크 API 구성 (Setup & Fake API)

## 1. 프로젝트 초기화
* Next.js (App Router) 프로젝트 생성
* TailwindCSS 설정 및 UI 기본 테마 구성 (Stitch AI 디자인 가이드라인 참고)
* 패키지 설치: `zustand`, `@tanstack/react-query`, `axios`
* 테스트 환경 세팅: `vitest` (단위 테스트용), `@playwright/test` (E2E 테스트용)

## 2. 기본 타입 및 페이크 DB 설정
* `src/types/base-types.ts`에 확정된 타입(`ExtendedGhgEmission`, `Company`, `Post`, `Country`) 정의
* `lib/fake-db.ts` (또는 시드 데이터 파일) 생성:
  * 고정된 6개의 `Company` 객체 초기화 (Kender, 공급사, 운송사)
  * 초기 `Country` 데이터 셋업
* `lib/api.ts` 작성:
  * 요구사항에서 제공된 지연(delay) 및 실패(jitter, maybeFail) 로직 적용
  * `fetchCountries`, `fetchCompanies`, `fetchPosts`, `createOrUpdatePost` 등 모의 함수 구현

## 3. Next.js Route Handlers 설정
* `app/api/companies/route.ts`
* `app/api/posts/route.ts`
* 클라이언트(axios)에서 접근할 수 있도록 API 엔드포인트 노출 및 `lib/api.ts` 연결

## 4. TDD 및 검증
* `lib/api.ts`의 모의 함수들이 예상대로 작동하는지 Vitest로 간단한 단위 테스트 작성 및 통과 확인
