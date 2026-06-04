# 구현 계획: Drizzle ORM 및 Supabase 연동을 통한 실제 API 전환

## 목표
기존 메모리 기반의 더미 API(`src/lib/api.ts` 및 `src/lib/fake-db.ts`)를 Drizzle ORM과 Supabase PostgreSQL을 연동한 실제 데이터베이스 기반 API 코드로 전환합니다. 이를 통해 영속성, 데이터 정속성, 트랜잭션 안전성을 확보합니다.

## 세부 구현 단계

### 1. 패키지 설치 및 환경 설정
* Drizzle ORM과 PostgreSQL 연결 드라이버를 설치합니다.
* 개발 도구로 `drizzle-kit`과 `tsx`를 추가합니다.
* `.env.local` 환경 변수 파일에 Supabase 커넥션 주소(`DATABASE_URL`, `DIRECT_URL`)를 정의합니다.

### 2. Drizzle DB 스키마 정의 및 설정
* `src/db/schema.ts` 파일을 생성하여 `countries`, `companies`, `emissions`, `posts` 테이블의 관계와 스키마를 정의합니다.
* `emissions` 테이블에는 `(company_id, year_month, source, scope, pcf_stage)` 복합 유니크 제약조건을 정의하여 중복 적재를 방지합니다.
* `drizzle.config.ts` 파일을 설정하여 스키마 경로와 마이그레이션 폴더 정보를 정의합니다.

### 3. 데이터베이스 커넥션 설정
* `src/db/index.ts` 파일을 생성하여 Next.js의 개발 모드 핫 리로드(Hot-reload) 시 연결 인스턴스가 중복 생성되는 문제를 방지하는 글로벌 커넥션 풀을 구현합니다.

### 4. 스키마 마이그레이션 실행
* Drizzle Kit 명령어를 사용하여 작성된 스키마를 기반으로 마이그레이션 SQL을 생성하고 Supabase 데이터베이스에 반영합니다.

### 5. 독립형 시드 스크립트 작성 및 실행
* `src/db/seed.ts` 파일을 작성합니다. 기존 `src/lib/fake-db.ts`의 시드 로직(2025-01부터 현재 전월까지의 데이터 생성 및 누적 계산 파이프라인)을 그대로 포팅하여 데이터베이스에 적재합니다.
* `tsx` 실행기를 사용하여 일회성으로 DB를 초기화하고 데이터를 채웁니다.

### 6. 실제 API 코드 구현 (`src/lib/api.ts` 전환)
* `fetchCountries`, `fetchCompanies`, `fetchPosts`, `createOrUpdatePost`, `submitEmissions`, `getDashboardStats` 함수를 Drizzle ORM 쿼리로 재작성합니다.
* `submitEmissions` 호출 시 계산된 배출량을 `emissions` 테이블에 복합 유니크 제약조건을 이용해 Upsert(합산)하고, 포스트는 동일 월/회사 기준으로 덧붙이거나 신규 생성하는 전체 과정을 **단일 트랜잭션**으로 처리합니다.
* `getDashboardStats`에서는 모든 집계(Scope별, PCF 단계별, 회사별, 월별)를 인메모리 루프 대신 SQL의 Group By 및 SUM 연산 혹은 Drizzle 관계형 쿼리를 활용하도록 리팩토링합니다.

### 7. 테스트 코드 검증
* 기존의 인메모리 DB 전제 테스트 코드를 파악하고, 실제 데이터베이스 연결 상황에 알맞게 수정하거나 테스트 환경을 검증합니다.

## 제약 사항
* 기존 프론트엔드 코드와의 타입 호환성을 위해 API 반환 객체 구조 및 기존 타입 정의(`Country`, `Company`, `Post` 등)를 그대로 유지합니다.
* 한국어 주석으로 파일 첫 줄에 설명(Header Comment)을 작성합니다.
