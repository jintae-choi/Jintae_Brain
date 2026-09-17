#!/bin/bash
# SessionStart hook: Claude 세션 시작 시 프로젝트 상태를 초기 컨텍스트에 주입.
# stdout이 Claude의 컨텍스트에 삽입된다 (exit 0 기준).

set -e

echo "# 세션 시작 상태 점검"
echo ""

# git 상태 — 브랜치 + 변경 파일 개수 + 최근 3커밋
branch=$(git branch --show-current 2>/dev/null || echo "(unknown)")
echo "## Git"
echo "- 브랜치: \`$branch\`"
dirty=$(git status --short 2>/dev/null | wc -l | tr -d ' ')
if [ "$dirty" = "0" ]; then
  echo "- 작업트리: clean"
else
  echo "- 작업트리: **수정 중 $dirty개 파일**"
  git status --short 2>/dev/null | head -5 | sed 's/^/  - /'
  [ "$dirty" -gt 5 ] && echo "  - (+$(($dirty - 5))개 더)"
fi
echo "- 최근 커밋:"
git log --oneline -3 2>/dev/null | sed 's/^/  - /'
echo ""

# 로컬웹 상태 — 이 프로젝트는 Docker로 띄우지 않는다 (AGENTS.md 「로컬 실행」)
echo "## 로컬웹 (quartz --serve)"
if ! command -v curl >/dev/null 2>&1; then
  echo "- curl 없음 — 점검 스킵. 실행: \`npx quartz build --serve\`"
elif curl -s -o /dev/null -m 2 http://localhost:8080; then
  echo "- 상태: **실행 중** — http://localhost:8080"
else
  echo "- **안 떠있음**"
  echo "- 실행: \`npx quartz build --serve\` (watch 모드 — content 저장 시 자동 리빌드)"
fi
