# Claude Code 프로젝트 셋업 가이드

> 새 계정 + 새 프로젝트에서 처음 시작할 때 읽는 문서.
> 이 문서 자체는 Claude에게 주는 게 아니라, **내가 따라할 절차서**다.

---

## 왜 이 구조인가

Claude Code는 프로젝트 루트의 `CLAUDE.md`를 **매 대화마다 자동 로드**한다.
여기에 모든 걸 넣으면 토큰 낭비. 그래서:

| 파일 | 로드 시점 | 용도 |
|------|-----------|------|
| `CLAUDE.md` | **매번 자동** | 프로젝트 핵심 정보만 (최소화) |
| `docs/prompts/*.md` | **필요 시 수동** | 개인 프로필, 작업 방식, 킥오프 |

- `CLAUDE.md`에서 `docs/prompts/`를 참조만 → Claude가 필요할 때 알아서 읽음
- 전부 Git에 있으므로 계정이 바뀌어도 clone만 하면 동일 작동
- Claude Code 메모리(`~/.claude/`)는 계정 종속 → 보너스일 뿐, 의존하지 않음

---

## 셋업 절차 (3단계)

### 1단계: 파일 복사

기존 프로젝트에서 `docs/prompts/` 폴더를 새 프로젝트로 복사한다.

```bash
# 새 프로젝트 폴더에서
mkdir -p docs/prompts
cp {기존프로젝트}/docs/prompts/developer-profile.md docs/prompts/
cp {기존프로젝트}/docs/prompts/work-style.md docs/prompts/
cp {기존프로젝트}/docs/prompts/new-project-kickoff.md docs/prompts/
```

필요하면 `developer-profile.md`의 보유 기술 목록을 업데이트한다.

### 2단계: CLAUDE.md 복사

`docs/prompts/CLAUDE.template.md`를 프로젝트 루트에 `CLAUDE.md`로 복사한다.
직접 채우지 않는다 — Claude가 킥오프 과정에서 채운다.

```bash
cp docs/prompts/CLAUDE.template.md CLAUDE.md
```

### 3단계: 첫 대화

Claude Code를 열고 첫 대화에서 이렇게 말한다:

```
docs/prompts/new-project-kickoff.md 읽고 [프로젝트 설명] 시작해줘
```

Claude가 알아서:
1. `new-project-kickoff.md` → `developer-profile.md` → `work-style.md` 순서로 읽음
2. 기술 스택 제안 → 확인
3. 프로젝트 구조 설계 → 확인
4. 환경 구성 + `CLAUDE.md` 내용 채우기
5. 구현 시작

---

## 핵심 포인트

### 토큰 절약 원칙
```
매번 로드되는 것 (CLAUDE.md)  →  프로젝트 정보만. 개인 선호 X
가끔 로드되는 것 (docs/prompts/) →  개인 프로필, 작업 방식, 킥오프
절대 안 읽히는 것              →  쓸모없음. 쓰지 말 것
```

### CLAUDE.md에 넣을 것 vs 넣지 말 것

| 넣을 것 (매번 필요) | 넣지 말 것 |
|---------------------|-----------|
| 프로젝트 개요 | 개발자 경력/프로필 (코드와 무관) |
| 기술 스택 | 기술 선택 원칙 (킥오프 때만 필요) |
| 개발 명령어 | 디렉토리 구조 (코드에서 파악 가능) |
| 코드만으로 모르는 설계 의도 | 코드에서 읽히는 구조 설명 |
| 핵심 컨벤션 | UI/UX 피드백 이력 (작업 방식 파일) |

### 계정 이동 체크리스트
- [ ] `docs/prompts/` 폴더가 Git에 커밋되어 있는가?
- [ ] `CLAUDE.md`가 Git에 커밋되어 있는가?
- [ ] `developer-profile.md`의 보유 기술이 최신인가?
- [ ] → 위 3개만 확인하면 끝. 메모리 마이그레이션 불필요.

### 프로젝트 진행 중 업데이트
- 새로운 작업 방식 피드백 → `work-style.md`에 추가
- 새 기술 학습 완료 → `developer-profile.md`에서 이동
- 프로젝트 고유 컨벤션 → `CLAUDE.md`에 추가

---

## 파일 역할 요약

```
docs/prompts/
├── setup-guide.md           ← 이 파일. 사람이 읽는 절차서
├── CLAUDE.template.md       ← CLAUDE.md 뼈대. 새 프로젝트마다 복사
├── developer-profile.md     ← 개인 프로필. 프로젝트 간 공유
├── work-style.md            ← 작업 방식. 프로젝트 간 공유
└── new-project-kickoff.md   ← 킥오프 프롬프트. 첫 대화에서만 사용
```
