# 구현 계획: 대시보드 UI 개선 및 loading.tsx 로딩 스피너 구현 (Phase 6 추가 보완)

## 목표
* 대시보드 상단 날짜 필터 UI의 크기를 키워 사용자 가독성과 클릭 편의성을 대폭 향상.
* Next.js의 `loading.tsx` 컨벤션을 적용하여 큼직하고 세련된 로딩 스피너 UI 구축.
* Tanstack Query의 `useQuery`를 `useSuspenseQuery`로 전환하여, 필터 조작이나 최초 진입 시 로딩 상태가 Next.js의 서스펜스 및 `loading.tsx`와 자연스럽게 유기적으로 동작하도록 연동.

## 세부 구현 단계

### 1. loading.tsx 로딩 스피너 컴포넌트 개발
* `src/app/loading.tsx` 파일 신규 생성.
* 첫 라인에 한국어 주석으로 역할 설명 명시.
* Tailwind CSS를 활용해 모던하고 큼직한 애니메이션 스피너 컴포넌트 마크업.
* Glassmorphism 및 플랫폼의 메인 색상 톤(Primary/Surface)에 부합하는 고급스러운 디자인 적용.

### 2. page.tsx 내 데이터 패칭 리팩토링 및 UI 조정
* `src/app/page.tsx`에서 `@tanstack/react-query`의 `useQuery`를 `useSuspenseQuery`로 교체.
* 이에 맞춰 로딩 상태 체크 분기문(`if (isLoading) ...`)은 React Suspense와 `loading.tsx`가 처리하므로 컴포넌트 내부에서 제거하여 단순화.
* 날짜 필터 영역의 각 드롭다운 요소(`select` 및 `span` 등)의 패딩, 폰트 크기, 영역 높이를 상향 조정하여 직관적이고 시원한 레이아웃 제공.

### 3. 빌드 및 테스트 재검증
* `npm run test`를 실행하여 컴포넌트 구조 변경에 의한 사이드 이펙트나 테스트 깨짐이 없는지 검증.
* `npm run build`를 실행하여 타입 체킹, 린터 에러 및 빌드 무결성 재확인.

## 제약 사항
* 한국어 문장 끝에 콜론(`:`)을 배제하고 온점(`.`) 등을 사용합니다.
* 새로 생성하는 `src/app/loading.tsx` 상단에 1줄 한국어 주석을 작성합니다.
