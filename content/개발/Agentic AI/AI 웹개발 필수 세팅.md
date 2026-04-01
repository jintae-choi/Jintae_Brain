# AI 웹개발 필수 세팅

> VS Code + Copilot Pro 환경에서 AI를 최대한 활용하기 위한 세팅 정리.

---

## 1. 프로젝트에 만들어둘 .md 파일들

AI는 프로젝트의 `.md` 파일을 읽고 코드 생성 규칙을 파악한다.
잘 작성해두면 **매번 같은 말을 반복할 필요 없이** 일관된 코드를 받을 수 있다.

### 필수

#### `.github/copilot-instructions.md`
Copilot이 **모든 대화에서 자동으로 참조**하는 전역 규칙 파일.

```markdown
# Copilot Instructions

## 기술 스택
- Language: PHP 8, JavaScript (ES6+)
- DB: MySQL (mysqli, Prepared Statement 필수)
- Server: Apache + Docker

## 코딩 규칙
- 함수명은 동사로 시작 (get_, insert_, delete_)
- 30줄 이상 함수 금지
- 에러 메시지는 한글로
- SQL은 반드시 파라미터 바인딩
```

#### `ARCHITECTURE.md`
프로젝트의 **전체 구조와 데이터 흐름**을 설명.
Copilot이 "이 파일은 어디에 있고, 뭐랑 연결돼 있는지"를 파악하는 데 사용한다.

```markdown
# Architecture

## 시스템 구조
[Browser] → [Apache/PHP] → [MySQL]
                 ↓
           [외부 API 연동]

## 디렉토리
/public     - 진입점 (index.php)
/src        - 비즈니스 로직
/config     - DB 설정, 환경변수
/sql        - DDL, 마이그레이션
```

### 권장

#### `.copilot/rules/` (상황별 규칙)
특정 파일 패턴에만 적용되는 세분화된 규칙.
예를 들어 PHP 파일과 JS 파일에 다른 규칙을 적용할 수 있다.

```
.copilot/rules/
  php.md       → PHP 파일 작성 규칙
  javascript.md → JS 파일 작성 규칙
  database.md  → DB 쿼리 작성 규칙
```

예시 — `php.md`:
```markdown
# PHP 규칙 (*.php 파일에 적용)
- Prepared Statement 필수 ($stmt->bind_param)
- echo 출력 시 htmlspecialchars() 필수
- 함수 상단에 한글 주석으로 목적 기재
```

---

## 2. VS Code 워크플로우 팁

### Agent Mode

채팅 패널 상단에서 모드를 **Agent**로 설정하면,
파일 읽기/수정, 터미널 실행, 검색까지 **AI가 직접 수행**한다.
단순 질문이 아니라 "~해줘"로 작업을 시키는 게 핵심.

### 컨텍스트 참조

| 방법 | 사용법 | 언제 쓰나 |
|---|---|---|
| `#file` | `#file:config.php` 입력 | 특정 파일을 AI에게 보여줄 때 |
| `#selection` | 코드 드래그 후 채팅에서 참조 | 선택한 코드 부분만 질문할 때 |
| `@workspace` | `@workspace 이 프로젝트 구조 알려줘` | 프로젝트 전체를 검색/분석할 때 |

### 편집 단축키

| 단축키 | 기능 |
|---|---|
| `Ctrl+I` (에디터) | 코드 내에서 AI 인라인 편집 |
| `Ctrl+I` (터미널) | 터미널 명령어 AI 생성 |
| 에러 위 Quick Fix | Copilot이 자동 수정안 제시 |
| Git 커밋 창 반짝이 아이콘 | 커밋 메시지 자동 생성 |

### 모델 선택 기준

| 작업 | 추천 모델 |
|---|---|
| 복잡한 설계, 대규모 리팩토링 | Claude Opus (정확도 최고) |
| 일반 코딩, 버그 수정 | Claude Sonnet (속도+품질 균형) |
| 빠른 자동완성, 간단한 수정 | GPT-4o (빠름) |

---

## 3. 효과적인 프롬프트 작성법

AI에게 **구체적으로 시킬수록** 좋은 결과를 받는다.

```
나쁜 예:
"로그인 만들어줘"

좋은 예:
"PHP + MySQL로 로그인 API 만들어줘.
- POST /login.php
- mysqli Prepared Statement 사용
- password_verify()로 비밀번호 검증
- 성공 시 세션 생성, 실패 시 JSON 에러 반환"
```

핵심: **기술 스택 + 구체적 요구사항 + 에러 처리 방식**을 명시.
