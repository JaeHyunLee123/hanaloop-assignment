<!-- 대시보드 기간 필터 기능 구현을 위한 상세 개발 계획 문서 -->
# Phase 6: 대시보드 기간 필터링 기능 추가 및 고도화 구현 계획

본 문서는 메인 대시보드에 기간별(월별 단일 필터 및 특정 기간 범위 필터) 조회 기능을 적용하기 위한 상세 개발 계획입니다. Drizzle ORM 범위 쿼리 확장, API 엔드포인트 수정, 그리고 대시보드 UI/UX 컴포넌트 추가를 포함합니다.

## 목표
* 사용자가 시작 월(`startDate`)과 종료 월(`endDate`)을 지정하여 원하는 기간 동안의 탄소 배출량을 분석할 수 있는 화면 제공.
* 기본값(Default)으로는 현재 시간 기준 최근 12개월(당월 포함) 동안의 데이터를 제공.
* 유효하지 않은 기간 입력을 프론트엔드 UI 수준에서 원천 차단하는 유효성 검증 제공.
* 기존 API와의 완벽한 하위 호환성 유지.

## 세부 작업 계획

### 1. API 스펙 확장 및 구현 (`src/app/api/dashboard-stats/route.ts`)
* `GET /api/dashboard-stats` 호출 시 쿼리 파라미터 `startDate`와 `endDate`를 추출하도록 리팩토링합니다.
* 기존 `month` 파라미터로 요청이 들어오는 경우, `startDate = month`, `endDate = month`로 매핑하여 하위 호환성을 제공합니다.
* 두 파라미터 모두 비어있는 경우, 현재 서버 시간 기준 당월을 포함한 최근 12개월 범위를 자동 주입하여 계산합니다.

### 2. DB 조회 로직 수정 및 범위 쿼리 반영 (`src/lib/api.ts` 내 `getDashboardStats`)
* `getDashboardStats` 함수 시그니처를 `getDashboardStats(startDate?: string, endDate?: string)` 형태로 확장합니다.
* Drizzle ORM의 `and(gte(emissionsTable.yearMonth, startDate), lte(emissionsTable.yearMonth, endDate))` 조건문을 활용하여 `totalEmissions`, `emissionsByScope`, `emissionsByCompany`, `emissionsByPcfStage` 집계를 필터링합니다.
* `emissionsByMonth` (월별 차트 데이터) 역시 고정된 12개월 대신, 선택된 `startDate`와 `endDate` 사이의 개별 연월 목록을 오름차순으로 동적 조회하도록 수정합니다.
* 제품 단위당 PCF 값(`cradleToGatePcf`, `cradleToGravePcf`)은 고정 상수를 이용해 이론값으로 리턴하도록 유지합니다.

### 3. 대시보드 프론트엔드 UI/UX 개발 (`src/app/page.tsx`)
* 대시보드 화면 상단에 두 개의 연월 드롭다운("시작 월", "종료 월")을 배치합니다.
* 선택 가능한 월 목록은 `2025-01`부터 현재 월까지 동적으로 빌드합니다.
* 시작 월보다 이전인 연월 항목들은 종료 월 드롭다운 내에서 `disabled` 처리하여 유효하지 않은 기간 설정을 원천 차단합니다.
* Tanstack Query (`useQuery`)의 `queryKey`에 `[ "dashboard-stats", { startDate, endDate } ]` 형태로 상태를 종속시켜, 필터 값이 바뀌면 자동으로 데이터를 다시 로드하도록 구현합니다.

### 4. 테스트 코드 작성 및 검증
* `src/lib/__tests__/api.test.ts` 등에 기간 필터링(`startDate` 및 `endDate`)을 적용하여 데이터를 다각도로 쿼리하고 올바르게 집계되는지 검증하는 단위 테스트를 작성합니다.
* `npm run test` 명령어를 통해 기존에 구축된 테스트 38개가 깨지지 않고 무결하게 통과하는지 사전 검증합니다.
