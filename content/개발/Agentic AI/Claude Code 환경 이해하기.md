---
title: Claude Code 환경 이해하기
tags: [Claude Code, Agentic AI, 자동화, 설정]
date: 2026-04-14
---

# 개요

Claude Code는 터미널에서 동작하는 AI 코딩 어시스턴트다. 기본 상태로도 대화형 코딩이 되지만, **확장 포인트**를 알면 반복 작업을 자동화하고 프로젝트마다 AI 행동을 커스터마이즈할 수 있다. 이 노트는 그 확장 포인트 6가지(지침 파일·메모리·스킬·커맨드·서브에이전트·훅·MCP·설정)를 "**파일이 어떻게 생겼는지**"와 "**언제/어떻게 호출되는지**" 중심으로 정리한다.

실제 예시는 Jintae Brain 프로젝트(이 노트가 들어있는 프로젝트) 자산을 직접 인용한다.

# 전체 개념

## 확장 포인트 한눈에

```
Claude Code 대화
    │
    ├─ 지침 (시작 전 자동 로드)
    │   ├─ CLAUDE.md                    : 프로젝트 루트, 항상 로드
    │   └─ memory/                      : 로컬 자동 메모리, 항상 로드
    │
    ├─ 사용자 호출
    │   ├─ /skill-name  or /command-name: 슬래시 커맨드로 수동 호출
    │   └─ @subagent-name               : 서브에이전트 위임
    │
    ├─ Claude 자동 호출
    │   ├─ skills (description 매칭)    : Claude가 맥락 보고 알아서 사용
    │   └─ subagents (description 매칭) : 긴 탐색·격리 작업 위임
    │
    ├─ 이벤트 기반 자동 실행
    │   └─ hooks                        : 쉘스크립트가 특정 이벤트에서 발동
    │       ├─ SessionStart / SessionEnd
    │       ├─ PreToolUse / PostToolUse
    │       ├─ PreCompact
    │       ├─ UserPromptSubmit
    │       └─ Notification / Stop
    │
    └─ 외부 시스템 연결
        └─ MCP servers (.mcp.json)      : GitHub·Playwright·DB 등
```

## 로딩 우선순위 (매 세션)

| 계층 | 파일 | 로딩 | 저장소 | 계정·PC 이동 |
|---|---|---|---|---|
| 전역 지침 | `~/.claude/CLAUDE.md` | 매 세션 | 홈 디렉토리 | ❌ 사라짐 |
| 프로젝트 지침 | `<repo>/CLAUDE.md` | 매 세션 | git | ✅ 이동 |
| 자동 메모리 | `~/.claude/projects/<hash>/memory/MEMORY.md` + 참조된 파일 | 매 세션 | 로컬 | ❌ 사라짐 |
| 프로젝트 설정 | `<repo>/.claude/settings.json` | 매 세션 | git | ✅ 이동 |
| MCP 설정 | `<repo>/.mcp.json` | 사용자 승인 후 | git | ✅ (설치 필요) |
| 스킬·커맨드·훅 | `<repo>/.claude/{skills,commands,hooks}/` | 필요 시 | git | ✅ 이동 |
| 참조 문서 | `<repo>/docs/` | **필요 시만** | git | ✅ 이동 |

핵심 원칙: **git 추적되는 파일만 크로스-PC로 유지된다.** 로컬 메모리는 이 PC에서만 보인다. 집 PC에서 동일한 Claude 동작을 원하면 규칙을 CLAUDE.md·`.claude/`에 둬야 한다.

# 사전지식

- **CLAUDE.md와 memory 차이**: 둘 다 매 세션 로드되지만 **CLAUDE.md는 git 추적**(프로젝트 규칙), **memory는 로컬**(개인 관찰·과거 실수 기록). 성격이 다르다.
- **스킬 vs 커맨드**: 최근 Claude Code 업데이트로 둘은 통합돼 사실상 같은 레이어가 됐다. `.claude/skills/<name>/SKILL.md`와 `.claude/commands/<name>.md` 모두 `/name`으로 호출된다. **절차가 복잡하거나 파일이 여러 개(스크립트·템플릿) 필요하면 skills**, **단순 프롬프트 템플릿이면 commands**로 분리해 쓴다.
- **스킬 vs 서브에이전트**: 스킬은 "Claude에게 절차·지식을 알려주는 지침서"고, 서브에이전트는 "별도 컨텍스트에서 돌아가는 미니 Claude"다. 스킬은 메인 대화 컨텍스트를 쓰고, 서브에이전트는 자기 컨텍스트로 작업한 뒤 **결과만** 메인에 돌려준다. 긴 탐색·grep 결과가 메인 대화를 오염시키는 걸 막고 싶으면 서브에이전트.
- **훅 vs 스킬**: 훅은 **쉘스크립트**가 특정 이벤트에 발동 — Claude 판단 없이 OS 레벨에서 돌아간다. 토큰 제로, 결정론적. 스킬은 Claude가 판단해서 실행 — 유연하지만 토큰 소모. "반드시 매번 해야 하는 검증"은 훅, "상황 봐서 판단해야 하는 작업"은 스킬.
- **MCP (Model Context Protocol)**: 외부 시스템을 Claude의 도구로 노출하는 표준 프로토콜. GitHub·Playwright·Slack·DB 등 수많은 서버가 공개돼 있다. 프로젝트 루트에 `.mcp.json`을 두면 Claude Code가 첫 세션에서 승인 프롬프트를 띄운다.

# 전체 코드 — 각 확장 포인트의 파일 생김새

## 1. CLAUDE.md (프로젝트 지침)

위치: `<repo>/CLAUDE.md`
로딩: 모든 세션 시작 시 자동
용도: Claude가 따라야 할 **규칙·원칙·포인터**만. 배경 설명은 금지(토큰 낭비).

실제 예시 (이 프로젝트 일부 발췌):

```markdown
# Jintae Brain - AI 작업 지침

## 프로젝트
- Quartz v4 기반 개발 공부 노트 사이트

## 콘텐츠 규칙
- 템플릿: `content/templates/기본 문서 템플릿.md`
- frontmatter 필수: title, tags, date
- 문체: 간결체 (`~이다.`, 명사형 종결). 서술형 지양.

## 로컬 실행
- **반드시 Docker 사용**. `npx quartz build --serve` 직접 실행 금지.
- 접속 포트: `http://localhost:8080`
```

## 2. 로컬 메모리

위치: `%USERPROFILE%\.claude\projects\<project-hash>\memory\` (Windows)
로딩: 매 세션 자동
용도: 사용자 취향·과거 피드백·프로젝트별 개인 관찰. **git 추적 안 됨.**

파일 구조:

```
memory/
├── MEMORY.md                       # 인덱스 (매 세션 로드)
├── user_profile.md                 # 사용자 프로필
└── feedback_writing_structure.md   # 글쓰기 피드백
```

메모리 파일 예시 (`user_profile.md`):

```markdown
---
name: 사용자 프로필
description: 개발자, 간결체 선호, md 붙여넣기 워크플로우
type: user
---

- 개발자, Quartz v4 기반 공부 노트 사이트 운영
- 선호 문체: 서술형 X → 간결체
- 문서 정리 시 이해하기 좋은 순서 중시
```

`type`은 `user`·`feedback`·`project`·`reference` 중 하나. Claude가 메모리를 쓰고 읽을 때 분류 기준.

## 3. Skill / Command

위치: `.claude/skills/<name>/SKILL.md` 또는 `.claude/commands/<name>.md`
호출: `/<name>` 슬래시 커맨드, 또는 Claude가 description 보고 자동 판단
frontmatter:

```yaml
---
name: commit-note
description: 수정된 콘텐츠 파일을 분석해 커밋 메시지 초안 작성
argument-hint: (선택) 추가 메시지 힌트
allowed-tools: Bash(git *) Read Grep
---
```

주요 필드:
- `name`: 필수. 슬래시 이름.
- `description`: 필수. Claude가 자동 호출 판단에 사용.
- `argument-hint`: 자동완성 힌트.
- `allowed-tools`: 권한 프롬프트 없이 쓸 도구 화이트리스트. `Bash(pattern)`로 특정 명령만 허용.
- `model`: 특정 모델 강제 (선택).
- `disable-model-invocation: true`: 자동 호출 차단, 수동 `/name`만 허용.

본문은 마크다운 자유 형식. 절차 단계·금지사항·예시. `$ARGUMENTS`로 전체 인자, `$0`·`$1`로 위치 인자.

실제 예시 (이 프로젝트 `new-note` 스킬 일부):

```markdown
---
name: new-note
description: 새 학습 노트를 content/ 하위에 생성한다. 카테고리와 제목을 받아 템플릿 frontmatter를 치환하고 다음 번호로 파일명을 만든다.
---

## 실행 순서
1. 템플릿 로드
2. frontmatter 치환 (title, tags, date)
3. 파일 경로 결정 (카테고리 폴더의 기존 번호 +1)
4. Write 도구로 저장
5. index.md 갱신
```

사용:
```
/new-note 개발/git git rebase 정리
```

## 4. Subagent

위치: `.claude/agents/<name>.md`
호출: `@<name>` 명시 호출, 또는 Claude가 description 매칭해 자동 위임
frontmatter:

```yaml
---
name: note-reviewer
description: 학습 노트 1개를 검사해 품질 리포트를 생성한다.
tools: Read, Glob, Grep
model: sonnet
---
```

주요 필드:
- `name`: 서브에이전트 이름
- `description`: 언제 이 에이전트를 쓰는지 — 메인 Claude의 판단 기준
- `tools`: 이 에이전트가 쓸 수 있는 도구 화이트리스트 (공백이면 전체)
- `model`: opus/sonnet/haiku

본문은 이 에이전트의 **시스템 프롬프트**. 역할·규칙·출력 형식.

실제 예시 (이 프로젝트 `note-reviewer`):

```markdown
---
name: note-reviewer
description: 학습 노트 1개를 검사해 품질 리포트를 생성한다.
tools: Read, Glob, Grep
model: sonnet
---

# note-reviewer

Jintae Brain 학습 노트 품질 검사기. **읽기 전용**.

## 검사 체크리스트
1. frontmatter (title, tags, date)
2. 6단 흐름
3. 간결체 문체
4. wikilink 유효성
5. 코드블록 해설 누락

## 출력 형식
PASS/FAIL 리포트. 주관적 점수 금지.
```

**스킬과 차이**: 서브에이전트는 **독립 컨텍스트**에서 돈다. Grep·Read 결과가 메인 대화에 쌓이지 않고, 결과물(리포트)만 메인에 반환된다. 토큰 효율이 중요한 긴 탐색 작업에 쓴다.

## 5. Hook

위치: `.claude/hooks/<name>.sh` (쉘스크립트) + `.claude/settings.json` 등록
호출: 특정 이벤트에 **Claude 판단 없이** 자동 실행. 토큰 제로.

이벤트 종류:

| 이벤트 | 발동 시점 | 용도 |
|---|---|---|
| `SessionStart` | 세션 시작 | 프로젝트 상태 주입 (git, docker, 현재 브랜치 등) |
| `SessionEnd` | 세션 종료 | 정리 작업 (컨테이너 복구, 임시 파일 삭제) |
| `PreToolUse` | Claude가 도구 호출하기 직전 | 안전 검증·차단·경고 |
| `PostToolUse` | Claude가 도구 호출한 직후 | 결과 검증 (.md 문체·린트 등) |
| `PreCompact` | 자동 컨텍스트 압축 직전 | 진행 상황 저장 |
| `UserPromptSubmit` | 사용자 프롬프트 전송 직후 | 프롬프트 변환·주입 |
| `Notification` | 알림 이벤트 | 외부 전달 (Slack 등) |
| `Stop` | 에이전트 루프 종료 | 후처리 |

settings.json 등록 형식:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/check-engine-mount.sh"
          }
        ]
      }
    ]
  }
}
```

`matcher`는 이벤트에 따라 의미가 다르다:
- `PreToolUse`·`PostToolUse`: 도구 이름 정규식 (`Write|Edit`·`Bash` 등)
- `SessionStart`: `startup|resume|compact` 중 하나 이상
- `SessionEnd`: `clear|logout|other` 중 하나 이상

훅 스크립트 입출력:
- **stdin**: `{session_id, cwd, hook_event_name, ...}` JSON
- **stdout**:
  - `SessionStart` 훅: 텍스트 출력 → Claude의 **초기 컨텍스트에 주입**
  - 다른 훅: 일반적으로 Claude가 못 봄 (로그용)
- **stderr**: Claude에게 전달 (경고·차단 사유로 사용)
- **exit code**:
  - 0: 진행 허용
  - 2: 차단 (PreToolUse에서 사용)
  - 그 외: 무해한 오류로 기록

실제 예시 (이 프로젝트 `check-engine-mount.sh` 일부):

```bash
#!/bin/bash
# PreToolUse 훅: quartz/ 편집 시 Docker dev 모드 검사
payload=$(cat)
file=$(echo "$payload" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed ...)

case "$file" in
  */quartz/*) ;;
  *) exit 0 ;;
esac

cid=$(docker ps --filter "label=com.docker.compose.service=quartz" --format '{{.ID}}' | head -1)
[ -z "$cid" ] && exit 0

mounts=$(docker inspect "$cid" --format '{{range .Mounts}}{{.Destination}}{{"\n"}}{{end}}')
if echo "$mounts" | grep -qE '^/usr/src/app/quartz$'; then
  exit 0  # dev 모드 ON
fi

cat >&2 <<'EOF'
[check-engine-mount] quartz/ 편집 중인데 dev 모드 아님. 아래 실행:
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
EOF
exit 0
```

## 6. MCP Server

위치: `.mcp.json` (프로젝트 루트) 또는 전역
로딩: Claude Code 첫 세션에서 사용자 승인 요청 → 승인 시 매 세션 자동 연결
용도: GitHub·Playwright·DB 등 외부 시스템을 Claude의 **도구**로 노출

실제 예시:

```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "github": {
      "type": "http",
      "url": "https://api.example.com/mcp"
    }
  }
}
```

필드:
- `type`: `stdio`·`http`·`sse`·`websocket`
- stdio: `command` + `args` — 로컬 프로세스 스폰
- http: `url`

MCP 서버가 붙으면 Claude가 쓸 수 있는 도구가 늘어난다. 예를 들어 Playwright MCP가 붙으면 `playwright__navigate`·`playwright__screenshot` 같은 도구가 자동 추가되고, Claude는 일반 도구처럼 호출할 수 있다.

## 7. 기타 — Output styles, StatusLine, Keybindings

- **`.claude/output-styles/`**: 응답 포맷 템플릿. "커밋 메시지는 Conventional Commits로" 같은 스타일 강제. 선택적.
- **`.claude/settings.json`의 `statusLine`**: 터미널 하단에 표시되는 상태 라인 커스텀. 브랜치·모드 등 표시.
- **`~/.claude/keybindings.json`**: 키 바인딩 재정의. 사용자 전역.

이 3개는 이 프로젝트에선 사용 안 함. 필요해지면 추가.

# 라인별 해설

## CLAUDE.md는 왜 간결해야 하나

매 세션 로드되므로 **토큰 비용이 있다**. 100줄 CLAUDE.md면 매 대화 시작 시 100줄 분량 토큰을 쓴다. 반복 대화가 잦을수록 누적이 크다. 규칙만 남기고 배경·교훈은 `content/` 학습 노트로 분리해서 필요할 때만 읽히게 한다. 이 프로젝트의 CLAUDE.md가 30줄 언더인 이유.

## memory 파일의 `type` 필드가 왜 중요한가

Claude는 메모리를 쓸 때 이 분류를 기준으로 언제 참조할지 판단한다. 예: `type: user`는 사용자 프로필 → 작업 스타일 결정 시 참조. `type: feedback`은 과거 실수·교정 → 비슷한 상황에서 재실수 방지. 분류가 없으면 Claude가 언제 읽을지 판단 못 해서 효율이 떨어진다.

## 스킬 `description`은 Claude가 자동 호출할지 말지의 판정 기준

사용자가 `/new-note`를 치지 않아도, Claude가 대화 맥락 읽고 "이건 새 노트 만드는 작업이구나" 판단해서 스킬을 **자동 호출**한다. 이 판단의 유일한 근거가 `description`이다. 그래서 description은 "언제 이 스킬을 쓰는지"를 명확하게 쓴다. 모호하면 자동 호출이 안 돼서 쓸모가 줄어든다.

`disable-model-invocation: true`를 넣으면 자동 호출이 차단되고 수동 `/name`만 동작한다. 파괴적 작업이나 명시적 사용자 의도가 필요한 경우에 쓴다.

## 서브에이전트 `tools` 필드는 왜 축소하는가

서브에이전트가 `Write` 권한을 가지면 실수로 파일을 덮어쓸 수 있다. "읽기 전용"이 보장되면 잘못된 결과가 나와도 무해하다. 예: `note-reviewer`는 `tools: Read, Glob, Grep`으로 제한돼 있어 아무리 황당한 판단을 해도 파일은 안 건드린다.

또 다른 이유는 **메인 에이전트의 판단과 분리**. 서브에이전트가 `Edit`까지 할 수 있으면 메인 대화에서 "이 에이전트가 뭘 수정할지 몰라" 불안해진다. 권한 경계를 명확히 하면 위임이 안전해진다.

## 훅 이벤트 matcher의 정규식

`PreToolUse`·`PostToolUse`에서 matcher는 **도구 이름**에 대한 정규식이다. `Write|Edit`은 `Write` 또는 `Edit`을 의미한다. `Bash`는 Bash 도구 전체에 매칭. `*`로 모든 도구에 매칭할 수도 있다. 매칭되는 훅만 실행되므로 한 번의 도구 호출에 여러 훅이 동시에 발동 가능.

`SessionStart`·`SessionEnd`의 matcher는 다르다. 이들은 **이벤트 하위 종류**에 대한 정규식:
- `SessionStart`: `startup`(첫 시작), `resume`(이어하기), `compact`(압축 후 재시작)
- `SessionEnd`: `clear`(명시적 클리어), `logout`(로그아웃), `other`(기타)

이 프로젝트 예: `"matcher": "startup|resume"` — 세션 새로 시작하거나 이어할 때만 상태 점검 훅 실행. `compact`는 자동 압축 후라 상태가 이미 있어서 스킵.

## 훅 stdout이 Claude 컨텍스트에 주입되는 조건

**`SessionStart` 훅만** stdout이 Claude 초기 컨텍스트에 자동 주입된다. 다른 훅(`PreToolUse` 등)의 stdout은 Claude가 못 본다 — 훅 내부 로그용이다. Claude에게 메시지를 전달하려면 **stderr**에 써야 한다. 이게 헷갈리기 쉬운데, 이유는 stderr가 "훅의 판단 결과(경고·차단)" 역할이기 때문이다.

## MCP 서버가 자동 승인되지 않는 이유

외부 시스템 연결은 보안 민감 작업이라 Claude Code는 `.mcp.json`을 자동 로드하지 않는다. 첫 세션에서 "이 MCP 서버를 활성화할까요?" 프롬프트가 뜨고, 사용자가 승인해야 연결된다. 이후 세션에선 자동 연결. `claude mcp list`로 현재 등록된 서버 확인, `claude mcp remove <name>`으로 제거.

# 이 프로젝트의 확장 포인트 실제 구성

```
Jintae_Brain/
├── CLAUDE.md                          # 프로젝트 지침 (30줄)
├── .mcp.json                          # playwright MCP 등록 (사용자 승인 필요)
├── .claude/
│   ├── settings.json                  # 권한 모드 + 훅 등록 (SessionStart/End, PreToolUse, PostToolUse)
│   ├── skills/
│   │   ├── new-note/SKILL.md          # 새 노트 골격 생성
│   │   ├── polish-note/SKILL.md       # 6단 흐름 재배치
│   │   └── add-terms/SKILL.md         # 용어 해설 보강
│   ├── commands/
│   │   ├── commit-note.md             # 커밋 메시지 초안
│   │   ├── engine-on.md               # Docker dev 모드 ON
│   │   ├── engine-off.md              # Docker dev 모드 OFF
│   │   └── review-note.md             # note-reviewer 호출 프리셋
│   ├── agents/
│   │   ├── note-reviewer.md           # 노트 품질 리포트 (읽기 전용)
│   │   └── note-linker.md             # wikilink 후보 제안 (읽기 전용)
│   └── hooks/
│       ├── session-start.sh           # git·docker 상태 주입
│       ├── session-end.sh             # dev 모드 자동 복구
│       ├── check-engine-mount.sh      # quartz/ 편집 시 dev 모드 경고
│       └── validate-md.sh             # .md frontmatter·문체 검증
└── docs/
    ├── AI 운영 가이드.md              # AI 자산 사용법 (사람용)
    └── 프로젝트 운영 가이드.md        # 프로젝트 운영 규칙 (사람용)
```

- 매 세션 자동 로드: CLAUDE.md, memory (로컬)
- 매 세션 발동: session-start.sh → git·docker 상태 보고
- 파일 편집 시 자동 발동: check-engine-mount.sh, validate-md.sh
- 명시 호출: 스킬 4개, 커맨드 4개, 서브에이전트 2개
- 세션 종료 시 자동: session-end.sh → dev 모드면 기본 모드로 복구

# 교훈

- **같은 확장 포인트라도 "매 세션 로드"와 "필요 시 로드"는 토큰 비용이 다르다.** CLAUDE.md는 전자라서 엄격히 관리해야 하고, 학습 노트·`docs/`는 후자라서 충분히 상세해도 무방하다.
- **스킬 description은 자동 호출의 유일한 근거**다. 짧고 명확하게, "언제 이걸 쓰는지"를 첫 문장에 넣는다.
- **서브에이전트는 권한을 좁게.** 읽기 전용 작업은 `tools: Read, Glob, Grep`으로 제한해서 "아무리 잘못돼도 무해"한 상태를 만든다.
- **훅은 토큰 제로의 결정론적 자동화**다. "Claude가 까먹을 수 있는 검증"은 훅으로 뺀다. 반면 "상황에 따라 판단해야 하는 작업"은 스킬로.
- **`SessionStart` 훅은 stdout이 컨텍스트에 주입되는 유일한 훅**이다. git·docker 같은 상태 정보를 Claude에게 알려주는 표준 방법.
- **MCP는 승인 기반**. `.mcp.json`을 커밋해도 Claude Code가 자동 연결하지 않고 첫 사용 시 승인 프롬프트가 뜬다. 보안상 당연한 동작.
- **메모리는 PC 로컬**. 집 PC·회사 PC 양쪽에서 같은 Claude 동작을 원하면 규칙은 git 추적 파일(`CLAUDE.md`·`.claude/`)에 두고, 로컬 메모리는 "이 PC만의 관찰"로 한정한다.
- **관련 노트**: [[1. Docker 개발 모드]] (이 프로젝트의 훅·자동 판단 구조 실사례), [[1. Quartz 디자인 테마 스위처]] (Claude 협업으로 만든 기능)
