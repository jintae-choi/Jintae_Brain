# Jintae Brain — AI 작업 지침 (원본)

> 이 파일이 프로젝트 지침의 **단일 원본**(도구 중립)이다. AGENTS.md를 읽는 AI 도구는 이 파일을
> 네이티브로 로드하고, Claude Code는 `CLAUDE.md`의 `@AGENTS.md` 임포트로 같은 내용을 받는다.

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
- **GitHub Pages 공개 사이트다.** 회사 내부 정보(코드·스키마·서버명·사내 시스템)를 절대 포함하지 않는다. 콘텐츠 작성·검토 시 항상 확인.
- 템플릿: `content/templates/기본 문서 템플릿.md`
- frontmatter 필수: title, tags, date
- **본문 제목 H1(`# 제목`) 금지** — 제목은 frontmatter `title`이 페이지 헤더에 자동 표시되므로 본문에 다시 쓰면 중복이다. 본문 최상위 섹션은 `## 개요`부터 시작한다(대섹션 `##`, 하위 `###`). PostToolUse 훅(`validate-md.sh`)이 본문 H1을 감지해 경고한다.
- 문체: 간결체 (`~이다.`, 명사형 종결). 서술형 지양. **주어 생략 지양** — 누가 무엇을 하는지 명시.
- 구성 흐름: 개요 → 큰 그림(다이어그램) → **사전 지식/용어** → **비교 예시(익숙한 것과 대조)** → 구성요소 상세 → 전체 코드 → 라인별 해설 → 경험/교훈 → Best Practices.
- **비교 우선 원칙**: 독자가 이미 아는 도구·개념과의 대조를 구성요소 상세 표보다 앞에 배치한다. 비교가 설명보다 이해가 빠르다.

## 로컬 실행
- **반드시 Docker 사용**. `npx quartz build --serve` 직접 실행 금지.
- 접속 포트: `http://localhost:8080`
- **콘텐츠만 작업**: `docker-compose up -d`
- **엔진(`quartz/`) 수정 시 dev 모드**: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build`
- 대화 맥락에 "디자인/테마/컴포넌트/레이아웃/스타일" 등 엔진 수정 키워드 → 자동으로 dev 모드로 전환
- 작업 종료·커밋 단계·콘텐츠 작업 복귀 → 기본 모드로 복귀 (`down` 후 `up -d`)
- 실수 방지: `quartz/**` 편집 시 PreToolUse 훅이 dev 모드 여부 검사

## 환경 변경 시 문서 동기화
- 대상: `.claude/` 하위 파일(agents, skills, commands, hooks, settings) + `AGENTS.md`·`CLAUDE.md` 자체
- 수정 후 `docs/AI 운영 가이드.md`에 변경사항을 반영한다. `AGENTS.md`·`CLAUDE.md` 지침을 바꿨으면 운영 가이드의 관련 섹션도 일치하는지 확인한다.
- 별도 에이전트를 띄우지 않고, 방금 수정한 맥락을 그대로 활용해 직접 업데이트한다.
