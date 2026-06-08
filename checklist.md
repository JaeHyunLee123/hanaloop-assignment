# 작업 체크리스트

## DB 환경 구축 및 설정
- [x] Drizzle 및 Neon Postgres 드라이버 패키지 설치 (`drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`, `tsx`)
- [x] `.env.local` 파일에 Neon 접속 환경 변수(`DATABASE_URL`) 구성
- [x] Drizzle 설정 파일(`drizzle.config.ts`) 정의
- [x] 데이터베이스 스키마 정의 (`src/db/schema.ts`)
- [x] 데이터베이스 연결 클라이언트 구현 (`src/db/index.ts`)
- [x] 스키마 마이그레이션 생성 및 데이터베이스 반영 (Push / Migration)

## 시딩 및 데이터 적재
- [x] 독립형 시드 스크립트 작성 (`src/db/seed.ts`)
- [x] `tsx`로 시드 실행 및 데이터 적재 확인

## API 실제 코드로 전환
- [x] `src/lib/api.ts` 내의 모든 API 함수를 Drizzle DB 쿼리로 전환
- [x] `submitEmissions` API 내의 배출 계산, Upsert 및 포스트 갱신을 단일 DB 트랜잭션으로 묶어 구현
- [x] `getDashboardStats` 내의 집계 로직을 SQL Group By/SUM 혹은 Drizzle 관계형 쿼리로 최적화하여 구현

## 대시보드 기간 필터링 기능 추가 (Phase 6)
- [ ] 1단계: 테스트 작성 (TDD Red 단계) - `src/lib/__tests__/api.test.ts` 등에 기간 필터링에 관한 단위 테스트 케이스 추가
- [ ] 2단계: API 엔드포인트 수정 - `src/app/api/dashboard-stats/route.ts`에 쿼리 파라미터 연동 및 하위 호환성 추가
- [ ] 3단계: DB 조회 로직 수정 - `src/lib/api.ts` 내 `getDashboardStats` 함수를 `startDate`와 `endDate` 범위 기반 쿼리로 리팩토링 및 동적 월별 차트 조회 구현
- [ ] 4단계: UI 개발 - `src/app/page.tsx`에 시작-종료 월 드롭다운 필터 및 유효성 검증 UI 개발
- [ ] 5단계: 최종 통합 검증 - 전체 단위 테스트 100% 통과 확인 및 프로덕션 빌드 성공 여부 검증
