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
- 문체: 간결체 (`~이다.`, 명사형 종결). 서술형 지양. **주어 생략 지양** — 누가 무엇을 하는지 명시.
- 구성 흐름: 개요 → 큰 그림(다이어그램) → **사전 지식/용어** → **비교 예시(익숙한 것과 대조)** → 구성요소 상세 → 전체 코드 → 라인별 해설 → 경험/교훈 → Best Practices.
- **비교 우선 원칙**: 독자가 이미 아는 도구·개념과의 대조를 구성요소 상세 표보다 앞에 배치한다. 비교가 설명보다 이해가 빠르다.

## 토큰 절약
- 요청 범위 파일만 읽기. 전체 스캔 금지.
- 파일 읽기 시 필요한 줄 범위만 조회.
- 변경점(delta) 중심 보고. 전체 재설명 금지.
- `quartz/`, `public/` 내부는 분석 대상 제외.
- **Edit 등록용 Read는 1~3줄만**. Edit는 "한 번이라도 읽힌 파일"이면 통과하므로, 단순히 Edit 권한을 여는 목적이라면 `offset=L-1, limit=2` 정도로 충분하다. 전체 파일을 다시 읽지 않는다.
- **대량 치환은 `sed` 한 방**. 같은 문자열을 N개 파일에서 바꿀 때는 Edit N회 대신 `git ls-files -z | xargs -0 sed -i 's/old/new/g'` 한 번으로 처리.
- **시스템 주입 파일 재Read 금지**. `CLAUDE.md`, SessionStart 훅 결과 등 이미 컨텍스트에 들어온 파일은 다시 Read하지 않는다.
- **`grep -n` 출력 텍스트 신뢰**. 첫 Grep의 `파일:라인:내용` 출력을 그대로 `old_string`으로 써도 되며, 확인용 재Read 금지.

## 로컬 실행
- **반드시 Docker 사용**. `npx quartz build --serve` 직접 실행 금지.
- 접속 포트: `http://localhost:8080`
- **콘텐츠만 작업**: `docker-compose up -d`
- **엔진(`quartz/`) 수정 시 dev 모드**: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build`
- 대화 맥락에 "디자인/테마/컴포넌트/레이아웃/스타일" 등 엔진 수정 키워드 → 자동으로 dev 모드로 전환
- 작업 종료·커밋 단계·콘텐츠 작업 복귀 → 기본 모드로 복귀 (`down` 후 `up -d`)
- 실수 방지: `quartz/**` 편집 시 PreToolUse 훅이 dev 모드 여부 검사

## 자동화 자산
- 스킬: `/new-note`, `/polish-note`, `/add-terms` (`.claude/skills/`)
- 커맨드: `/compose-note`, `/review-note`, `/audit-project`, `/commit-note`, `/engine-on`, `/engine-off` (`.claude/commands/`)
- 서브에이전트: `note-reviewer`, `note-linker`, `content-auditor`, `docs-auditor`, `env-auditor` (`.claude/agents/`)
- 훅:
  - `PreToolUse`: `quartz/**` 편집 시 dev 모드 검사 (`.claude/hooks/check-engine-mount.sh`)
  - `PostToolUse`: `.md` frontmatter·문체 검증 (`.claude/hooks/validate-md.sh`)
- 운영 가이드: `docs/AI 운영 가이드.md`
- 레퍼런스 노트: `content/개발/git/6. git-hooks.md` (6단 흐름 예시)

## 환경 변경 시 문서 동기화
- 대상: `.claude/` 하위 파일(agents, skills, commands, hooks, settings) + `CLAUDE.md` 자체
- 수정 후 `docs/AI 운영 가이드.md`에 변경사항을 반영한다. `CLAUDE.md` 지침을 바꿨으면 운영 가이드의 관련 섹션도 일치하는지 확인한다.
- 별도 에이전트를 띄우지 않고, 방금 수정한 맥락을 그대로 활용해 직접 업데이트한다.
