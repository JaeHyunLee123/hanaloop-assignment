<!-- 현재 작업의 할 일과 진행 상황을 추적하는 체크리스트 -->
# 탄소배출관리 플랫폼 기획 체크리스트

- [x] 전달받은 도메인 용어를 `CONTEXT.md`에 정리
- [x] 전달받은 솔루션 개요와 가정을 `docs/brainstorming.md`에 정리
- [x] 계획, 체크리스트, 컨텍스트 노트 생성
- [x] 도메인 이해를 돕기 위한 모호성 점검 및 질문 완료 (@grill-me)
- [x] 소프트웨어 요구사항 및 아키텍처 설계 문서화 (PRD 작성 완료)
- [x] 개발 단계별 구체적 구현 계획 작성 (Implementation Plan)
- [x] **Phase 1**: 패키지 설치 (zustand, @tanstack/react-query, axios, vitest, @playwright/test)
- [x] **Phase 1**: Vitest 설정 (vitest.config.ts, package.json scripts)
- [x] **Phase 1**: ExtendedGhgEmission 타입 정의 (base-types.ts 확장)
- [x] **Phase 1**: 페이크 DB 구현 (src/lib/fake-db.ts - 6개 Company, 더미 emission/post 데이터)
- [x] **Phase 1**: 페이크 API 구현 (src/lib/api.ts - delay/jitter/maybeFail 포함)
- [x] **Phase 1**: Next.js Route Handlers (app/api/companies, app/api/posts)
- [x] **Phase 1**: TDD 검증 테스트 11개 작성 및 통과 (fake-db 무결성 + API 함수 동작)
- [x] **Phase 1**: 빌드 통과 확인
- [x] **Phase 2**: 배출계수 상수 정의 (`lib/constants.ts` - 인터넷 조사 기반, 출처 주석 포함)
- [x] **Phase 2**: 배출량 계산 테스트 26개 작성 (RED)
- [x] **Phase 2**: 핵심 비즈니스 로직 구현 (`lib/emissions-calculator.ts` - GREEN)
- [x] **Phase 2**: 전체 테스트 37개 통과 확인
