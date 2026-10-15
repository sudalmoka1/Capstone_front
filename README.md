# 증권 뉴스 해체 분석기 — 프론트엔드

서일대학교 캡스톤 프로젝트의 프론트엔드입니다 (Vue 3 + Vite + Tailwind CSS + Lightweight Charts).

- 프론트엔드 (이 저장소): https://github.com/sudalmoka1/Capstone_front
- 백엔드: https://github.com/sudalmoka1/Capstone_back — 이 화면은 백엔드 API(http://localhost:8000)가 실행 중이어야 동작합니다. 백엔드 설치·실행 방법은 백엔드 README를 참고하세요.

## 사전 준비

- Node.js 22.18 이상 또는 24.12 이상

## 설치 및 실행

```sh
git clone https://github.com/sudalmoka1/Capstone_front.git
cd Capstone_front
npm install
npm run dev     # http://localhost:5173
```

배포용 빌드는 `npm run build` (결과물: `dist/`).

## 화면

- **증권 뉴스**: 언론사별 기사 목록, AI 신뢰도 뱃지, 기사 클릭 시 리포트 + 주가 차트
- **분석**: 종목별 언급량·평균 신뢰도, AI 점수별 기사 후 주가 반응

## 테스트용 시간 고정

`.env.development.local`에 `VITE_TEST_NOW=2026-10-08T13:00:00`처럼 지정하면 개발 서버에서 그 시각을 현재 시각으로 사용합니다 (NEW 표시, "N분 전" 등).
