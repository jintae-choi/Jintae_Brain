---
name: commit-note
description: 현재 수정된 파일을 분석해 이 repo 관례의 한국어 커밋 메시지 초안을 만들고, 사용자 승인 후 로컬 커밋한다. 푸시는 하지 않는다.
argument-hint: "[선택: 추가 메시지 힌트]"
allowed-tools: Bash(git *) Read Grep
disable-model-invocation: true
---

# commit-note

작업 중인 수정 파일을 분석해 커밋 메시지 초안을 만든다. `$ARGUMENTS`로 추가 힌트를 받는다.

- 커밋 규칙(승인 후 실행·`--no-verify` 금지·Co-Authored-By 금지·병렬 세션 시 경로 지정 스테이지)은 전역 `~/.claude/jintae_git작업.md`가 우선한다.
- 원격까지 한 번에 맞추려면 전역 `/sync` 스킬을 쓴다. 이 스킬은 **메시지 초안 + 로컬 커밋**까지만 한다.

## 실행 절차

1. **변경 파일 수집**:
   ```bash
   git status --short
   git diff --stat
   ```
2. **분석 범위 제한**: `content/`, `quartz.config.ts`, `quartz.layout.ts`, `quartz/components/*`, `quartz/styles/*`, `.claude/`, `docs/`, `README.md`, `AGENTS.md`, `CLAUDE.md` 만. 그 외는 경고.
3. **변경 분류 → 접두어** (이 repo 관례. 2026-09 최근 커밋 20건 중 12건이 `정리:`):
   - 새 노트(`content/` 아래 새 .md) → `공부노트 추가: <제목> — <폴더 신설·index 등록 등 부가 작업>`
   - 기존 노트 정리·정정 → `정리: <무엇을 어떻게>`
   - AI 자산·지침·문서(`.claude/`, `AGENTS.md`, `CLAUDE.md`, `docs/`) → `설정: <무엇>`
   - 엔진·스타일(`quartz/`, `quartz.config.ts`, `quartz.layout.ts`) → `feat(영역): …` / `style(영역): …` / `fix(영역): …` (영역 예: explorer, 레이아웃, 캐시)
   - 여러 종류 혼합 → 가장 큰 변경 기준, 본문에 나머지 열거
4. **메시지 초안 작성** (간결체):
   - 제목: 70자 이내, 무엇·왜만
   - 본문 2~4줄: 변경점 요약
   - Co-Authored-By 라인 없음
5. **사용자 승인 대기**. "이대로 커밋" 받으면 실행. 수정 요청 있으면 반영 후 재제시.
6. 커밋 후 `git status` 확인.

## 금지
- 푸시는 하지 않는다. 사용자가 명시적으로 요청하거나 `/sync`를 부를 때만.
- `git add -A` 금지. 파일을 경로로 지정해 스테이지하고, `add`와 `commit`을 한 Bash 호출에 묶는다.
- `.env`, 자격증명 파일은 스테이징 대상에서 제외.
