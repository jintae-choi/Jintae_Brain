# Jintae Brain - Quartz v4 개발 공부 사이트

## 프로젝트 개요
- **프레임워크**: Quartz v4 (정적 사이트 생성기)
- **용도**: Markdown 기반 개발 공부 노트 사이트
- **호스팅**: GitHub Pages (jintae-choi.github.io/Jintae_Brain)
- **언어**: 한국어 (locale: ko-KR)

## 핵심 파일 (수정 가능)
- `quartz.config.ts` — 사이트 전체 설정
- `quartz.layout.ts` — 레이아웃 구성
- `content/` — Markdown 문서 디렉토리 (여기에 글을 씀)
- `.github/workflows/deploy.yml` — GitHub Actions 배포

## 현재 완료된 설정
- 한글 폰트 (Noto Sans KR) 적용 완료
- locale: ko-KR 설정 완료
- SPA 모드, Popover, 백링크, 그래프뷰 활성화
- 코드 하이라이팅 (github-light/dark) 설정 완료
- GitHub Actions 배포 워크플로우 작성 완료
- baseUrl: jintae-choi.github.io/Jintae_Brain

## 콘텐츠 작성 규칙
- 문서 위치: `content/` 하위
- 카테고리: 폴더로 구분 (content/개발/JavaScript/ 등)
- Frontmatter 필수: title, tags, date
- 백링크: `[[문서명]]` 위키링크 사용
- 태그 체계: #JavaScript, #React, #CS기초 등

## 빌드/배포
- 빌드: `npx quartz build`
- 로컬 미리보기: `npx quartz build --serve`
- 배포: main 브랜치 push 시 자동 (GitHub Actions)

## 토큰 절약 운영 원칙
- 불필요한 전체 스캔 금지: 요청 범위 파일만 우선 확인
- 파일 읽기 최소화: 전체 파일 대신 필요한 라인 범위만 조회
- 중복 설명 축소: 변경점(delta) 중심으로만 보고
- 수정 우선순위: 설정/콘텐츠 관련 파일 우선, `quartz/` 코어는 가급적 미수정
- 결과 보고 형식: 핵심 요약 + 수정 파일 + 다음 액션 1~2개만 제시
- 대화 길어질 때: 주제 전환 시 새 세션 권장 (컨텍스트 누적 방지)
- 컨텍스트 제외 준수: `.copilotignore` 규칙을 기본 전제

## 주의사항
- `quartz/` 내부 코어 코드는 가급적 수정하지 않음
- `public/` 폴더는 빌드 출력물 (직접 수정 금지)
- 문서 작성 시 근거 기반 작성 선호
