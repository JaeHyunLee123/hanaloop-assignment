# 작업 체크리스트

## DB 환경 구축 및 설정
- [ ] Drizzle 및 PostgreSQL 드라이버 패키지 설치 (`drizzle-orm`, `postgres`, `drizzle-kit`, `tsx`)
- [ ] `.env.local` 파일에 Supabase 접속 환경 변수(`DATABASE_URL`, `DIRECT_URL`) 구성
- [ ] Drizzle 설정 파일(`drizzle.config.ts`) 정의
- [ ] 데이터베이스 스키마 정의 (`src/db/schema.ts`)
- [ ] 데이터베이스 연결 클라이언트 구현 (`src/db/index.ts`)
- [ ] 스키마 마이그레이션 생성 및 데이터베이스 반영 (Push / Migration)

## 시딩 및 데이터 적재
- [ ] 독립형 시드 스크립트 작성 (`src/db/seed.ts`)
- [ ] `tsx`로 시드 실행 및 데이터 적재 확인

## API 실제 코드로 전환
- [ ] `src/lib/api.ts` 내의 모든 API 함수를 Drizzle DB 쿼리로 전환
- [ ] `submitEmissions` API 내의 배출 계산, Upsert 및 포스트 갱신을 단일 DB 트랜잭션으로 묶어 구현
- [ ] `getDashboardStats` 내의 집계 로직을 SQL Group By/SUM 혹은 Drizzle 관계형 쿼리로 최적화하여 구현

## 검증 및 정리
- [ ] 테스트 코드 실행 및 검증 (`npm run test`)
- [ ] 사용되지 않는 더미 데이터 파일 정리
