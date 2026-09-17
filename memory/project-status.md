---
name: project-status
description: Jintae_Brain 현황 SSOT — 2026-09-17 AI 환경 정비·memory/ repo 이관·WBS 노트 추가 완료(전부 푸시), 교차검증은 회고 10회차 패킷
type: project
---

Jintae_Brain(공개 공부 노트 사이트)의 현재 상태·다음 할 일. 메모리는 repo `memory/`(공개) — 프로젝트 상태·결정만 적고 개인·계정·회사 정보는 넣지 않는다(`AGENTS.md` 세션 규약).

## 현재 상태 (2026-09-17, 전부 origin/main 반영)
- AI 환경 정비(`c940b97`·`4421fd5`): `.claude/commands/` 6개 → `.claude/skills/`(engine-on/off 는 삭제), Docker 전제 훅 2개 삭제, `validate-md.sh` 경고를 exit 2 로 모델에 보이게 + index.md 는 H1·개요 예외, `settings.json` 권한 기본값 제거, Playwright MCP·`.cursor/`·Copilot 파일 삭제, `content/개발/Agentic AI/` 삭제, `docs/` → `docs/가이드/00_`·`01_`, README·AGENTS.md·CLAUDE.md·에이전트 5개 현행화, `.dockerignore` 신설.
- memory/ repo 이관(`ec42e01`): 로컬 메모리 11개 중 프로젝트 파일 5개만 검열해 이관. 프라이버시 메모리는 전역 `~/.claude/memory/shared-account-privacy.md`, 취향 메모리 3개·프로필은 전역 지침·CLAUDE.md 에 이미 있어 이관하지 않음(로컬 `_legacy_2026-09-17/` 보관). 세션 시작 훅 `inject-project-memory.sh` 가 목차를 주입한다(CLAUDE.md 임포트는 이중 로드라 안 함).
- WBS 노트 추가(`37a7370`): `content/개발/DB/WBS 계층 데이터의 정규화와 뷰 역정규화.md` — 삭제한 Agentic AI 폴더의 학습 기록을 회사 정보 제거 후 표준 흐름으로 재작성. 경력 사실 기록은 personal-profile 세션 몫.
- 전역 지침 반영: 환경셋업에 「Bash 도구 히어독이 `\\` 를 `\` 로 접는다」 항목(`b4c0264`, 푸시됨).

## 교차검증
- 정비분·이관분(de2ce36..ec42e01)과 환경셋업 항목은 회고 10회차 패킷 B 절에 등록(`~/.claude/.cross-review/10회차_검토패킷.md`, 추적본 `~/.claude/docs/회고/2026-09-17_회고10회차_검토패킷.md`, diff `10회차_diff_jintaebrain_4421fd5.patch` 983줄). 코덱스 주간 한도 리셋(2026-09-19 21:25) 뒤 회고 세션이 5-② 로 돌린다 — 이 프로젝트에서 따로 부르지 않는다.

## 다음 할 일
- 없음(이 세션 범위 종결). 미결 소항목: 노트 `content/개발/프로젝트/Quartz Docker 2-모드 운영 구조.md` 가 삭제된 `check-engine-mount.sh` 를 설명 — 작업 기록 성격이라 두었고, "2026-09-17 이후 보존용" 한 줄을 넣을지는 사용자 결정.

## 왜 이렇게
- 커맨드→스킬: 공식 문서 "Custom commands have been merged into skills… Prefer a skill for new work"(2026-09).
- 훅 exit 2: 공식 문서 "exit 0 의 stderr 는 Claude 가 못 본다" + 실제 Write 로 실측(경고 도달 확인).
- memory/ 공개 커밋: 2026-09-17 사용자 결정 — 어느 컴퓨터든 clone 으로 상태를 잇는 것을 우선하고, 개인·회사 정보는 파일 단위로 분리해 둔다.
