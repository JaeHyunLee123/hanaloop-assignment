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
  - Post의 content 형식은 "기타 N대 생산, X.XXtCO2e 배출" 패턴으로 확정함.
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
