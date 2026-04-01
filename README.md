# Jintae Brain

Quartz v4 기반의 개발 공부 노트 사이트입니다.

## 프로젝트 목적

- Markdown 문서를 정적 사이트로 배포
- 위키링크(`[[문서명]]`) 중심의 문서 연결
- GitHub Pages 자동 배포

## 운영 정보

- 사이트 URL: `https://jintae-choi.github.io/Jintae_Brain`
- 프레임워크: Quartz v4
- 기본 언어: ko-KR
- 핵심 설정 파일: `quartz.config.ts`, `quartz.layout.ts`

자세한 운영 규칙은 아래 문서를 참고하세요.

- 프로젝트 운영 가이드: [document/프로젝트 운영 가이드.md](document/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%20%EC%9A%B4%EC%98%81%20%EA%B0%80%EC%9D%B4%EB%93%9C.md)
- Copilot 작업 지침: [.github/copilot-instructions.md](.github/copilot-instructions.md)

## 로컬 실행 (Docker 권장)

Node.js 설치 없이 Docker를 이용해 로컬에서 실행하는 것을 권장합니다.
로컬 환경과 관계없이 동일한 실행 환경을 보장합니다.

```bash
# 백그라운드에서 실행 (최초 실행 시 이미지를 빌드합니다)
docker-compose up -d --build
```

### 접속 주소 🌐
- URL: **[http://localhost:18080](http://localhost:18080)**
*(8080 포트 충돌을 피하기 위해 기본적으로 18080 포트를 사용하도록 설정되어 있습니다.)*

> **Note:** 파일 수정 내용은 `volumes`로 연결되어 있어, `content/` 마크다운 파일을 수정하면 즉시 로컬 서버에 반영됩니다.

**종료 방법:**
```bash
docker-compose down
```

## 배포

- `main` 브랜치 push 시 GitHub Actions로 자동 배포
- 워크플로우: `.github/workflows/deploy.yml`

## Node 직접 실행 (선택 사항)

만약 Docker 환경을 사용할 수 없거나 직접 Node 환경에서 실행하고 싶다면 아래 명령어를 사용합니다. (Node 22 이상)

```bash
npm ci
npx quartz build --serve
```

### 접속 주소 🌐
- URL: **[http://localhost:8080](http://localhost:8080)**
