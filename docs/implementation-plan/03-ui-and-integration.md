<!-- 사용자 인터페이스 및 데이터 연동 계획 -->
# Phase 3: UI 대시보드 및 입력 폼 구현 (UI & Integration)

## 1. 개요
* Tanstack Query와 Axios를 사용하여 서버(Route Handlers)와 데이터를 동기화.
* UI 및 디자인 시스템은 사용자가 Stitch AI로 사전 제작한 후 MCP를 통해 연동하며, 이를 TailwindCSS로 완벽하게 복제하여 컴포넌트를 개발함.
* 단위 기능 개발 시 항상 UI 컴포넌트나 연동 로직에 대한 Vitest 테스트 병행(TDD).

## 2. 데이터 페칭 및 전역 상태 세팅
* `useQuery` 훅을 통해 `Company` 리스트(배출량 포함) 및 `Post` 이력을 주기적으로 패치.
* 필요에 따라 UI 상태(현재 선택된 Scope 탭 등)는 Zustand로 관리.

## 3. PCF 대시보드 구현
대시보드 컴포넌트를 기능별로 분리:
* **Scope별 분석 차트/표**: Kender 기준 Scope 1, 2, 3 전체 배출량 및 PCF(제품 1단위당 배출량)
* **회사별 분석 차트/표**: 자사 및 5개 협력사 전체 배출량 및 PCF
* **측정 범위별 분석 차트/표**: Cradle to Gate vs Cradle to Grave 비교
* **생애 주기별 분석 차트/표**: PCF 1단계 ~ 5단계 분포

## 4. 데이터 입력 폼 구현
* 사용자가 4가지 항목(기타 생산량, 배송 거리, 픽업 수입, 기타줄 수입) 중 하나를 선택하고 수치를 입력하는 폼 컴포넌트 구현.
* 제출(Submit) 시 Phase 2에서 만든 비즈니스 로직을 통해 분산 할당된 결과를 계산하고, `useMutation`을 통해 서버(`/api/posts` 및 `/api/companies`)에 데이터 반영.
* 성공 시 쿼리 무효화(Invalidation)를 통해 대시보드 및 Post 이력 즉시 갱신.
