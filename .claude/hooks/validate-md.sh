#!/bin/bash
# PostToolUse hook: content/ 하위 .md 파일의 frontmatter와 문체 검사.
# 경고만 stderr로 출력. exit 0 — 블로킹 안 함.
#
# stdin: { "tool_name": "...", "tool_input": { "file_path": "...", ... } }

set -e

# jq 없는 환경 고려 — grep/sed로 file_path만 추출
payload=$(cat)
file=$(echo "$payload" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# 대상 아님 — 조용히 종료
[ -z "$file" ] && exit 0
case "$file" in
  *.md) ;;
  *) exit 0 ;;
esac
case "$file" in
  *content/*|*content\\*) ;;
  *) exit 0 ;;
esac
case "$file" in
  *templates/*) exit 0 ;;
esac

# 상대경로 → 절대경로 변환 시도
if [ ! -f "$file" ] && [ -f "./$file" ]; then
  file="./$file"
fi
[ ! -f "$file" ] && exit 0

warnings=""

# 1. frontmatter 검사
head10=$(head -n 20 "$file")
if ! echo "$head10" | grep -q '^---[[:space:]]*$'; then
  warnings="${warnings}  - frontmatter 블록(---) 없음\n"
else
  echo "$head10" | grep -q '^title:' || warnings="${warnings}  - frontmatter: title 누락\n"
  echo "$head10" | grep -q '^tags:'  || warnings="${warnings}  - frontmatter: tags 누락\n"
  echo "$head10" | grep -q '^date:'  || warnings="${warnings}  - frontmatter: date 누락\n"
fi

# 2. 문체 검사 (간결체 권장)
seosul=$(grep -cE '(습니다|합니다|입니다)\.' "$file" 2>/dev/null | head -1)
seosul=${seosul:-0}
if [ "$seosul" -gt 2 ] 2>/dev/null; then
  warnings="${warnings}  - 서술형 종결 ${seosul}회 감지 — 간결체(~이다) 권장\n"
fi

# 3. 6단 흐름 주요 섹션 검사 (경고만)
has_overview=$(grep -c '^## 개요' "$file" 2>/dev/null | head -1)
has_overview=${has_overview:-0}
[ "$has_overview" = "0" ] && warnings="${warnings}  - '## 개요' 섹션 없음\n"

if [ -n "$warnings" ]; then
  printf "[validate-md] %s\n" "$file" >&2
  printf "$warnings" >&2
fi

exit 0
