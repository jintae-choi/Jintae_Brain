# Jintae Brain

Quartz v4 기반 개발 공부 노트 사이트.

- 사이트: https://jintae-choi.github.io/Jintae_Brain
- 운영 가이드: [document/프로젝트 운영 가이드.md](document/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%20%EC%9A%B4%EC%98%81%20%EA%B0%80%EC%9D%B4%EB%93%9C.md)

## 로컬 실행

### Docker (권장)
```bash
docker-compose up -d --build
```
- 접속: http://localhost:18080
- 종료: `docker-compose down`
- `content/` 수정 시 volumes 연결로 즉시 반영.

### Node 직접 실행 (Node 22+)
```bash
npm ci
npx quartz build --serve
```
- 접속: http://localhost:8080

## 배포
- `main` 브랜치 push 시 GitHub Actions 자동 배포.
- 워크플로우: `.github/workflows/deploy.yml`
