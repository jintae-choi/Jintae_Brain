# Jintae Brain

Quartz v4 기반 개발 공부 노트 사이트.

- 사이트: https://jintae-choi.github.io/Jintae_Brain
- 프로젝트 운영 가이드: [docs/프로젝트 운영 가이드.md](docs/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%20%EC%9A%B4%EC%98%81%20%EA%B0%80%EC%9D%B4%EB%93%9C.md)
- AI 자동화 운영 가이드: [docs/AI 운영 가이드.md](docs/AI%20%EC%9A%B4%EC%98%81%20%EA%B0%80%EC%9D%B4%EB%93%9C.md)

## 로컬 실행

### Docker (유일한 지원 방식)
```bash
docker-compose up -d --build
```
- 접속: http://localhost:8080
- 종료: `docker-compose down`
- `content/`, `quartz.config.ts`, `quartz.layout.ts` 수정 시 volumes 연결로 즉시 반영.

### 엔진(quartz/) 수정이 필요할 때 (dev 모드)
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```
- `quartz/` 전체가 볼륨 마운트되어 컴포넌트·스타일 수정이 즉시 반영됨.
- 엔진 작업이 끝나면 기본 모드로 복귀: `docker-compose down && docker-compose up -d`
- 자세한 개념·자동화 원리: `docs/Docker 개발 모드.md`

## 배포
- `main` 브랜치 push 시 GitHub Actions 자동 배포.
- 워크플로우: `.github/workflows/deploy.yml`
