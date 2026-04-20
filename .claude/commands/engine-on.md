---
name: engine-on
description: Docker 컨테이너를 dev 모드로 전환한다. quartz/ 엔진 파일 수정이 즉시 반영되도록 볼륨 마운트 ON.
allowed-tools: Bash(docker-compose *) Bash(docker *)
---

# engine-on

quartz/ 엔진(컴포넌트·스타일) 작업을 시작할 때 Docker 컨테이너를 dev 모드로 전환한다.

## 실행 절차

1. 현재 컨테이너 상태를 `docker ps`로 확인
2. 이미 dev 모드면 "이미 dev 모드" 보고 후 종료
3. 아니면 다음을 실행:
   ```bash
   docker-compose down
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
   ```
4. `docker inspect`로 `/usr/src/app/quartz` 볼륨 마운트 확인
5. `http://localhost:8080` 응답 확인
6. 결과 1-2줄 보고

## 주의
- `--build`는 이미지 변경이 있을 때만 실제 빌드. 없으면 캐시 사용.
- 작업 끝나면 `/engine-off`로 복귀 권장 (세션 종료 시 SessionEnd 훅이 자동 처리하지만 명시적 전환이 더 안전).
