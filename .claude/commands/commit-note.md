---
name: commit-note
description: 현재 수정된 콘텐츠 파일을 분석해 한국어 커밋 메시지 초안을 작성하고, 사용자 승인 후 커밋한다.
argument-hint: (선택) 추가 메시지 힌트
allowed-tools: Bash(git *) Read Grep
---

# commit-note

작업 중인 수정 파일을 분석해서 커밋 메시지 초안을 만든다. $ARGUMENTS로 추가 힌트를 받을 수 있다.

## 실행 절차

1. **변경 파일 수집**:
   ```bash
   git status --short
   git diff --stat
   ```
2. **분석 범위 제한**: `content/`, `quartz.config.ts`, `quartz.layout.ts`, `quartz/components/*`, `quartz/styles/*`, `.claude/`, `docs/`, `README.md`, `CLAUDE.md` 만. 그 외는 경고.
3. **변경 분류**:
   - 신규 콘텐츠(`content/` 아래 새 .md) → `docs: <제목> 노트 추가`
   - 기존 콘텐츠 수정 → `docs: <제목> 갱신`
   - 자동화 자산 추가/변경(`.claude/**`) → `chore: <자산명> 추가/갱신`
   - 엔진·스타일 변경(`quartz/**`) → `feat: <기능>` 또는 `fix: <버그>`
   - 인프라(compose, Dockerfile) → `chore: <내용>`
   - 여러 종류 혼합 → 가장 큰 변경 기준, 본문에 나머지 열거
4. **메시지 초안 작성** (간결체, 사람이 읽어도 자연스럽게):
   - 제목: 70자 이내, 왜/무엇만
   - 본문 2~4줄: 변경점 요약
   - Co-Authored-By 라인 포함
5. **사용자 승인 대기**. "이대로 커밋" 받으면 실행. 수정 요청 있으면 반영 후 재제시.
6. 커밋 후 `git status` 확인.

## 금지
- 푸시는 하지 않는다. 사용자가 명시적으로 요청할 때만.
- `.env`, 자격증명 파일은 스테이징 대상에서 제외.
- `git add -A` 대신 개별 파일 명시.
