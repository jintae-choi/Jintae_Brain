---
name: review-note
description: 학습 노트 1개에 note-reviewer 서브에이전트를 호출해 품질 리포트를 받는다.
argument-hint: <노트 경로>
---

# review-note

지정한 학습 노트에 note-reviewer 서브에이전트를 호출해 품질 리포트를 받는다.

## 입력
- 인자 `$ARGUMENTS`: 검사할 노트의 파일 경로 (예: `content/개발/git/5. git-hooks.md`)
- 인자 생략 시: 현재 수정 중인 .md 파일이 1개면 자동 선택, 여러 개면 사용자에게 어느 것인지 묻는다.

## 실행 절차

1. 경로 유효성 검사 (파일 존재 여부, `.md` 확장자, `content/` 하위인지).
2. **note-reviewer 서브에이전트에 위임**:
   - 대상 파일 경로 전달
   - 체크리스트(6단 흐름·frontmatter·간결체·wikilink·코드블록 해설) 기반 리포트 요청
3. 리포트를 받으면 **개선 우선순위 3개**를 강조해 사용자에게 요약 보고.
4. 사용자가 "고쳐줘"라고 하면 그때 `/polish-note` 또는 수동 편집 제안.

## 금지
- 리뷰만. 자동 수정 금지. 수정은 별도 커맨드로.
