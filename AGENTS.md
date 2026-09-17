# Jintae Brain — 프로젝트 지침 (원본)

> 이 파일이 프로젝트 지침의 **단일 원본**(도구 중립)이다. Codex 등 AGENTS.md를 읽는 도구는 이 파일을
> 네이티브로 로드하고, Claude Code는 `CLAUDE.md`의 `@AGENTS.md` 임포트로 같은 내용을 받는다.
> **전역 지침(`~/.claude/jintae_*.md`, ai-guidelines 클론)이 있으면 그것이 항상 우선한다.** 이 파일은 프로젝트 사실과, 전역 지침이 없는 환경을 위한 요약만 담는다.

## 프로젝트 개요
- Quartz v4 기반 개발 공부 노트 사이트. GitHub Pages **공개** 호스팅(jintae-choi.github.io/Jintae_Brain), 언어 ko-KR, Node 22(`.node-version`).
- 폴더 역할: `content/`(노트 원고 — 유일한 콘텐츠) · `quartz/`(엔진 코어) · `quartz.config.ts`·`quartz.layout.ts`(사이트 설정) · `docs/가이드/`(운영 문서) · `.claude/`(클로드 자동화 자산) · `.github/workflows/deploy.yml`(배포).

## 수정 우선순위
1. 콘텐츠: `content/` 마크다운
2. 설정: `quartz.config.ts`, `quartz.layout.ts`
3. 배포: `.github/workflows/deploy.yml`
4. `quartz/` 코어 — 가급적 미수정

## 콘텐츠 규칙
- **GitHub Pages 공개 사이트다.** 회사 내부 정보(코드·스키마·서버명·사내 시스템·실명)를 절대 포함하지 않는다. 콘텐츠 작성·검토 시 항상 확인. 확인 명령: `grep -rn -i "<사내 식별자>" --include="*.md" content/`.
- 템플릿: `content/templates/기본 문서 템플릿.md` — 표준 흐름의 단일 원본(개요 → 큰 그림 → 사전 지식 → 비교 예시 → 구성요소 → 전체 코드 → 라인별 해설 → 핵심 통찰 → 경험/교훈 → Best Practices).
- frontmatter 필수: title, tags, date
- **본문 제목 H1(`# 제목`) 금지** — 제목은 frontmatter `title`이 페이지 헤더에 자동 표시되므로 본문에 다시 쓰면 중복이다. 본문 최상위 섹션은 `## 개요`부터 시작한다(대섹션 `##`, 하위 `###`). PostToolUse 훅(`validate-md.sh`)이 본문 H1·개요 누락·frontmatter 누락·서술형 과다를 검사해 경고한다.
  - **예외: 폴더 인덱스(`index.md`)는 본문 H1을 유지한다** — 폴더 랜딩 페이지 관례. 훅도 index.md 는 H1·개요 검사에서 제외한다.
- 문체: 간결체 (`~이다.`, 명사형 종결). 서술형 지양. **주어 생략 지양** — 누가 무엇을 하는지 명시.
- **비교 우선 원칙**: 독자가 이미 아는 도구·개념과의 대조를 구성요소 상세 표보다 앞에 배치한다. 비교가 설명보다 이해가 빠르다.

## 로컬 실행
- **로컬웹으로 띄운다**: `npx quartz build --serve` → `http://localhost:8080`. `content/`뿐 아니라 `quartz.config.ts`·`quartz.layout.ts`·`quartz/` 안의 `.ts`·`.tsx`·`.scss`·`static/` 변경도 감시해 자동 리빌드한다(`quartz/cli/handlers.js` watch 목록) — 엔진 수정에 별도 모드 전환이 필요 없다.
- **Docker로 띄우지 않는다.** `docker-compose*.yml`·`Dockerfile`·`.dockerignore`는 보존용(추후 재사용 여지)이며 일상 미리보기엔 쓰지 않는다.

## 세션 규약 (메모리 — 공개 repo 예외)
- 이 repo는 공개라 개인정보가 섞이는 메모리를 repo 안(`memory/`)에 두지 않는다. 클로드는 이 컴퓨터의 로컬 메모리(`~/.claude/projects/D--git-Jintae-Brain/memory/`, 현황 SSOT `project-status.md`)를 자동 로드한다. 다른 도구·다른 컴퓨터에는 이 메모리가 없으므로, 이어갈 상태는 이 파일·`docs/가이드/`·git 로그로 파악한다.
- 회사 내부 정보 금지는 메모리·문서·노트 전부에 적용된다.

## AI 자산 위치
- 클로드 코드: `.claude/skills/`(슬래시 스킬 7개) · `.claude/agents/`(읽기 전용 서브에이전트 5개) · `.claude/hooks/`(SessionStart·PostToolUse 2개) · `.claude/settings.json`(훅 등록). 사용법·설계 이유는 `docs/가이드/01_AI 운영 가이드.md`.
- 코덱스: 이 파일만 네이티브 로드한다. `.claude/skills/`는 코덱스가 탐색하지 않는다(코덱스 0.153은 저장소 스킬을 `.agents/skills/`에서만 찾는다). 노트 작성은 클로드 전용 흐름이라 코덱스용 스킬 사본을 두지 않는다 — 필요해지면 `.agents/skills/` 원본 + `.claude/skills/` 포인터 구조로 전환한다.
- `.claude/` 하위·`AGENTS.md`·`CLAUDE.md`를 바꾸면 `docs/가이드/01_AI 운영 가이드.md`를 같은 맥락에서 바로 갱신한다(별도 에이전트 불필요). `README.md`의 링크도 함께 확인한다.

## 작업 규칙 요약 (전역 지침이 없는 환경용 — 있으면 전역 지침이 우선)
- 지침 원본 전체: github.com/jintae-choi/ai-guidelines (**private**) — `~/.claude` 루트에 클론하면 전역 CLAUDE.md가 클로드에 자동 로드되고, SessionStart 훅이 `~/.codex/AGENTS.md`(코덱스 전역)도 자동 생성·동기화한다(방법은 그 레포 README).
- 항상 한국어(응답·문서·커밋·주석).
- 보여주고 → 승인 → 적용. 작게 쪼개 한 단계씩, 단계마다 "무슨 문제 → 어떻게 바꿈 → 현재 상태" 보고.
- 추측 금지: 코드·실측 근거(`파일:라인`, 실행 결과)와 함께 말한다. 검증 없이 "다 됐다" 금지 — 노트는 로컬웹 실화면으로 렌더를 확인한다.
- 커밋/푸시·삭제는 사용자 승인 후. 이력 재작성(force)은 사유 설명 + 승인 필수.
- 결정은 사용자가 한다: 추천 + 이유 + 트레이드오프를 제시하고 고르게 한다.
- 쉬운 설명이 1순위: 줄임말 금지, 실제 이름·구체 예시·실제 값, 비교는 표로.

## 모델 운용 (우선순위: 퀄리티 > 토큰 절약)
- 상/하위 모델과 상위 모델 기한의 SSOT = `~/.claude/jintae_클로드운용.md`(클로드) · `~/.claude/jintae_코덱스운용.md`(코덱스) — 여기에 날짜 사본을 두지 않는다.
- 노트 구성·설계·감사 = 상위 모델, 정말 단순한 기계적 작업(치환·index 등록)만 하위 모델. 애매하면 상위.
