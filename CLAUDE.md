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

## 로컬 실행
- **반드시 Docker 사용**. `npx quartz build --serve` 직접 실행 금지.
- 접속 포트: `http://localhost:8080`
- **콘텐츠만 작업**: `docker-compose up -d`
- **엔진(`quartz/`) 수정 시 dev 모드**: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build`
- 대화 맥락에 "디자인/테마/컴포넌트/레이아웃/스타일" 등 엔진 수정 키워드 → 자동으로 dev 모드로 전환
- 작업 종료·커밋 단계·콘텐츠 작업 복귀 → 기본 모드로 복귀 (`down` 후 `up -d`)
- 실수 방지: `quartz/**` 편집 시 PreToolUse 훅이 dev 모드 여부 검사
- 상세: `docs/Docker 개발 모드.md`

## 자동화 자산
- 스킬: `/new-note`, `/polish-note`, `/add-terms` (`.claude/skills/`)
- 서브에이전트: `note-reviewer`, `note-linker` (`.claude/agents/`)
- 훅:
  - `PreToolUse`: `quartz/**` 편집 시 dev 모드 검사 (`.claude/hooks/check-engine-mount.sh`)
  - `PostToolUse`: `.md` frontmatter·문체 검증 (`.claude/hooks/validate-md.sh`)
- 운영 가이드: `docs/AI 운영 가이드.md`
- 레퍼런스 노트: `content/개발/git/5. git-hooks.md` (6단 흐름 예시)
