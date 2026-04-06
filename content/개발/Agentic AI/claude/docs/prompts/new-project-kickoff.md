# 새 프로젝트 킥오프 프롬프트

> 새 프로젝트를 시작할 때만 사용.
> 사용법: "docs/prompts/new-project-kickoff.md 읽고 [프로젝트 설명] 시작해줘"

## 사전 참고
- `docs/prompts/developer-profile.md` — 개발자 역량/선호
- `docs/prompts/work-style.md` — 작업 방식 규칙

## 프로젝트 시작 순서

### 1단계: 기술 스택 제안
- 위 개발자 프로필 참고하여 성장 가능한 기술 위주 제안
- 시장 트렌드 + 프로젝트 특성 기반 추천
- 사용자 확인 후 확정

### 2단계: 프로젝트 구조 설계
- 폴더 구조, Docker 구성, DB 스키마
- 사용자 확인 후 확정

### 3단계: 환경 구성 + CLAUDE.md 작성
- Docker, 패키지, DB 등 개발 환경 세팅
- 확정된 내용으로 프로젝트 루트 `CLAUDE.md` 작성
  - Project Overview, Tech Stack, Development Commands 채우기
  - Architecture는 코드만으로 파악 어려운 설계 의도만 기록
  - Key Conventions는 프로젝트 진행하면서 축적

### 4단계: 구현
- Agentic 워크플로우: 자율 실행, Phase별 체크포인트 보고
