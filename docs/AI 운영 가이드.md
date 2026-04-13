# Jintae Brain — AI 운영 가이드

Claude Code agentic 기능(스킬·서브에이전트·훅)을 이 프로젝트에 맞춰 세팅한 내용을 정리한다. **노트 작성·품질·토큰 효율**이 목적이다.

---

## 1. 전체 개념 / 흐름

```
사용자 요청
    │
    ├─ 새 노트 작성      ──► Skill: /new-note     ──► 템플릿 골격 생성
    │
    ├─ 노트 재구성       ──► Skill: /polish-note  ──► 6단 흐름 재배치
    │
    ├─ 용어 보강         ──► Skill: /add-terms    ──► 누락 해설 bullet 추가
    │
    ├─ 노트 품질 검사    ──► Subagent: note-reviewer ─► 리포트
    │
    └─ 연결 문서 제안    ──► Subagent: note-linker   ─► 링크 후보

Write/Edit 후 매번
    └─ PostToolUse Hook: validate-md.sh  ──► frontmatter·문체 경고
```

### 핵심 설계 원칙

1. **노트 구조는 6단 흐름 고정**: 개요 → 전체 개념/흐름 → 사전지식 → 전체 코드 → 라인별 해설 → 경험/교훈.
   - 레퍼런스 구현: [content/개발/git/5. git-hooks.md](../content/개발/git/5.%20git-hooks.md)
   - 템플릿: [content/templates/기본 문서 템플릿.md](../content/templates/기본%20문서%20템플릿.md)
2. **자주 하는 작업은 Skill**, **컨텍스트 분리가 필요한 작업은 Subagent**, **매번 자동 체크는 Hook**.
3. **모든 자동화는 읽기 우선**. 파일 수정이 필요한 작업은 사용자 승인 후 실행.

---

## 2. 디렉토리 구조

```
.claude/
├── settings.json            # 권한 + 훅 설정
├── skills/                  # 사용자 호출형 스킬
│   ├── new-note/SKILL.md
│   ├── polish-note/SKILL.md
│   └── add-terms/SKILL.md
├── agents/                  # 서브에이전트 (읽기 전용)
│   ├── note-reviewer.md
│   └── note-linker.md
└── hooks/
    └── validate-md.sh       # PostToolUse 훅 스크립트
```

---

## 3. Skills — 사용자가 직접 호출

### 3-1. `/new-note` — 새 학습 노트 생성

**언제**: 새로운 주제 노트를 시작할 때.

**사용법**:
```
/new-note 개발/git git rebase 정리
```
또는 자연어로 "git rebase 새 노트 만들어줘".

**동작**:
1. 템플릿을 읽어 6단 흐름 골격 복사
2. frontmatter(`title`, `tags`, `date`) 자동 치환
3. 카테고리 폴더의 번호 체계 감지 → 다음 번호로 파일명 생성
4. 같은 폴더 `index.md`에 링크 추가
5. 내용은 **채우지 않음** — 사용자가 넣을 때까지 골격만 유지

**왜 유용한가**: 매번 템플릿 복붙·번호 계산·frontmatter 수작업 제거. 토큰 소모 0에 가까움.

---

### 3-2. `/polish-note` — 기존 노트 재구성

**언제**: 예전에 쓴 노트가 6단 흐름과 어긋나 있을 때.

**사용법**:
```
/polish-note content/개발/git/0. git 기본 명령어.md
```

**동작**:
1. 현재 섹션 구조·frontmatter·문체 진단 리포트 출력
2. 사용자 승인 후 내용을 **재배치**(삭제 금지)
3. 부족한 섹션은 `(작성 필요)` 플레이스홀더
4. 서술형 → 간결체 통일
5. 깨진 wikilink 경고

**왜 유용한가**: 구조 개선만 자동화하고, 지식 자체는 건드리지 않음. 안전한 리팩터링.

---

### 3-3. `/add-terms` — 전문용어 해설 보강

**언제**: 코드블록은 많은데 옵션·플래그 설명이 빠져 있을 때.

**사용법**:
```
/add-terms content/개발/git/5. git-hooks.md
```

**동작**:
1. 코드블록에서 명령어·플래그·환경변수 추출
2. 본문에서 이미 해설된 것 제외
3. **누락분만** 목록으로 제시
4. 사용자 confirm한 항목만 bullet/표로 추가

**왜 유용한가**: "모르는 용어"가 문서에 방치되는 걸 방지. 읽기 전용 제안 → 승인 후 반영.

---

## 4. Subagents — 메인 컨텍스트 보호

### 4-1. `note-reviewer`

**역할**: 노트 1개 읽고 품질 리포트 생성. **읽기 전용** (tools: Read, Glob, Grep).

**검사 항목**:
- frontmatter 필수 필드
- 6단 흐름 준수 여부
- 서술형/간결체 비율
- wikilink 유효성
- 코드블록 해설 누락 위치

**호출 예시**:
```
note-reviewer 에이전트로 content/개발/git/0. git 기본 명령어.md 검사해줘
```

**왜 서브에이전트로 분리했나**: Grep·Glob 결과가 메인 대화 컨텍스트에 쌓이지 않도록 격리. 리포트만 반환.

---

### 4-2. `note-linker`

**역할**: 노트 1개에서 키워드 추출 → content 전체 스캔 → 연결 가능한 `[[wikilink]]` 후보 제안. **읽기 전용**.

**출력**:
- 본문에 직접 삽입 권장 (L45, L78 등)
- "관련 문서" 섹션에 추가 권장
- 매칭 안 된 키워드 (새 노트 후보)

**왜 유용한가**: Quartz의 백링크 그래프를 수동 유지 안 해도 됨. 사용자는 승인만.

---

## 5. Hooks — 자동 검증

### `PostToolUse: Write|Edit` → `validate-md.sh`

**언제 실행**: Claude가 `.md` 파일을 Write/Edit할 때마다 자동.

**검사 대상**: `content/` 하위 `.md` 파일 (템플릿, `quartz/`, `public/` 제외).

**검사 항목**:
- frontmatter 블록(`---`) 유무
- `title`, `tags`, `date` 필드 존재
- 서술형 종결(`~습니다/합니다/입니다`) 3줄 이상 → 경고
- `## 개요` 섹션 존재

**동작 방식**:
- **비차단**: 경고만 stderr로 출력, exit 0
- Claude는 경고 메시지를 읽고 다음 액션에 반영
- 사람이 수동으로 수정해도 됨

**수동 테스트**:
```bash
echo '{"tool_name":"Write","tool_input":{"file_path":"content/개발/git/0. git 기본 명령어.md"}}' \
  | bash .claude/hooks/validate-md.sh
```

**왜 훅으로 했나**: Claude가 매번 "frontmatter 맞는지 확인해야지" 기억할 필요 없음. 토큰 한 톨도 안 쓰고 shell이 처리.

---

## 6. 토큰 절약 효과 요약

| 항목 | 기존 방식 | 적용 후 |
|---|---|---|
| 새 노트 생성 | 템플릿 읽기 + frontmatter 작성 + 번호 계산 + index 업데이트 (모두 LLM) | Skill이 절차화 → 모델은 제목만 받음 |
| 노트 품질 검사 | 메인 대화에서 Grep·Read 반복 | 서브에이전트로 격리, 리포트만 컨텍스트 유입 |
| frontmatter 검증 | 모델이 매번 "frontmatter 확인하자" | 훅이 shell로 처리 (0 토큰) |
| 용어 누락 탐지 | 전체 문서 재스캔 | Skill이 코드블록 단위로만 스캔 |

---

## 7. 설정 관리 원칙

- **중복 금지**: `CLAUDE.md`가 단일 소스. `AGENTS.md`는 포인터만.
- **`.claude/` 커밋**: 스킬·에이전트·훅은 git에 포함. 팀/미래의 본인이 동일 환경 사용.
- **템플릿 고정**: [기본 문서 템플릿.md](../content/templates/기본%20문서%20템플릿.md)가 6단 흐름의 단일 원본. 변경 시 이 문서도 갱신.
- **레퍼런스 노트**: [5. git-hooks.md](../content/개발/git/5.%20git-hooks.md)를 "이상적 구조"의 살아있는 예시로 유지.

---

## 8. 확장 여지

현재는 노트 관리에만 집중했다. 아래는 필요해지면 추가할 수 있는 후보:

- **Skill `/til`** — TIL 전용 간소 템플릿 (frontmatter만, 단일 섹션)
- **Skill `/index-sync`** — 모든 카테고리의 `index.md`를 폴더 내 파일 기준으로 자동 재생성
- **Hook `SessionStart`** — `git status` 기반 수정 중 `.md` 목록을 세션 시작 시 주입
- **Subagent `tag-auditor`** — 전체 태그 체계 일관성 검사 (오탈자·중복·고아 태그)

필요 시 이 문서에 추가하고 `.claude/` 하위에 구현.
