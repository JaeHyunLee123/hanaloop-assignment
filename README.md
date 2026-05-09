# Kender 탄소배출관리 플랫폼 (Kender Carbon Management Platform)

기업의 가치사슬(Value Chain) 전반에서 발생하는 부품 조달, 제품 생산, 운송 및 사용/폐기 데이터를 통합 관리하여, 전체 온실가스 배출량과 제품 단위당 탄소 발자국(PCF)을 자동으로 산정하고 시각화하는 B2B 솔루션입니다.

## 🔗 프로젝트 배포 링크
https://hanaloop-assignment-nu.vercel.app/

## 📅 프로젝트 타임라인

총 11시간의 집중 개발 과정을 통해 완성되었습니다.

- **4시간**: 도메인 지식 습득 및 탄소 배출 산정 로직 연구.
- **3시간**: 프로젝트 아키텍처 설계 및 세부 개발 계획 수립.
- **3시간**: TDD 기반의 코어 로직 구현 및 UI 개발.
- **1시간**: 프로젝트 문서화 및 최종 검토.

## 🤖 AI 사용 범위
- **자료 수집 및 코드 작성**: 도메인 관련 자료 조사 및 반복적인 코드 패턴 작성에 AI를 보조 도구로 활용하였습니다.

### 프로젝트 설계는 ai 도움 없이 진행
 - 본 프로젝트의 전체적인 도메인 모델 설계, 데이터 흐름 정의, 아키텍처 구성 및 세부 비즈니스 로직 설계는 AI의 도움 없이 개발자가 직접 수행하였습니다.

## 📄 프로젝트 설명 문서
- 원활한 프로젝트 이해를 위해 설명 문서를 먼저 읽는것을 권장드립니다.

[하나루프 과제 소개 pdf 다운로드](https://github.com/user-attachments/files/27545669/-.pdf)

[하나루프 과제 소개 pdf 웹에서 읽기](https://github.com/JaeHyunLee123/hanaloop-assignment/blob/main/%E1%84%92%E1%85%A1%E1%84%82%E1%85%A1%E1%84%85%E1%85%AE%E1%84%91%E1%85%B3%20%E1%84%80%E1%85%AA%E1%84%8C%E1%85%A6%20%E1%84%89%E1%85%A9%E1%84%80%E1%85%A2%20-%20%E1%84%8B%E1%85%B5%E1%84%8C%E1%85%A2%E1%84%92%E1%85%A7%E1%86%AB.pdf)

## 🎬 프로젝트 시연 영상

https://github.com/user-attachments/assets/f89bcce6-0424-4510-a5e7-cd7d01fddad4

## 📸 프로젝트 스크린샷

### 대시보드 (Dashboard)
- 전체 탄소 배출 현황을 한눈에 파악할 수 있는 대시보드 이미지입니다.
<img width="800" alt="Screenshot 2026-05-09 at 1 32 17 PM" src="https://github.com/user-attachments/assets/f17d5be9-0df8-4bd9-9804-8cc768923926" />

### 이번 달 대시보드 (Monthly Dashboard)
- 당월 배출 데이터와 전월 대비 분석 정보를 제공하는 대시보드 이미지입니다.
<img width="800" alt="Screenshot 2026-05-09 at 1 32 28 PM" src="https://github.com/user-attachments/assets/e12d87ea-1cb5-4bae-b878-a3f31b3342a2" />

### 데이터 입력 (Data Input)
- 생산량, 운송 거리 등 탄소 배출 데이터를 입력하는 폼 이미지입니다.
<img width="800" alt="Screenshot 2026-05-09 at 1 32 36 PM" src="https://github.com/user-attachments/assets/ba415c4d-076d-40ad-a4c1-e7504d7cb6af" />

### 입력 이력 (Posts
- 데이터 입력 이력을 확인할 수 있는 피드 이미지입니다.)
<img width="800" alt="Screenshot 2026-05-09 at 1 32 46 PM" src="https://github.com/user-attachments/assets/0849b7ab-bc42-4351-b43f-81d20a92e702" />

## 🌟 주요 기능
- **자동 배출 산정**: 단일 데이터 입력으로 Kender 관점의 Scope 1, 2, 3 및 PCF 5단계로 자동 분산 계산.
- **다차원 분석**: 회사별, Scope별, PCF 단계별, 측정 범위별(Cradle-to-Gate/Grave) 시각화 제공.
- **이력 관리 시스템**: 입력된 데이터를 기반으로 각 주체별 통합 배출 이력(Post) 자동 생성.
- **도메인 특화 수식**: 표준 부품 비율(BOM)을 기반으로 한 왜곡 없는 제품 단위당 PCF 산출.

## 🚀 시작하기

### 설치
```bash
npm install
```

### 실행
```bash
npm run dev
```

### 테스트 실행
```bash
# Unit & Integration Tests
npm run test
```
