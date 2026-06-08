<!-- 개발 계획 총괄 마스터 문서 -->
# 탄소배출관리 플랫폼 구현 계획 (Implementation Plan)

본 문서는 PRD 요구사항을 바탕으로 작성된 구체적인 개발 계획 마스터 문서입니다. 전체 기술 스택은 Next.js, TailwindCSS, Zustand, Tanstack Query, Axios이며, 테스트는 Vitest(단위)와 Playwright(E2E)를 사용합니다. 모든 단위 기능은 **TDD 방식**으로 구현합니다.

## 개발 단계 요약 (Phases)

* [Phase 1: 환경 설정 및 페이크 API 구성](./01-setup.md)
  * 기초 프로젝트 뼈대 구축 및 주어진 `lib/api.ts`를 활용한 페이크 백엔드 구성.
* [Phase 2: 핵심 도메인 로직 TDD](./02-core-domain-tdd.md)
  * Kender 기준의 복잡한 온실가스 분산 할당 로직을 Vitest를 이용해 TDD로 완벽히 구현.
* [Phase 3: UI 대시보드 및 입력 폼 구현](./03-ui-and-integration.md)
  * Tanstack Query를 활용한 상태 동기화 및 TailwindCSS(Stitch AI 디자인) 기반 대시보드/폼 제작.
* [Phase 4: E2E 테스트](./04-e2e-testing.md)
  * Playwright를 이용해 전체 워크플로우(입력 -> 백엔드 분배 -> 대시보드 갱신) 검증.
* [Phase 5: Drizzle ORM 및 Neon 연동 실제 API 마이그레이션](./05-drizzle-neon-migration.md)
  * Neon PostgreSQL 연동, Drizzle 스키마 설계 및 독립형 시드 스크립트 구축, 그리고 기존 페이크 API의 실제 DB 쿼리 및 트랜잭션 전환.
* [Phase 6: 대시보드 기간 필터링 기능 추가 및 고도화](./06-dashboard-period-filter.md)
  * 시작 월 및 종료 월 기간 범위 쿼리 파라미터 연동, 대시보드 UI/UX 구현, 범위 유효성 검증 및 하위 호환성 유지.


