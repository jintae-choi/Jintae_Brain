---
title: Docker 개발 모드
tags: [docker, 개발환경, 운영]
date: 2026-04-14
---

# 개요

이 프로젝트는 **Docker를 유일한 로컬 실행 방식**으로 둔다. Node 직접 실행(`npx quartz build --serve`)은 금지한다. 이유는 휴대성 — 어떤 머신이든 Dockerfile + docker-compose.yml만 있으면 동일한 환경이 재현된다.

작업 종류에 따라 **두 가지 모드**가 필요하다. 이 문서는 왜 나눠야 했는지, 어떻게 전환하는지, AI가 이 전환을 어떻게 자동 판단하는지를 설명한다.

# 두 가지 모드의 존재 이유

## 기본 모드 (prod-like)

[docker-compose.yml](../docker-compose.yml)만 사용한다.

볼륨 마운트 대상:
- `./content` → 콘텐츠
- `./quartz.config.ts` → 사이트 설정
- `./quartz.layout.ts` → 레이아웃 설정

**`quartz/` 폴더는 마운트 안 됨**. 컨테이너 빌드 시점의 엔진 코드가 그대로 고정된다.

의도: 엔진 코드는 안정적이라고 가정하고 콘텐츠 편집만 빠르게 반영한다. 배포 환경과 최대한 가깝다.

## dev 모드 (엔진 수정용)

[docker-compose.yml](../docker-compose.yml) + [docker-compose.dev.yml](../docker-compose.dev.yml) 오버라이드.

dev 오버라이드가 추가로 `./quartz` 전체 디렉토리를 컨테이너의 `/usr/src/app/quartz`로 마운트한다. 이제 엔진 소스 수정도 즉시 반영된다.

**언제 필요한가**:
- 디자인 테마 변경 (`quartz/styles/custom.scss`)
- 새 컴포넌트 추가 (`quartz/components/*`)
- 레이아웃 동작 수정
- Quartz 내부 플러그인 수정

# 왜 애초에 나눴나

한 파일로 `./quartz`를 항상 마운트하면 안 되나? 된다. 하지만 3가지 이유로 분리했다:

1. **배포 환경 재현성**: 기본 모드는 GitHub Pages 배포 빌드와 동일한 상태를 재현해야 한다. 엔진 볼륨이 마운트되면 실제 배포와 약간 달라진다.
2. **실수 방지**: 엔진 파일을 무심코 고쳤을 때 그게 즉시 로컬 서버에 반영되면 알아차리기 어렵다. 기본 모드에선 "엔진을 수정해도 반영 안 됨"이라는 명확한 신호가 있다.
3. **성능**: 윈도우에서 Docker Desktop의 볼륨 마운트는 느릴 수 있다. 불필요한 마운트는 뺀다.

# 포트 통일

기본/dev 모두 호스트 포트 `8080`으로 통일했다. 이전엔 기본 `18080`, Node 직접 실행 `8080`이었는데 두 숫자를 기억하는 게 혼동의 원인이었다. 이제 **항상 http://localhost:8080**.

다른 서비스가 호스트 8080을 쓰고 있으면 `docker-compose.override.yml`을 만들어 `ports: ["<원하는포트>:8080"]`으로 로컬에서만 덮어쓸 수 있다 (git 추적 제외).

# 사용법

## 기본 모드 시작
```bash
docker-compose up -d --build
```
접속: http://localhost:8080

## dev 모드 시작
```bash
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```
접속: http://localhost:8080

## 기본 모드로 복귀
```bash
docker-compose down
docker-compose up -d
```

## 종료
```bash
docker-compose down
```

## 로그 확인
```bash
docker-compose logs -f quartz
```

# AI 자동화 — 모드 전환을 사용자가 직접 요청하지 않음

Claude Code는 대화 맥락을 읽어 적절한 모드를 스스로 고른다. 사용자가 매번 "dev 모드로 바꿔줘"라고 말할 필요가 없다.

## 판단 규칙 ([CLAUDE.md](../CLAUDE.md) `## 로컬 실행` 섹션)

**dev 모드로 전환하는 신호** (요청 맥락에 포함):
- "디자인", "테마", "색상", "레이아웃", "폰트"
- "컴포넌트 추가/수정"
- "`quartz/` 안의 파일 수정"
- "스타일 변경"

**기본 모드로 복귀하는 신호**:
- "디자인 확정", "이제 콘텐츠 작업"
- "커밋할게", "배포해" (작업 종료 신호)
- 대화 주제가 엔진 → 콘텐츠로 명확히 바뀔 때

## 안전망 — PreToolUse 훅

Claude가 맥락을 놓쳐서 dev 모드 아닌데 `quartz/**` 파일을 수정하려 하면, [.claude/hooks/check-engine-mount.sh](../.claude/hooks/check-engine-mount.sh) 훅이 stderr로 경고를 띄운다.

훅 동작:
1. `PreToolUse`에서 `Write`·`Edit` 도구 호출 직전 실행
2. `file_path`가 `quartz/` 내부인지 검사
3. 내부면 `docker ps`에서 quartz 서비스 컨테이너 찾고, `docker inspect`로 볼륨 목록 조회
4. `/usr/src/app/quartz` 디렉토리 마운트가 없으면 경고 출력, 있으면 조용히 종료
5. 블로킹하지 않음 (`exit 0`). 경고만 Claude에게 전달

Claude는 경고를 읽고 dev 모드로 전환한 뒤 재시도한다. 사용자 개입 불필요.

## 훅이 있는데 왜 Claude 판단 규칙도 필요한가

훅은 **편집 순간**에만 발동한다. 편집하기 *전에* 대화 맥락만 봐도 "이건 엔진 작업이구나" 판단 가능하면 미리 dev 모드로 올려두는 게 효율적이다. 훅은 판단 실패 시의 안전망 역할이다. 둘 다 있어야 "사용자가 직접 요청할 일 없음"이 성립한다.

# 크로스-PC 운영

이 문서는 git에 커밋되므로 집 PC에서 `git pull` 하면 그대로 보인다. [CLAUDE.md](../CLAUDE.md)의 규칙, [.claude/hooks/check-engine-mount.sh](../.claude/hooks/check-engine-mount.sh) 훅, [.claude/settings.json](../.claude/settings.json)의 훅 등록도 함께 추적된다.

집 PC에서 할 일은:
1. `git pull`
2. Docker Desktop 실행
3. `docker-compose up -d --build`

Claude Code로 작업을 시작하면 CLAUDE.md가 자동 로드되어 규칙이 적용된다.

로컬 memory 파일(`%USERPROFILE%\.claude\projects\...\memory\`)은 PC마다 독립이므로 여기엔 이 프로젝트의 실행 규칙을 넣지 않는다. 규칙은 git 추적 문서에만 둔다.

# 교훈

- **프로젝트에 Dockerfile·compose 파일이 있으면 먼저 그것을 사용한다**. 추측으로 Node 직접 실행하지 않는다.
- **개발 편의를 위해 볼륨을 영구적으로 추가하지 않는다**. 배포 환경과의 차이를 숨기지 않는 게 더 안전하다. 대신 모드를 분리한다.
- **"자동화"는 Claude 판단 + 훅 안전망의 조합**이다. 한쪽만으로는 사용자 편의와 안정성을 동시에 달성하기 어렵다.
- **크로스-PC로 유지돼야 하는 규칙은 memory가 아니라 git 추적 파일(CLAUDE.md·docs/)에 둔다**. memory는 이 PC에서만 읽힌다.
