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

## 로컬 실행

```bash
npm ci
npx quartz build --serve
```

## 배포

- `main` 브랜치 push 시 GitHub Actions로 자동 배포
- 워크플로우: `.github/workflows/deploy.yml`

## Docker 사용 여부

Docker는 선택 사항입니다.

- 권장(일반 사용): Node 로컬 실행(`npx quartz build --serve`)
- 필요할 때만 Docker 사용: 로컬 Node 환경을 설치하기 어렵거나, 실행 환경을 팀에서 동일하게 맞춰야 할 때
