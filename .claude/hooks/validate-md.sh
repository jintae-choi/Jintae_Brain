#!/bin/bash
# PostToolUse hook: content/ 하위 .md 파일의 frontmatter·문체·구조 검사.
#
# 출력 규칙(공식 문서 hooks.md): exit 0 이면 stderr 는 디버그 로그로만 가고 Claude 는 못 본다.
# PostToolUse 에서 경고를 Claude 에게 보이려면 exit 2 로 끝내야 한다 — 도구는 이미 실행됐으므로
# 차단이 아니라 "경고를 읽고 다음 행동에 반영"이 된다. (2026-09-17 실측: exit 0 이던 시절엔
# 경고가 한 번도 모델에 도달하지 않았다.)
#
# 검사 대상: content/**/*.md (templates/ 제외).
# index.md 는 폴더 랜딩 페이지라 본문 H1·'## 개요' 검사에서 제외한다(AGENTS.md 콘텐츠 규칙 예외).
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
  *templates/*|*templates\\*) exit 0 ;;
esac

is_index=0
case "$file" in
  *index.md) is_index=1 ;;
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

if [ "$is_index" = "0" ]; then
  # 3. 표준 흐름 첫 섹션 검사
  has_overview=$(grep -c '^## 개요' "$file" 2>/dev/null | head -1)
  has_overview=${has_overview:-0}
  [ "$has_overview" = "0" ] && warnings="${warnings}  - '## 개요' 섹션 없음\n"

  # 4. 본문 H1 검사 — 제목은 frontmatter title이 담당, 본문 헤딩은 ## 부터 시작한다.
  #    코드블록(```) 안의 '# 주석'은 제외.
  h1=$(awk '/^```/{f=!f} !f && /^# /{c++} END{print c+0}' "$file")
  [ "$h1" -gt 0 ] && warnings="${warnings}  - 본문 H1(# ) ${h1}개 — 제목은 frontmatter title이 담당, 본문 섹션은 ## 부터\n"
fi

if [ -n "$warnings" ]; then
  printf "[validate-md] %s — 아래 항목을 확인해 고칠 것(index.md 는 H1·개요 예외)\n" "$file" >&2
  printf "$warnings" >&2
  exit 2
fi

exit 0
