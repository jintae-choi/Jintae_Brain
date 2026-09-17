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

## 편집 안전
- **같은 파일에 Edit을 병렬로 여러 개 보내지 않는다.** 한 응답에서 같은 파일을 여러 군데 고칠 때는 Edit을 하나씩 순차로 보낸다. 서로 다른 파일이면 병렬로 보내도 된다.
- 이유: 동시 Edit은 각자 읽은 시점의 내용에 덮어쓰기 때문에, **전부 "성공"을 반환하고도 일부 수정이 조용히 사라진다**(lost update). 실패 신호가 없어서 보고 시점엔 알 수 없다.
- 실사례: 2026-07-02 한 노트에 Edit 9개를 병렬로 보내 9개 모두 성공을 받았으나 실제로는 8개만 반영됐다. 유실된 1개를 2026-09-17에야 발견했다.
- **여러 군데를 고쳤으면 커밋 전에 `grep -c`로 각 수정이 실제로 들어갔는지 확인한 뒤 완료를 보고한다.** Edit의 "성공" 응답만 믿지 않는다.

## 자동화 자산
- 스킬: `/new-note`, `/polish-note`, `/add-terms` (`.claude/skills/`)
- 커맨드: `/compose-note`, `/review-note`, `/audit-project`, `/commit-note`, `/engine-on`, `/engine-off` (`.claude/commands/`)
- 서브에이전트: `note-reviewer`, `note-linker`, `content-auditor`, `docs-auditor`, `env-auditor` (`.claude/agents/`)
- 훅:
  - `PreToolUse`: `quartz/**` 편집 시 dev 모드 검사 (`.claude/hooks/check-engine-mount.sh`)
  - `PostToolUse`: `.md` frontmatter·문체 검증 (`.claude/hooks/validate-md.sh`)
- 운영 가이드: `docs/AI 운영 가이드.md`
- 레퍼런스 노트: `content/개발/git/6. git-hooks.md` (6단 흐름 예시)
