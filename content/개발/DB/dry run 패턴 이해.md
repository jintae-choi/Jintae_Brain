---
title: dry run 패턴 이해
tags:
  - DB
  - migration
  - transaction
  - safe-execution
date: 2026-04-09
---

# dry run 패턴 이해

## 개요
dry run은 실제 데이터 변경 없이 실행 결과를 미리 확인하는 모의 실행 방식이다.

## 핵심 동작
- 내부적으로 트랜잭션 시작.
- 검증용 매핑 쿼리까지 실제 수행.
- 마지막 단계에서 COMMIT 대신 ROLLBACK 수행.
- 결과: DB 영구 변경 없음.

## 테스트 방법
서버 실행 상태에서 API 호출로 검증 가능.

### 1) dry run 모의 실행
```bash
curl -X POST http://localhost:4000/api/migration/reconcile \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'
```

### 2) 실제 마이그레이션 실행
```bash
curl -X POST http://localhost:4000/api/migration/reconcile \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}'
```

### 3) 브라우저 콘솔 테스트
```javascript
fetch('/api/migration/reconcile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ dryRun: true })
}).then((r) => r.json()).then(console.log)
```

## 확인 포인트
응답에서 아래 항목 우선 확인.
- 매칭 성공 건수
- 매칭 실패 건수
- 미매칭 코드 목록

## 실행 순서 권장
1. dryRun: true로 결과 검증.
2. 이상 없음 확인.
3. dryRun: false로 실제 반영.

## 메모
- 엔드포인트 경로는 프로젝트 라우팅 규칙에 맞게 조정 필요.
