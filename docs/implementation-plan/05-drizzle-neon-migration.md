<!-- Drizzle ORM 및 Neon 연동 구현 계획 문서 -->
# Drizzle ORM 및 Neon 연동을 통한 실제 API 마이그레이션 계획

본 문서는 기존의 메모리 기반 페이크 API(`src/lib/api.ts`, `src/lib/fake-db.ts`)를 Neon PostgreSQL 데이터베이스와 Drizzle ORM 환경으로 전환하기 위한 구체적인 개발 계획서입니다.

## 1. 패키지 설치 및 환경 설정

### 패키지 설치
터미널에서 아래 패키지들을 설치합니다.
* `npm install drizzle-orm @neondatabase/serverless`
* `npm install -D drizzle-kit tsx`

### 환경 변수 구성
`.env.local` 파일에 다음과 같이 Neon 데이터베이스 연결 주소를 정의합니다.
```env
DATABASE_URL=postgresql://[user]:[password]@[project-id].ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

## 2. 데이터베이스 스키마 및 설정

### Drizzle 설정 파일 (`drizzle.config.ts`)
프로젝트 루트 경로에 `drizzle.config.ts` 파일을 생성합니다.
```typescript
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

### 테이블 스키마 정의 (`src/db/schema.ts`)
실제 API 전환에 맞게 타입을 정의하고 외래키 관계를 맺습니다.
* **`countries`**: `code` (기본키), `name`
* **`companies`**: `id` (기본키), `name`, `country_code` (`countries.code`를 참조하는 외래키)
* **`emissions`**: `id` (기본키, 자동 생성 UUID 또는 Serial), `company_id` (`companies.id`를 참조하는 외래키), `year_month`, `source`, `emissions` (numeric/double precision), `scope`, `pcf_stage`.
  * `(company_id, year_month, source, scope, pcf_stage)` 5개 컬럼의 복합 유니크 제약조건을 설정합니다.
* **`posts`**: `id` (기본키, UUID), `title`, `resource_uid` (`companies.id`를 참조하는 외래키), `date_time`, `content`

### 데이터베이스 커넥션 설정 (`src/db/index.ts`)
Next.js의 핫 리로드 시 발생하는 연결 누수를 방지하기 위해 싱글톤 패턴으로 Drizzle 클라이언트를 생성합니다. Neon의 `@neondatabase/serverless` 드라이버를 임포트하여 설정합니다.

## 3. 데이터 시딩 및 마이그레이션

### 마이그레이션 실행
스키마 작성이 완료되면 다음 명령어를 순서대로 실행합니다.
1. `npx drizzle-kit generate`
2. `npx drizzle-kit push` (또는 마이그레이션 실행)

### 독립형 시드 스크립트 작성 (`src/db/seed.ts`)
* 기존 `src/lib/fake-db.ts`의 시드 함수를 포팅합니다.
* `countries`, `companies` 기초 데이터를 먼저 삽입합니다.
* 2025-01부터 현재 전월까지의 기간을 계산하여 각 월별 루프를 돌면서 배출 계산 로직(`applyEmissions`)을 데이터베이스 쿼리로 직접 호출해 데이터를 시딩합니다.
* 실행 명령어: `npx tsx src/db/seed.ts`

## 4. API 마이그레이션 세부 설계 (`src/lib/api.ts`)

기존 API 함수들을 Drizzle 쿼리로 전환합니다.

### `fetchCountries`
* `countries` 테이블의 모든 데이터를 조회하여 반환합니다.

### `fetchCompanies`
* `companies` 테이블을 조회하되, 각 회사에 매칭되는 `emissions` 정보를 Left Join하여 `Company` 타입(중첩 배열 구조)에 맞게 객체 배열로 변환하여 반환합니다.

### `fetchPosts`
* `posts` 테이블의 전체 목록을 조회하여 반환합니다.

### `createOrUpdatePost`
* 전달받은 포스트 객체의 `id` 유무에 따라 데이터베이스에 Insert 또는 Update 쿼리를 보냅니다.

### `submitEmissions` (트랜잭션)
* 단일 DB 트랜잭션(`db.transaction`)으로 묶어 실행합니다.
1. 페이로드의 배출 종류에 따라 배출 계산 엔진(`emissions-calculator.ts`)을 돌려 각 회사별 가중 배출 데이터를 얻습니다.
2. 각 회사별 배출 데이터를 `emissions` 테이블에 **Upsert(ON CONFLICT DO UPDATE)**하여 누적합니다.
3. 동일 회사 및 해당 월에 저장된 `Post`가 있는지 쿼리합니다.
   * 존재하면 content에 덧붙여서 Update를 실행합니다.
   * 존재하지 않으면 신규 Post를 생성하여 Insert를 실행합니다.

### `getDashboardStats`
* 메모리 루프 대신 SQL의 Group By 및 SUM 연산 혹은 Drizzle 관계형 쿼리를 활용해 월별, 회사별, Scope별, PCF 단계별 집계를 수행합니다.
* `cradleToGatePcf` 및 `cradleToGravePcf` 정적 계산값은 기존 로직과 상수를 그대로 유지합니다.

## 5. 검증 계획
* 마이그레이션 및 시딩 완료 후, 프론트엔드 화면의 정상 렌더링을 확인합니다.
* 기존 테스트 도구(`npm run test`)를 실행하여 API 명세 및 쿼리가 제대로 동작하는지 검증합니다. DB 종속적인 환경에 맞추어 테스트 환경 설정을 일부 수정합니다.
