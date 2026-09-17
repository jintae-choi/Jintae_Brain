# Jintae Brain

Quartz v4 기반 개발 공부 노트 사이트.

- 사이트: https://jintae-choi.github.io/Jintae_Brain
- 프로젝트 운영 가이드: [docs/가이드/00_프로젝트 운영 가이드.md](docs/%EA%B0%80%EC%9D%B4%EB%93%9C/00_%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%20%EC%9A%B4%EC%98%81%20%EA%B0%80%EC%9D%B4%EB%93%9C.md)
- AI 운영 가이드(스킬·서브에이전트·훅): [docs/가이드/01_AI 운영 가이드.md](docs/%EA%B0%80%EC%9D%B4%EB%93%9C/01_AI%20%EC%9A%B4%EC%98%81%20%EA%B0%80%EC%9D%B4%EB%93%9C.md)
- AI 도구 지침 원본: [AGENTS.md](AGENTS.md) — Codex 등은 네이티브 로드, Claude Code는 [CLAUDE.md](CLAUDE.md)가 임포트

## 로컬 실행

```bash
npm ci
npx quartz build --serve
```
- 접속: http://localhost:8080
- watch 모드: `content/`·`quartz.config.ts`·`quartz.layout.ts`·`quartz/` 안의 `.ts`/`.tsx`/`.scss` 변경 시 자동 리빌드.
- Node 22 (`.node-version`).

### Docker (보존용 — 일상 미리보기엔 쓰지 않음)
```bash
docker-compose up -d --build
```
- 엔진(`quartz/`) 수정까지 반영하려면 `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build`.
- 종료: `docker-compose down`

## 배포
- `main` 브랜치 push 시 GitHub Actions 자동 배포.
- 워크플로우: `.github/workflows/deploy.yml`

## 라이선스
- 엔진 코드(`quartz/` 등): MIT — [LICENSE.txt](LICENSE.txt)
- 학습 노트(`content/`): CC BY-NC-ND 4.0 (저작자표시-비영리-변경금지) — [content/LICENSE.md](content/LICENSE.md)
