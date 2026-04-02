# Jintae Brain - AI 작업 지침

## 프로젝트
- Quartz v4 기반 개발 공부 노트 사이트
- 호스팅: GitHub Pages (jintae-choi.github.io/Jintae_Brain)
- 언어: ko-KR

## 수정 우선순위
1. 콘텐츠: `content/` 마크다운
2. 설정: `quartz.config.ts`, `quartz.layout.ts`
3. 배포: `.github/workflows/deploy.yml`
4. `quartz/` 코어 — 가급적 미수정

## 콘텐츠 규칙
- 템플릿: `content/templates/기본 문서 템플릿.md`
- frontmatter 필수: title, tags, date
- 문체: 간결체 (`~이다.`, 명사형 종결). 서술형 지양.
- 구성: 큰 흐름 → 디테일 순서. 개요/전체 구조 먼저, 상세는 그 다음.

## 토큰 절약
- 요청 범위 파일만 읽기. 전체 스캔 금지.
- 파일 읽기 시 필요한 줄 범위만 조회.
- 변경점(delta) 중심 보고. 전체 재설명 금지.
- `quartz/`, `public/` 내부는 분석 대상 제외.
