<!-- 작업 진행 중 파악한 맥락과 주요 결정 사항 기록 -->
# Context Notes

## 2026-05-08: 초기 기획 및 용어 정리
- 사용자가 제공한 탄소배출관리 플랫폼의 핵심 용어(PCF, GHG Scope, 공급원별 산정방법)를 `CONTEXT.md`에 정리함.
- 플랫폼의 1차 목표가 Kender라는 가상의 전기기타 브랜드를 대상으로 Scope 1, 2, 3(일부) 배출량을 포괄하는 Cradle to Grave PCF를 도출하는 것임을 확인하고 `docs/brainstorming.md`에 가정을 정리함.
- 설계에 들어가기 전, 도메인에 대해 완벽히 파악하기 위해 모호한 부분을 식별하고 사용자에게 질문(@grill-me)을 진행함.
- **도메인 룰 확정**: Kender는 한국에서 헤드, 넥, 바디를 직접 생산(Scope 1, 2)하며, 전기 사용(Scope 2)은 국가 평균 전력망 배출계수를 일괄 적용함. 제품 사용 단계 배출량은 플랫폼 내에 미리 정의된 표준 가정치(수명, 소비전력 등)를 통해 계산하기로 확정함.
- `GhgEmission` 타입은 대시보드 구분을 위해 `scope`, `pcfStage`를 포함하도록 확장(`ExtendedGhgEmission`)하기로 결정함.
- `GhgEmission` 합산 기준은 `yearMonth`와 `source`가 완전히 동일한 경우로 엄격하게 확정함.
- `Post` 객체의 제목은 통합된 명칭(예: "Kender 2026-05 통합 배출 이력")으로 일괄 적용하여 생성 및 누적하기로 함.
- 플랫폼 내 고정된 6개의 `Company` 객체(Kender, 부품 공급사, 운송사)를 통해 제품 생산 시 발생하는 밸류체인 전반의 배출량을 자사(Kender) 관점(Scope, PCF 단계)으로 치환하여 자동 계산하는 복잡한 내부 로직 구현에 합의함.
- **2026-05-08**: 위 논의 내용을 바탕으로 PRD(`docs/PRD.md`)를 작성하고, 개발 계획(`docs/implementation-plan/`) 문서 5개를 마스터 문서와 함께 스캐폴딩 완료함. (Next.js, Tailwind, Zustand, Tanstack Query, Vitest, Playwright 등 도입 확정)
- **상수(배출계수) 처리**: 실제 배출계수 데이터가 없으므로, 계산 로직 구현 시 에이전트가 임의의 가상 상수값들을 선언하여 사용하기로 결정함.
- **디자인 워크플로우**: 사용자가 Stitch AI를 통해 디자인을 제작하면, 에이전트가 MCP로 연결하여 디자인 시스템을 파악하고 TailwindCSS로 똑같이 구현하는 방식을 채택함.
- **2026-05-08 (설계 리뷰 후 결정 사항)**:
  - `GhgEmission` 합산 기준을 `yearMonth`, `source`, `scope`, `pcfStage`가 모두 일치할 때로 강화함.
  - `Post` 객체는 배출량이 분산 할당되는 각 회사별로 생성하며, 과제 제약사항에 따라 기존의 프로퍼티 키와 값 형태(e.g., `dateTime: "2026-05"`)는 변경 없이 유지함.
  - PCF 제품 단위 계산 시, 재고 물량으로 인한 왜곡을 방지하기 위해 '표준 부품 비율(BOM)' 기준의 고정 수식을 적용하기로 기획 결정함.
  - 데이터 오입력 시 수정/삭제 기능 없이, 마이너스(-) 수치를 재입력하여 차감하는 방식으로 롤백(Rollback) 정책을 확정함.
- **2026-05-08 (Phase 1 구현 완료)**:
  - `source` 필드는 빈 문자열(`""`)로 통일하기로 사용자와 합의함.
  - `국내배송회사`와 `국내운송회사`는 동일 엔티티(`kr-delivery`)로 확정함.
  - 더미 데이터는 2025-01~2026-04 (16개월) 기간으로 시드 기반 의사 난수(`seededRandom(42)`)를 사용해 재현 가능하게 생성함.
  - Post of content 형식은 "기타 N대 생산, X.XXtCO2e 배출" 패턴으로 확정함.
  - 과제에서 제공된 `lib/api.ts` 코드(delay, jitter, maybeFail 포함)를 그대로 적용함.
  - Vitest 11개 테스트 작성 및 전체 통과 확인 (fake-db 무결성 7건 + API 함수 동작 4건).
- **2026-05-08 (Phase 2 구현 완료)**:
  - 배출계수 상수값은 인터넷 조사(IPCC 2006, 환경부 GIR 2023, DEFRA, GLEC Framework 등) 기반으로 설정하고 출처를 주석으로 명시함.
  - 한국 전력 배출계수: 0.4173 tCO2eq/MWh (환경부/온실가스종합정보센터 2023년 공표치).
  - 계산 함수 4개 구현: `processGuitarProduction`, `processDeliveryDistance`, `processPickupImport`, `processGuitarStringImport`.
  - 반환 타입은 `Map<string, ExtendedGhgEmission[]>`로 확정. key는 companyId, value는 해당 회사에 할당할 emission 배열.
  - `mergeEmissions` 함수: `yearMonth`, `source`, `scope`, `pcfStage` 4개 키가 모두 일치할 때만 합산. 원본 불변(immutable).
  - 마이너스(-) 입력은 동일한 파이프라인을 통과하여 음수 emission을 생성하고, mergeEmissions로 기존 값에서 차감됨.
  - 전체 테스트 37개 (Phase 1: 11개 + Phase 2: 26개) 모두 통과 확인.

## 2026-06-03: 에이전트 스킬 설정 구축
- `/setup-matt-pocock-skills`를 기반으로 엔지니어링 스킬 연동 환경을 구축함.
- **이슈 트래커**: GitHub Issues (`gh` CLI 기반)를 사용하기로 결정함.
- **트리아지 라벨**: 기본 5개 라벨(`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`)을 그대로 사용하기로 함.
- **도메인 문서**: 단일 도메인 구조(`Single-context`)로 `CONTEXT.md` 및 `docs/adr/`를 운용하기로 설정함.

## 2026-06-04: 실제 API 및 DB 연동 마이그레이션 기획
- **설계 검토**: `grill-with-docs` 스킬을 활용하여 실제 API 전환을 위한 데이터베이스 설계에 대한 검토를 진행함.
- **테이블 관계**: `companies`와 `emissions`를 1:N 관계로 설계하여 개별 배출량에 대한 집계 쿼리를 데이터베이스 수준에서 처리하도록 결정함.
- **배출량 누적**: 중복 및 데이터 비대화를 방지하고 기존 누적 로직을 계승하기 위해 5개 식별 컬럼에 복합 유니크 제약조건을 설정하고 ON CONFLICT DO UPDATE(Upsert) 방식을 채택함.
- **트랜잭션 원자성**: 배출량 기록과 포스트 작성을 하나의 DB 트랜잭션 내에서 처리하여 원자성을 확보하도록 결정함.
- **시드 실행**: Next.js 실행 오버헤드를 막기 위해 `src/db/seed.ts` 스크립트를 작성하여 일회성으로 데이터를 삽입하는 구조를 설계함.
- **데이터베이스 플랫폼 전환**: Supabase 프리 플랜 용량 제한 도달 이슈로 인하여, Drizzle ORM과 완벽히 호환되며 넉넉한 무료 티어(0.5GB 스토리지)를 지원하는 서버리스 PostgreSQL인 Neon으로 배포 데이터베이스를 변경하고 계획서 및 환경 변수를 업데이트함.

- **2026-06-04 (마이그레이션 완료)**.
  - Drizzle ORM 및 Neon Serverless PostgreSQL 실제 연동 완료.
  - `countries`, `companies`, `emissions`, `posts` 테이블의 1:N 관계형 스키마 설계 및 마이그레이션 파일 생성/적용 완료.
  - `src/db/seed.ts` 독립 실행형 스크립트로 2025-01부터 현재 전월까지의 기초 및 계산 데이터 삽입 완료.
  - `src/lib/api.ts` 내부의 조회, 생성/수정, Upsert 및 트랜잭션 로직을 Drizzle 쿼리로 성공적으로 마이그레이션.
  - `getDashboardStats` 집계 로직을 SQL Group By 및 SUM 연산으로 고도화 최적화하여 쿼리 성능 대폭 향상.
  - `fake-db.test.ts` 및 `api.test.ts`를 실제 데이터베이스 연동 환경에 맞춰 개편하여 기존 37개 단위 테스트가 모두 안정적으로 통과함을 검증함.
  - 더 이상 사용하지 않는 레거시 파일들(`fake-db.ts`, `emission-service.ts`, `country-data.ts`) 상단에 "더 이상 사용하지 않는 파일" 주석 표시 적용.

- **2026-06-07 (트랜잭션 미지원 이슈 해결)**.
  - Drizzle의 `neon-http` 드라이버 사용 시 HTTP의 무상태성 제약으로 인해 다중 쿼리 트랜잭션(`db.transaction`)이 미지원되는 버그(`No transactions support in neon-http driver`)가 관측됨.
  - 이를 해결하기 위해 `@neondatabase/serverless`의 `Pool` 객체 및 `drizzle-orm/neon-serverless` WebSocket 기반 드라이버로 커넥션 연결 방식을 마이그레이션함.
  - 전환 결과, 원자성이 필요한 `submitEmissions`를 포함하여 실제 트랜잭션 기능이 정상 작동하고 전체 38개 단위 테스트가 모두 무결하게 통과됨을 보장함.

- **2026-06-08 (대시보드 기간 필터링 기획)**.
  - 디폴트 필터인 "최근 1년"의 범위는 **현재 실제 시간 기준 당월 포함 12개월** (예: 2026년 6월 기준, `2025-07 ~ 2026-06`)으로 적용하기로 결정함.
  - **대시보드 차트 및 수치 카드 적용 범위**:
    - **Total Emissions, Scope/회사/Lifecycle Stage 차트**: 필터링된 기간(`startDate` ~ `endDate`) 내의 데이터를 집계하여 반영함.
    - **단위당 PCF 카드 (Cradle to Gate/Grave)**: 고정된 상수를 기반으로 산출되므로 필터 영향을 받지 않고 고정값을 유지함.
    - **월별 배출량 차트**: 선택한 기간 범위에 속하는 모든 월을 동적으로 나열하여 추이를 보여줌.
  - **기간 필터 UI 및 유효성 검증**:
    - **UI 형태**: 상단에 "시작 월"과 "종료 월"을 지정할 수 있는 2개의 드롭다운(YYYY-MM) 배치. 단일 월을 보려면 시작/종료를 동일하게 설정.
    - **유효성 검증**: 시작 월보다 이전인 월은 종료 월 드롭다운에서 선택할 수 없도록 비활성화(disabled)하여 사용자 실수를 사전 차단함.
    - **필터 경계 범위**: 선택 가능한 시작 월은 `2025-01` 고정값으로 지정하고, 종료 월은 실제 현재 날짜의 당월(예: 2026년 6월 기준 `2026-06`)까지 동적으로 렌더링함.
  - **API 하위 호환성**:
    - `month` 쿼리 파라미터가 유입될 경우, `startDate = month`, `endDate = month`로 해석하여 단일 월 조회로 하위 호환성을 완벽히 보장함.

- **2026-06-08 (Phase 6 구현 시작)**.
  - **TDD 개발 흐름 준수**: 기능을 연동하기 전, `src/lib/__tests__/api.test.ts`에 `startDate` 및 `endDate` 필터링에 대한 API 검증 및 집계 단위 테스트 케이스를 우선 추가하기로 함.
  - **디폴트 값 산출**: `startDate` 및 `endDate`가 미지정되었을 경우, 서버의 현재 실제 시간을 기반으로 최근 12개월(당월 포함) 범위를 자동 도출함.
  - **월별 차트 데이터 범위**: 기존의 최근 12개월 고정 조회 방식에서 탈피하여, 사용자가 설정한 범위(`startDate` ~ `endDate`) 내의 모든 월이 순차적으로 정렬되어 표현되도록 개선함.

- **2026-06-08 (UI 개선 및 loading.tsx 로딩 스피너 구현)**.
  - **날짜 필터 UI 상향**: 가독성과 클릭의 편의성을 높이기 위해 셀렉트 박스와 레이아웃의 패딩 및 폰트 크기를 확대 조정하기로 함.
  - **Next.js loading.tsx 연동**: 큼직하고 미려하게 돌아가는 스피너 애니메이션을 구현하여 `src/app/loading.tsx`로 등록하기로 결정함.
  - **useSuspenseQuery 도입**: Tanstack Query의 로딩 상태가 Next.js 서스펜스와 긴밀하게 반응하여 필터 갱신 및 초기 진입 시 로딩 서스펜스를 유기적으로 작동하도록 `useSuspenseQuery`로 전면 교체하기로 확정함.
