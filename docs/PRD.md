<!-- 탄소배출관리 플랫폼 기획 및 요구사항을 정리한 제품 요구사항 정의서 -->
# 탄소배출관리 플랫폼 PRD (Product Requirements Document)

## 1. 개요 (Overview)
* **제품명**: Kender 탄소배출관리 플랫폼
* **목적**: 고객사(Kender)의 가치사슬(Value Chain) 전반에서 발생하는 부품 조달, 제품 생산, 운송 및 사용/폐기 데이터를 입력받아, 전체 온실가스 배출량과 제품 1단위당 탄소 발자국(PCF)을 자동으로 계산 및 시각화하는 B2B 솔루션.

## 2. 도메인 용어 및 정의 (Terminology)
상세 내용은 `CONTEXT.md` 참조.
* **PCF (Product Carbon Footprint)**: 제품 1단위 생산, 소비, 폐기 등 전 과정에서 발생하는 온실가스 배출량.
* **전체 배출량**: 발생한 온실가스의 총량.
* **GHG Scope 1, 2, 3**: 온실가스 직/간접 배출 범위. (플랫폼 내 모든 Scope 분류는 오직 **자사(Kender)** 관점으로만 치환됨)
* **PCF 5단계**: 1단계(원자재 조달) ~ 5단계(제품 폐기)
* **Cradle to Gate / Grave**: 생산 종료 시점까지의 배출량(Gate) vs 사용 및 폐기를 포함한 생애주기 전체 배출량(Grave).

## 3. 핵심 요구사항 (Core Requirements)

### 3.1. 고정 시스템 주체 (Company Entities)
플랫폼 내에는 다음 6개의 `Company` 객체가 하드코딩되어 고정적으로 상호작용함.
1. **Kender (자사)**: 본사 및 기타 자체 공장
2. **중국기타줄회사**: 기타줄 생산 공급사
3. **인도네시아픽업회사**: 픽업 생산 공급사
4. **중국수입회사**: 기타줄 수입 해상/항공 운송사
5. **인도네시아수입회사**: 픽업 수입 해상/항공 운송사
6. **국내배송회사**: 부품 공장 입고 운송 및 최종 완성품 소비자 배송

### 3.2. PCF 및 배출량 대시보드
대시보드에서는 다음 분석 기준별로 **전체 온실가스 배출량**과 **제품 단위당 PCF**를 각각 구분하여 조회할 수 있어야 함.
* **Scope별 분석**: Scope 1, 2, 3 기준
* **회사별 분석**: 자사(Kender) 및 5개 협력사 기준
* **측정 범위별 분석**: Cradle to Gate vs Cradle to Grave
* **생애 주기별 분석**: PCF 1단계 ~ 5단계

### 3.3. 데이터 입력 및 자동 계산 파이프라인
사용자의 단일 입력이 백엔드 내부에서는 Kender 기준의 여러 Scope 및 PCF 단계로 분리되어 여러 Company 객체로 분산 합산됨.

#### 공통 동작 규칙
1. 입력 수치 기반 자체 알고리즘(배출계수, 표준 가정치 등)으로 배출량 계산.
2. `ExtendedGhgEmission` 객체를 생성하여 대상 `Company.emissions`에 누적(`push`).
   * *조건*: 해당 회사, 월(`yearMonth`), 배출원(`source`)이 완전히 일치할 경우에만 기존 객체에 합산.
3. `Post` 객체로 입력 이력 기록.
   * *조건*: `title`은 "Kender 2026-05 통합 배출 이력" 등 포괄적 명칭을 고정으로 사용. 동월 이력이 존재하면 기존 `title`을 유지하고 `content`에 줄바꿈으로 내용을 덧붙임.

#### 입력 항목별 상세 분산 로직
* **기타 생산량 입력** (예: 10대 생산)
  * Kender (Scope 1, 2단계): 화석연료 배출량 추가
  * Kender (Scope 2, 2단계): 전력 배출량 추가
  * Kender (Scope 3, 4단계): 제품 사용 배출량 추가
  * Kender (Scope 3, 5단계): 제품 폐기 배출량 추가
* **기타 배송 총 거리 입력**
  * 국내배송회사 (Scope 3, 3단계): 완성품 소비자 배송 배출량 추가
* **픽업 수입 개수 입력**
  * 인도네시아픽업회사 (Scope 3, 1단계): 부품 생산 배출량 추가
  * 인도네시아수입회사 (Scope 3, 3단계): 국제 운송 배출량 추가
  * 국내배송회사 (Scope 3, 3단계): 국내 내륙 운송 배출량 추가
* **기타줄 수입 개수 입력**
  * 중국기타줄회사 (Scope 3, 1단계): 부품 생산 배출량 추가
  * 중국수입회사 (Scope 3, 3단계): 국제 운송 배출량 추가
  * 국내배송회사 (Scope 3, 3단계): 국내 내륙 운송 배출량 추가

## 4. 데이터 모델 설계 (Data Models)
기본 제공된 타입을 확장하여 사용.

```typescript
// 1. 기존 배출량 타입 확장 (Scope 및 PCF 생애주기 식별 용이성 목적)
export type ExtendedGhgEmission = GhgEmission & {
  scope: 1 | 2 | 3;
  pcfStage: 1 | 2 | 3 | 4 | 5;
};

// 2. Company 엔티티 (고정 6개 인스턴스)
export type Company = {
  id: string;
  name: string;
  country: string; // Country.code
  emissions: ExtendedGhgEmission[];
};

// 3. Post 엔티티 (입력 이력 로깅용)
export type Post = {
  id: string;
  title: string; // 예: "Kender 2026-05 통합 배출 이력"
  resourceUid: string; // Company.id
  dateTime: string; // e.g. "2026-05"
  content: string; // 줄바꿈을 통해 이력 누적
};
```
