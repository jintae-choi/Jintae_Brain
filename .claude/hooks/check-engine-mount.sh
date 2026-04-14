#!/bin/bash
# PreToolUse hook: quartz/ 내부 파일을 편집할 때 dev 모드(엔진 볼륨 마운트) 상태 검사.
# 꺼져있으면 stderr로 경고만 출력. exit 0 — 블로킹 안 함.
#
# stdin: { "tool_name": "...", "tool_input": { "file_path": "...", ... } }

set -e

payload=$(cat)
file=$(echo "$payload" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# 대상 아님 — 조용히 종료
[ -z "$file" ] && exit 0

# quartz/ 내부 경로만 검사 (quartz.config.ts, quartz.layout.ts는 루트 파일이므로 제외)
case "$file" in
  */quartz/*|*\\quartz\\*) ;;
  *) exit 0 ;;
esac

# docker 없으면 검사 스킵
command -v docker >/dev/null 2>&1 || exit 0

# 컨테이너 조회 — 이 프로젝트(quartz 서비스)의 첫 컨테이너
cid=$(docker ps --filter "label=com.docker.compose.service=quartz" --format '{{.ID}}' | head -1)
[ -z "$cid" ] && exit 0  # 안 떠있으면 아무것도 안 함

# /usr/src/app/quartz 디렉토리 마운트가 있는지 확인 (quartz.config.ts 같은 파일 마운트와 구분)
mounts=$(docker inspect "$cid" --format '{{range .Mounts}}{{.Destination}}|{{.Type}}
{{end}}' 2>/dev/null || echo "")

if echo "$mounts" | grep -qE '^/usr/src/app/quartz\|'; then
  exit 0  # dev 모드 ON
fi

cat >&2 <<'EOF'
[check-engine-mount] quartz/ 내부 파일을 수정하려고 하는데 Docker 컨테이너가 dev 모드가 아님.
  현재 실행 중인 컨테이너는 엔진 볼륨을 마운트하지 않아 편집이 반영되지 않음.

  해결:
    docker-compose down
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

  자세한 설명: docs/Docker 개발 모드.md
EOF
exit 0
