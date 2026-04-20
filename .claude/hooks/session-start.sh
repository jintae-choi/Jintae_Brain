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

# Docker 컨테이너 상태 — quartz 서비스만
echo "## Docker (quartz)"
if ! command -v docker >/dev/null 2>&1; then
  echo "- docker CLI 없음 — 점검 스킵"
else
  cid=$(docker ps --filter "label=com.docker.compose.service=quartz" --format '{{.ID}}' 2>/dev/null | head -1)
  if [ -z "$cid" ]; then
    echo "- 컨테이너 **안 떠있음**"
    echo "- 실행: \`docker-compose up -d\` (콘텐츠 작업) 또는 \`docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build\` (엔진 작업)"
  else
    port=$(docker ps --filter "id=$cid" --format '{{.Ports}}' | grep -o '[0-9]*->8080' | head -1 | sed 's/->8080//')
    mounts=$(docker inspect "$cid" --format '{{range .Mounts}}{{.Destination}}
{{end}}' 2>/dev/null || echo "")
    if echo "$mounts" | grep -qE '^/usr/src/app/quartz$'; then
      mode="**dev 모드** (엔진 볼륨 마운트 ON)"
    else
      mode="기본 모드"
    fi
    echo "- 상태: 실행 중, $mode"
    echo "- 접속: http://localhost:$port"
  fi
fi
