#!/bin/bash
# SessionEnd hook: 세션 종료 시 dev 모드면 기본 모드로 자동 복귀.
# 블로킹 안 함 (session은 즉시 종료, docker는 백그라운드에서 정리).

set +e

command -v docker >/dev/null 2>&1 || exit 0

cid=$(docker ps --filter "label=com.docker.compose.service=quartz" --format '{{.ID}}' 2>/dev/null | head -1)
[ -z "$cid" ] && exit 0  # 안 떠있으면 아무것도 안 함

mounts=$(docker inspect "$cid" --format '{{range .Mounts}}{{.Destination}}
{{end}}' 2>/dev/null || echo "")

# dev 모드 아니면 그대로 둠
if ! echo "$mounts" | grep -qE '^/usr/src/app/quartz$'; then
  exit 0
fi

# dev 모드 → 기본 모드로 복귀
# stderr는 Claude가 못 볼 가능성 높음, 로그로 남김
log="/tmp/claude-session-end-$(date +%s).log"
{
  echo "[session-end] dev 모드 감지, 기본 모드로 복귀 중..."
  docker-compose down
  docker-compose up -d
  echo "[session-end] 완료"
} > "$log" 2>&1 &

exit 0
