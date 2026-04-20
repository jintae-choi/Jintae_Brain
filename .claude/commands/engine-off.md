---
name: engine-off
description: Docker 컨테이너를 기본 모드로 전환한다. quartz/ 엔진 볼륨 마운트 OFF, 배포 환경과 동일한 상태로 복귀.
allowed-tools: Bash(docker-compose *) Bash(docker *)
---

# engine-off

엔진 작업을 마치고 콘텐츠 작업으로 복귀할 때 Docker 컨테이너를 기본 모드로 전환한다.

## 실행 절차

1. 현재 컨테이너 상태를 `docker ps`로 확인
2. 이미 기본 모드면 "이미 기본 모드" 보고 후 종료
3. dev 모드면:
   ```bash
   docker-compose down
   docker-compose up -d
   ```
4. `http://localhost:8080` 응답 확인
5. 결과 1-2줄 보고

## 언제 자동 실행되나
SessionEnd 훅이 세션 종료 시 dev 모드 감지 시 자동으로 이 작업을 수행한다. 다만 명시적으로 기본 모드에서 콘텐츠 작업을 계속 하고 싶을 때 이 커맨드로 즉시 전환 가능.
