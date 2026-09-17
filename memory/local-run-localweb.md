---
name: local-run-localweb
description: "이 프로젝트 로컬 실행은 Docker 아닌 로컬웹(npx quartz build --serve, localhost:8080) — Docker 훅·engine-on/off 는 2026-09-17 삭제"
type: project
---

Jintae_Brain 로컬 미리보기는 **로컬웹**으로 띄운다 — `npx quartz build --serve`(watch 모드: `content/`·설정·`quartz/` 안 `.ts`/`.tsx`/`.scss` 저장 시 자동 리빌드), 접속 `http://localhost:8080`. **Docker로 띄우지 않는다.**

**Why:** 사용자가 반복 강조(2026-07-24): "이 프로젝트는 도커 안 띄운다, 로컬웹으로." 전역 `machine-local.md`에도 같은 결정이 있다(2026-07-21) — 도커로 띄우는 프로젝트 목록에 Jintae_Brain은 없다.

**How to apply:**
- 노트 미리보기·렌더 확인이 필요하면 8080 로컬웹을 쓴다. `docker-compose up` 하지 말 것.
- 엔진(`quartz/`) 수정도 로컬웹이 자동 반영한다(`quartz/cli/handlers.js` watch 목록) — dev 모드 전환 같은 것은 없다.
- 2026-09-17 정정 1차(커밋 `e51510b`): AGENTS.md「로컬 실행」·SessionStart 훅을 로컬웹 기준으로 수정.
- 2026-09-17 정정 2차(같은 날 후속 세션): `engine-on`/`engine-off` 커맨드와 Docker 훅 2개(`check-engine-mount.sh`·`session-end.sh`)는 **삭제**. `docker-compose*.yml`·`Dockerfile`·`.dockerignore` 만 보존용으로 남김.
- 연관: [[project-status]].
