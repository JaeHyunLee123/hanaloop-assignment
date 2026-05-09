# 컨텍스트 노트

## 결정 사항 및 이유

- **로직 분리 위치**: `src/lib/emission-service.ts`를 신설하여 `applyEmissions`를 배치함. 이는 `api.ts`와 `fake-db.ts` 간의 순환 참조를 방지하고, 계산 로직을 순수 함수에 가깝게 유지하기 위함임.
- **상태 관리**: `applyEmissions`는 원본 배열을 직접 수정(mutate)하는 대신, 인자로 받은 `companies`와 `posts`를 업데이트함. (참고: `companies` 내부의 `emissions` 배열은 `mergeEmissions`를 통해 새 배열로 교체됨).
- **ID 생성**: 사용자의 요청에 따라 `crypto.randomUUID()`를 사용하여 더미 데이터의 ID를 생성함.
- **데이터 생성 방식**: 매월 모든 액션 타입(`guitar_production`, `delivery`, `pickup_import`, `string_import`)을 1회씩 수행하는 것으로 시뮬레이션함. (실제 운영 상황과 유사하게 데이터가 누적됨).
- **테스트 수정**: `EMISSION_FACTORS.PRODUCT_USE_PER_UNIT`이 `0`으로 변경됨에 따라, 음수 입력 시 배출량이 무조건 0보다 작아야 한다는 테스트 케이스(`emissions-calculator.test.ts`)를 `0` 이하인지 확인하도록 수정함.
