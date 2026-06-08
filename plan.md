# 구현 계획: 대시보드 기간 필터링 기능 추가 및 고도화 (Phase 6)

## 목표
* 사용자가 시작 월(`startDate`)과 종료 월(`endDate`)을 지정하여 원하는 기간 동안의 탄소 배출량을 분석할 수 있는 화면 제공.
* 기본값(Default)으로는 현재 시간 기준 최근 12개월(당월 포함) 동안의 데이터를 제공.
* 유효하지 않은 기간 입력을 프론트엔드 UI 수준에서 원천 차단하는 유효성 검증 제공.
* 기존 API와의 완벽한 하위 호환성 유지.

## 세부 구현 단계

### 1. 테스트 케이스 작성 및 TDD 환경 마련 (Red 단계)
* `src/lib/__tests__/api.test.ts`에 `getDashboardStats` 함수에 대한 범위 쿼리 테스트 추가.
  * `startDate`와 `endDate` 범위에 맞는 데이터만 올바르게 집계되는지 확인.
  * `startDate`와 `endDate` 사이의 기간 동안의 `emissionsByMonth` 차트 데이터가 동적으로 오름차순 생성되는지 확인.
  * 인자가 전달되지 않은 경우, 현재 실제 시간 기준 최근 12개월 범위가 적용되는지 검증.

### 2. DB 조회 로직 수정 및 범위 쿼리 반영
* `src/lib/api.ts` 내 `getDashboardStats` 함수 시그니처를 `getDashboardStats(startDate?: string, endDate?: string)`로 확장.
* `startDate`와 `endDate` 중 하나라도 누락된 경우, 현재 날짜 기준 당월 포함 12개월 범위로 자동 계산하여 할당.
* Drizzle ORM의 `and(gte(emissionsTable.yearMonth, startDate), lte(emissionsTable.yearMonth, endDate))` 조건문을 활용하여 통계 집계 쿼리에 적용.
* `emissionsByMonth` (월별 차트 데이터)도 `startDate`와 `endDate` 사이의 개별 연월 목록을 오름차순으로 동적 조회하도록 수정.

### 3. API 엔드포인트 수정 및 하위 호환성 구현
* `src/app/api/dashboard-stats/route.ts`가 `startDate`와 `endDate` 쿼리 파라미터를 읽어오도록 수정.
* `month` 쿼리 파라미터가 들어오는 경우, `startDate = month`, `endDate = month`로 매핑하여 하위 호환성 제공.
* 쿼리 파라미터가 없거나 올바르지 않은 경우 `getDashboardStats()`의 디폴트 로직이 동작하도록 연동.

### 4. 대시보드 프론트엔드 UI/UX 개발
* `src/app/page.tsx`에 대시보드 상단 기간 필터 2개(시작 월, 종료 월) 연월 드롭다운 배치.
* 시작 월은 시드 데이터 시작 시점인 `2025-01`부터 현재 월까지, 종료 월도 동일하게 빌드.
* 유효성 검증: 시작 월보다 이른 연월 항목들은 종료 월 드롭다운에서 `disabled` 처리하여 비정상 조회를 차단.
* Tanstack Query의 `queryKey`에 `[ "dashboard-stats", { startDate, endDate } ]` 형태로 연동하여 상태 변화 시 즉각 갱신.

### 5. 빌드 및 최종 통합 검증 (Green 단계)
* `npm run test`를 실행하여 기존 38개 테스트와 새로 추가된 테스트가 100% 통과하는지 검증.
* 프로젝트가 성공적으로 빌드되는지 `npm run build`를 통해 빌드 검증 수행.

## 제약 사항
* 한국어 문장 끝에 콜론(`:`)을 사용하지 않고 온점(`.`) 등을 사용합니다.
* 새로 수정하는 파일 상단에는 1줄의 한국어 주석으로 파일 역할을 설명합니다.
* 기능 단위마다 Semantic Commit 규칙에 맞추어 세분화된 커밋을 수행합니다.
