---
title: 로컬 API 호출 실행 방법 (마이그레이션 reconcile API)
tags:
  - shell
  - api
  - postman
  - javascript
  - powershell
date: 2026-04-09
---

# 로컬 API 호출 실행 방법 (마이그레이션 reconcile API)

## 개요
> 마이그레이션 reconcile API를 로컬에서 실행하는 방법과 선택 기준 정리이다.

대상 API는 아래와 같다.

- URL: `http://localhost:4000/api/migration/reconcile`
- Method: `POST`
- Body 예시: `{"dryRun": true}`

`dryRun: true`는 실제 반영 없이 검증용 실행이라는 의미이다.

## 핵심 내용

### 1. 브라우저 개발자도구 Console에서 실행
가장 빠른 방법이다. 서비스 페이지가 이미 열려 있으면 즉시 테스트 가능하다.

```javascript
fetch('/api/migration/reconcile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ dryRun: true }),
})
  .then((r) => r.json())
  .then(console.log)
```

특징은 아래와 같다.

- 상대경로(`/api/...`) 사용 가능이다.
- 현재 로그인 세션/쿠키 컨텍스트를 그대로 사용한다.
- 프론트엔드 관점에서 API 연동 확인에 유리하다.

주의점은 아래와 같다.

- 브라우저가 API 서버와 다른 오리진이면 CORS 영향이 있다.
- 응답이 JSON이 아닐 때 `r.json()`에서 실패할 수 있다.

### 2. PowerShell에서 실행
Windows 기본 터미널에서 바로 실행 가능하므로 범용성이 높다.

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:4000/api/migration/reconcile" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"dryRun": true}'
```

특징은 아래와 같다.

- 브라우저 없이 독립 실행 가능이다.
- 스크립트 자동화, 배치 실행에 적합하다.

주의점은 아래와 같다.

- PowerShell 문자열 인용 규칙을 지켜야 한다.
- 줄바꿈 연속은 백틱(``` ` ```)을 사용해야 한다.

### 3. Postman / Insomnia 같은 API 클라이언트
GUI 기반 테스트가 필요할 때 가장 편하다.

설정은 아래와 같다.

- Method: `POST`
- URL: `http://localhost:4000/api/migration/reconcile`
- Header: `Content-Type: application/json`
- Body (raw JSON): `{"dryRun": true}`

특징은 아래와 같다.

- 요청 히스토리, 환경변수, 컬렉션 관리가 쉽다.
- 응답 확인(헤더/본문/시간/상태코드)이 직관적이다.

### 4. 프론트엔드 관리자 버튼 추가
반복 실행이 많으면 가장 사용자 친화적 방식이다.

구조는 아래와 같다.

- 버튼 클릭 이벤트
- `fetch`로 API 호출
- 진행 상태(로딩/성공/실패) 표시
- 응답 메시지 렌더링

특징은 아래와 같다.

- 운영/관리자 사용성 향상이다.
- 비개발자도 실행 가능하다.
- 초기 UI 개발 비용이 필요하다.

### 5. curl 사용 (Git Bash 등)
리눅스/맥/CI 환경과 문법 일관성이 높다.

```bash
curl -X POST "http://localhost:4000/api/migration/reconcile" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'
```

특징은 아래와 같다.

- 스크립트화, CI 파이프라인 연동에 적합하다.
- 다양한 운영체제에서 동일 패턴으로 사용 가능하다.

주의점은 아래와 같다.

- PowerShell 기본 `curl`은 실제 curl이 아니라 별칭일 수 있다.
- Windows에서는 Git Bash/WSL에서 실행하면 혼동이 줄어든다.

## 실전 적용

### 지금 바로 실행할 때 추천
- 1순위: 브라우저 Console이다.
- 2순위: PowerShell이다.

빠른 이유는 아래와 같다.

- 별도 도구 설치가 필요 없다.
- 현재 로컬 서버 컨텍스트에서 즉시 검증 가능하다.

### 상황별 선택 기준
| 상황 | 추천 방식 | 이유 |
|---|---|---|
| 화면 켜져 있고 즉시 확인 필요 | 브라우저 Console | 가장 빠른 실행 |
| 터미널 자동화/반복 실행 | PowerShell, curl | 스크립트화 용이 |
| 응답 분석/재사용 요청 관리 | Postman/Insomnia | GUI 가시성 우수 |
| 운영자가 직접 실행 | 관리자 버튼 | 사용자 친화적 |

## 주의사항
- `dryRun: false` 실행 전 백업/롤백 계획이 필요하다.
- 서버 주소(`localhost:4000`)와 실제 포트 일치 확인이 필요하다.
- 인증이 필요한 API이면 쿠키/토큰 전달 방식 확인이 필요하다.

## 트러블슈팅
| 증상 | 원인 | 해결 |
|---|---|---|
| `404 Not Found` | 경로 또는 포트 불일치 | URL, 포트, 라우트 등록 확인 |
| `415 Unsupported Media Type` | Content-Type 누락 | `application/json` 헤더 추가 |
| `400 Bad Request` | JSON Body 형식 오류 | 따옴표/중괄호/키 이름 점검 |
| PowerShell에서 Body 파싱 오류 | 문자열 인용/이스케이프 문제 | 단일 인용 문자열로 JSON 전달 |
| 브라우저에서 CORS 오류 | 오리진 정책 충돌 | 서버 CORS 설정 또는 동일 오리진 호출 |

## 관련 문서
- [[shell]]

## 참고자료
- MDN Fetch API: https://developer.mozilla.org/docs/Web/API/Fetch_API
- PowerShell Invoke-RestMethod: https://learn.microsoft.com/powershell/module/microsoft.powershell.utility/invoke-restmethod
- curl docs: https://curl.se/docs/
