# CLAUDE.md

<!-- 프로젝트 공통 지침의 원본은 AGENTS.md — 여기는 Claude Code 전용 규칙만. -->
@AGENTS.md

## 토큰 절약
- 요청 범위 파일만 읽기. 전체 스캔 금지.
- 파일 읽기 시 필요한 줄 범위만 조회.
- 변경점(delta) 중심 보고. 전체 재설명 금지.
- `quartz/`, `public/` 내부는 분석 대상 제외.
- **Edit 등록용 Read는 1~3줄만**. Edit는 "한 번이라도 읽힌 파일"이면 통과하므로, 단순히 Edit 권한을 여는 목적이라면 `offset=L-1, limit=2` 정도로 충분하다. 전체 파일을 다시 읽지 않는다.
- **대량 치환은 `sed` 한 방**. 같은 문자열을 N개 파일에서 바꿀 때는 Edit N회 대신 `git ls-files -z | xargs -0 sed -i 's/old/new/g'` 한 번으로 처리.
- **시스템 주입 파일 재Read 금지**. `CLAUDE.md`, SessionStart 훅 결과 등 이미 컨텍스트에 들어온 파일은 다시 Read하지 않는다.
- **`grep -n` 출력 텍스트 신뢰**. 첫 Grep의 `파일:라인:내용` 출력을 그대로 `old_string`으로 써도 되며, 확인용 재Read 금지.

## 자동화 자산
- 스킬: `/new-note`, `/polish-note`, `/add-terms` (`.claude/skills/`)
- 커맨드: `/compose-note`, `/review-note`, `/audit-project`, `/commit-note`, `/engine-on`, `/engine-off` (`.claude/commands/`)
- 서브에이전트: `note-reviewer`, `note-linker`, `content-auditor`, `docs-auditor`, `env-auditor` (`.claude/agents/`)
- 훅:
  - `PreToolUse`: `quartz/**` 편집 시 dev 모드 검사 (`.claude/hooks/check-engine-mount.sh`)
  - `PostToolUse`: `.md` frontmatter·문체 검증 (`.claude/hooks/validate-md.sh`)
- 운영 가이드: `docs/AI 운영 가이드.md`
- 레퍼런스 노트: `content/개발/git/6. git-hooks.md` (6단 흐름 예시)
