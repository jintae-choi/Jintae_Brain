---
name: project-status
description: Jintae_Brain 현황 SSOT — 2026-11-16 git 브랜치 접두어·Pull Request 노트 2건이 다음 할 일에 추가됨(아직 미작성)
type: project
---

Jintae_Brain(공개 공부 노트 사이트)의 현재 상태·다음 할 일. 메모리는 repo `memory/`(공개) — 프로젝트 상태·결정만 적고 개인·계정·회사 정보는 넣지 않는다(`AGENTS.md` 세션 규약).

## 현재 상태 (2026-11-03, 전부 origin/main 반영)
- pm2 노트 갱신(2026-11-03): `content/개발/서버/Node.js/1. pm2 프로세스 관리.md` 에 5장 「Node 버전 — 프로세스마다 따로 정해진다」·2-4 확인 명령 표·경험 사례 2건 추가. 기존 「무중단은 cluster + instances 2 이상」을 pm2 7.1.1 소스(`lib/God/Reload.js`)·공식 문서로 확인해 「cluster 면 instances 1 도 무중단」으로 정정.
- AI 환경 정비(`c940b97`·`4421fd5`): `.claude/commands/` 6개 → `.claude/skills/`(engine-on/off 는 삭제), Docker 전제 훅 2개 삭제, `validate-md.sh` 경고를 exit 2 로 모델에 보이게 + index.md 는 H1·개요 예외, `settings.json` 권한 기본값 제거, Playwright MCP·`.cursor/`·Copilot 파일 삭제, `content/개발/Agentic AI/` 삭제, `docs/` → `docs/가이드/00_`·`01_`, README·AGENTS.md·CLAUDE.md·에이전트 5개 현행화, `.dockerignore` 신설.
- memory/ repo 이관(`ec42e01`): 로컬 메모리 11개 중 프로젝트 파일 5개만 검열해 이관. 프라이버시 메모리는 전역 `~/.claude/memory/shared-account-privacy.md`, 취향 메모리 3개·프로필은 전역 지침·CLAUDE.md 에 이미 있어 이관하지 않음(로컬 `_legacy_2026-09-17/` 보관). 세션 시작 훅 `inject-project-memory.sh` 가 목차를 주입한다(CLAUDE.md 임포트는 이중 로드라 안 함).
- WBS 노트 추가(`37a7370`): `content/개발/DB/WBS 계층 데이터의 정규화와 뷰 역정규화.md` — 삭제한 Agentic AI 폴더의 학습 기록을 회사 정보 제거 후 표준 흐름으로 재작성. 경력 사실 기록은 personal-profile 세션 몫.
- 전역 지침 반영: 환경셋업에 「Bash 도구 히어독이 `\\` 를 `\` 로 접는다」 항목(`b4c0264`, 푸시됨).

## 교차검증
- 정비분·이관분(de2ce36..ec42e01)과 환경셋업 항목은 회고 10회차 패킷 B 절에 등록(`~/.claude/.cross-review/10회차_검토패킷.md`, 추적본 `~/.claude/docs/회고/2026-09-17_회고10회차_검토패킷.md`, diff `10회차_diff_jintaebrain_4421fd5.patch` 983줄). 코덱스 주간 한도 리셋(2026-09-19 21:25) 뒤 회고 세션이 5-② 로 돌린다 — 이 프로젝트에서 따로 부르지 않는다.

## 다음 할 일
- **git 브랜치 이름 접두어 노트 쓰기**(2026-11-16 사용자 요청, 다른 프로젝트 세션에서 넘어옴) — `content/개발/git/` 에 `8.` 번으로. 담을 내용: `feat/`=feature(새 기능) 처럼 접두어가 작업 성격을 알려 준다 · 흔한 것 `feat/`·`fix/`·`hotfix/`·`chore/`·`docs/` · 슬래시는 폴더처럼 묶는 구분자일 뿐 기능은 없다 · 강제 규칙이 아니라 약속이고 커밋 메시지 머리표(`[fix]` 등)와 같은 취지 · 실제 예시는 회사 정보 없는 일반 이름으로. 같은 폴더 기존 노트 0~7 번과 중복 없음(2026-11-16 확인).
- **Pull Request 노트 쓰기**(같은 요청) — 먼저 **대화로 이해한 뒤** 노트로 남긴다. 사용자가 알고 싶은 것: 누가 신청하고 누가 받는가(작성자·리뷰어·머지 권한), 화면에서 무엇이 보이고 어떤 기능이 동작하는가(변경 목록·줄 단위 비교·댓글·리뷰 승인·자동 검사·머지 방식 3가지·머지 뒤 브랜치 삭제), 머지 시점에 배포 같은 자동화가 어떻게 걸리는가. `content/개발/git/` 에 `9.` 번. 2026-11-16 대화에서 이미 짚은 것: PR = 「내 브랜치를 다른 브랜치에 합쳐 달라」는 신청 화면이고, 열어 두는 것만으로는 아무 일도 일어나지 않으며 「Merge」를 눌러야 합쳐진다.
- ★위 두 노트를 쓸 때 주의: 2026-11-16 기준 이 repo 에 **작업 전부터 있던 미커밋 변경**이 있다 — `content/개발/서버/Docker/2. Docker 핵심 개념.md`·`3. Dockerfile.md`. 다른 작업의 것이니 건드리지 말고 커밋에서 뺀다(경로 지정 스테이지).
- pm2 노트 문장 다듬기 — 2026-11-03 사용자 「문장도 길고 정신없다, 나중에 보고 고쳐 달라고 하겠다」. 요청이 오면 진행. 같은 노트 7장 Best Practices 의 `pm2 startup` + `pm2 save` 굵게 표시 줄은 닫는 `**` 앞이 코드 표시·뒤가 조사라 굵게가 안 먹는다(원래 있던 문제, 이번에 안 고침).
- 그 외 미결 소항목: 노트 `content/개발/프로젝트/Quartz Docker 2-모드 운영 구조.md` 가 삭제된 `check-engine-mount.sh` 를 설명 — 작업 기록 성격이라 두었고, "2026-09-17 이후 보존용" 한 줄을 넣을지는 사용자 결정.

## 왜 이렇게
- 커맨드→스킬: 공식 문서 "Custom commands have been merged into skills… Prefer a skill for new work"(2026-09).
- 훅 exit 2: 공식 문서 "exit 0 의 stderr 는 Claude 가 못 본다" + 실제 Write 로 실측(경고 도달 확인).
- memory/ 공개 커밋: 2026-09-17 사용자 결정 — 어느 컴퓨터든 clone 으로 상태를 잇는 것을 우선하고, 개인·회사 정보는 파일 단위로 분리해 둔다.
