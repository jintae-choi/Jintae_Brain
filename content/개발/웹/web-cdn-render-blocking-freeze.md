---
title: 외부 CDN 의존이 부른 화면 멈춤 (render-blocking · await 2단계 함정)
tags:
  - 웹
  - 프론트엔드
  - 렌더링
  - 성능
  - 트러블슈팅
date: 2026-07-02
---

## 개요
> **한 줄 요약: 화면을 그리는 임계 경로(critical path)에 걸린 외부 CDN이 해외망에서 무응답(pending)으로 매달려 화면이 멈췄고, 그 자원들을 우리 서버로 옮겨(self-host) 해결했다.**
>
> 해외망(필리핀)에서 웹 공정표 화면이 "초기화중"에서 멈춘 사건이다. 원인은 **화면을 그리는 임계 경로(critical path)에 걸린 외부 CDN 요청이 응답 없이 매달린(pending)** 것이다. 멈춤 지점은 두 곳이었다 — ①앱 부팅 때 폰트 CDN(render-blocking) ②간트 초기화 때 아이콘 CDN(JS `await`). 해결은 외부 자원을 우리 서버로 옮긴(self-host) 것이다. 이 노트는 "같은 증상, 두 가지 다른 메커니즘"을 흐름도로 구분한다.

---

## 1. 문제 상황

- **증상**: 필리핀 현장에서 웹 공정표 화면이 "초기화중" 문구에서 더 진행되지 않는다. 국내망에서는 정상이다.
- **관찰**: 화면이 뜰 때 브라우저가 외부 CDN에서 파일을 받아온다.
  - 글꼴: `cdn.jsdelivr.net`
  - 아이콘: `cdn.dhtmlx.com`
- **핵심 정황**: 해당 해외망에서 이 CDN들이 응답 없이 매달린다(요청이 `pending` 상태로 영영 안 끝남). 그 결과 로딩이 완료되지 않는다.
- **범위**: `embed` 공정표 화면은 사실상 간트(gantt)가 화면 전부라, 간트 하나만 멈춰도 사용자 눈에는 전체가 멈춘 것과 같다.

> 검열·차단이 있는 해외망에서는 국내에서 멀쩡한 외부 CDN이 조용히 `pending`으로 죽는다. `error`도 아니고 `timeout`도 아닌 **무응답**이 가장 다루기 까다롭다.

---

## 2. 큰 흐름 — 2단계 로드 모델

화면이 뜨기까지 외부 CDN에 의존하는 지점은 **두 단계**로 나뉜다. 각 단계가 독립적으로 멈출 수 있다.

```
[1단계: 앱 부팅]
  브라우저
    │ index.html 읽음
    ▼
  CSS / 폰트 받음 ──(외부 폰트 CDN: jsdelivr 의존)──► 걸리면: "화면 자체가 안 그려짐"
    │
    ▼
  React 실행 → 화면 그림

        │  (1단계 통과해야 2단계 시작)
        ▼

[2단계: 간트 초기화]
  React 뜬 뒤
    │ 공정표 화면 진입
    ▼
  우리 코드가 간트 라이브러리(suite.min.css / js) 로드
    │
    ▼ ──(외부 아이콘 CDN: dhtmlx 의존)──► 걸리면: "간트가 안 그려짐"
  간트 렌더

→ 두 단계 각각 외부 CDN에 의존한다. 둘 중 하나라도 "매달리면 멈춤".
```

- **1단계(render-blocking)**: 브라우저의 기본 렌더링 규칙이 만든 멈춤. 우리가 명시적으로 짠 코드가 아니라 `<head>`에 링크만 걸어도 발생한다.
- **2단계(JS `await`)**: 우리 코드가 명시적으로 만든 멈춤. 간트 초기화 함수가 CSS 로딩을 `await`로 기다린다.
- 증상("초기화중")만 보면 **2단계(간트 초기화 시점의 아이콘 CDN)**가 가장 유력한 범인이다. "초기화중" 글자가 화면에 떴다는 것 자체가 첫 페인트(1단계)는 이미 통과했다는 신호다. (자세한 진단 추론은 아래 4. 핵심 통찰에서 이어진다.)

### 사전 지식 / 용어

본문 이해에 필요한 최소 개념이다. 이미 알면 스킵.

- **CDN** — 정적 파일(폰트·아이콘·라이브러리)을 전 세계 서버에서 대신 배포해주는 외부 서비스. 빠르지만 **내가 통제할 수 없는 남의 서버**다.
- **render-blocking** — 브라우저가 "첫 화면 그리기(첫 페인트)"를 미루게 만드는 자원. 대표적으로 `<head>`의 CSS.
- **첫 페인트(first paint)** — 브라우저가 화면에 처음으로 픽셀을 그리는 순간.
- **`pending`** — 네트워크 요청을 보냈으나 응답이 아직(혹은 영영) 안 온 상태. `error`도 `timeout`도 아니다.
- **self-host** — 외부 CDN 대신 파일을 우리 서버 안에 두고 직접 서빙하는 것.
- **임계 경로(critical path)** — 화면이 사용자에게 보이기까지 반드시 거쳐야 하는 자원 로딩·실행의 연쇄. 이 경로에 걸린 요청 하나가 늦으면 화면 전체가 늦어진다.

---

## 3. 개념별 상세

### 3-1. 개념 ① render-blocking (1단계)

CSS **다운로드 자체는 비동기**다. 브라우저는 CSS를 받는 동안 HTML 파싱 등 다른 일을 계속한다. 그러나 **첫 페인트는 블로킹 게이트**다. `<head>`의 stylesheet가 전부 로드되기 전에는 화면을 그리지 않는다. 스타일 안 입은 화면이 번쩍였다가 바뀌는 현상(FOUC, Flash Of Unstyled Content)을 막기 위해서다.

즉 "동기 코드라서 막힌다"가 아니라 **"렌더의 전제조건(모든 CSS 로드)이 영영 안 채워져서" 멈춘다.**

```
[브라우저]
   │ 1. index.html 파싱
   ▼
<head> 안 <link rel="stylesheet" href="jsdelivr..."> 발견
   │ 2. CSS 요청 (다운로드 자체는 비동기 → 파싱은 계속)
   ▼
[첫 페인트 게이트] ── 모든 stylesheet 로드 끝났나?
   │                              │
   │ 아니오 (jsdelivr pending)     │ 예
   ▼                              ▼
화면 안 그림 (전제조건 미충족)      화면 그리기 (첫 페인트)
```

```html title="index.html"
<!-- index.html <head> — 외부 폰트 CDN을 link로 건 경우 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/.../pretendard.css">
<!-- jsdelivr가 pending이면 이 stylesheet가 "로드 완료"가 안 됨 → 첫 페인트 무기한 대기 -->
```

> **비유(mental model)**: JS의 `await`가 "함수 하나가 그 줄에서 정지"하는 것이라면, render-blocking은 **"문 열기 전 체크리스트 항목"**이다. `화면 표시`라는 문은 체크리스트가 전부 켜져야 열린다. 외부 CSS라는 체크박스 하나가 안 켜지면, 함수가 멈춘 게 아니라 **문 자체가 안 열린다.**

### 3-2. 개념 ② CSS `@import`도 render-blocking (1단계의 두 번째 경로)

멈춤 경로는 `<link>`만이 아니다. **우리 서버 CSS 파일 안**에 외부를 가리키는 `@import` 한 줄이 있어도 똑같이 멈춘다.

스타일시트 안에 `@import`가 있으면, 브라우저는 **import한 CSS까지 전부 받아야 "로딩 완료"**로 친다. `@import`된 CSS도 동일하게 render-blocking이다.

```
브라우저
   │ index-xxxx.css 받음 (빠름 — 우리 서버)
   ▼
첫 줄에서 @import jsdelivr 발견
   │ jsdelivr 요청
   ▼
jsdelivr 응답할 때까지 렌더 계속 막힘   ← 여기!
```

```css title="index-xxxx.css"
/* index-xxxx.css — 우리 서버에서 받으므로 다운로드는 빠름 */
@import url("https://cdn.jsdelivr.net/.../pretendard.css"); /* ← 이 한 줄이 외부 CDN */
body { font-family: Pretendard, sans-serif; }
```

우리 서버 파일(빠름)인데도, **그 안의 외부 CDN 가리키는 줄 하나** 때문에 `index.html`의 `<link>`와 똑같은 멈춤을 한 번 더 유발한다.

참고로 `@import`는 **"부모 CSS 받고 → 파싱 → `@import` 발견 → 그제야 자식 CSS 요청"**이라 요청이 순차적이다. 병렬로 미리 못 받으니 `<link>`보다 더 느리고 취약하다.

실제로 이 프로젝트가 물린 경로가 바로 이 `@import`다 — 아래 5. 해결의 Before 코드에 있는 `@import url("...pretendard.css")` 한 줄이 그 예다. 3-1의 `<link>`는 일반 예시이고, 실제로 매달린 건 이 `@import` 경로다.

> **비유(mental model)**: 우리 집 현관까지는 금방 왔는데(우리 CSS), 현관에 붙은 쪽지에 **"이 문 열려면 저 멀리 상점(jsdelivr) 가서 열쇠 받아오세요"**라고 적혀 있는 격이다. 그 상점이 문을 안 열면 우리 집 문도 못 연다. 게다가 쪽지는 **집에 도착해서야** 읽으므로(순차) 심부름이 더 늦어진다.

### 3-3. 개념 ③ JS `await`로 CSS 로딩을 감쌈 (2단계)

2단계 멈춤은 브라우저 기본 동작이 아니라 **우리 코드**가 만든다. 간트 초기화 코드가 CSS 로딩을 `Promise`로 감싸 `await`한다.

```
React 앱 부팅 OK → 공정표 화면 진입 → 간트 init 실행
   │
   ▼ await loadStylesheet('suite.min.css')
       │ suite.min.css 안 @import cdn.dhtmlx.com/dhx-icons.css
       ▼
   dhtmlx 매달림 → <link>의 load 이벤트가 안 뜸
       │
       ▼
   await가 영영 resolve 안 됨
       │
       ▼
   간트 init 함수가 이 줄에서 멈춤 → 간트 안 그려짐 → "초기화중"
```

```js
// loadStylesheet: <link>를 JS로 동적 생성하고 그 load 이벤트를 Promise로 감쌈
function loadStylesheet(href) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();   // 성공: load 이벤트 → resolve
    link.onerror = () => reject();   // 실패: error 이벤트 → reject
    document.head.appendChild(link);
    // ⚠ load도 error도 안 뜨면(무응답 pending) 이 Promise는 영영 안 끝남
  });
}

async function initGantt(container) {
  await loadStylesheet('/vendor/dhtmlx/suite.min.css');   // 번들된 로컬 파일
  // 하지만 suite.min.css 내부: @import url('https://cdn.dhtmlx.com/.../dhx-icons.css')  ← 이게 외부 CDN!
  // dhtmlx 매달리면 load 이벤트 안 뜸 → 위 await가 영영 안 풀림
  gantt.init(container);   // ← 여기 도달 못 함
}
```

핵심은 **"CSS 로딩"이라는 브라우저 동작을 우리가 JS `await` 대상으로 바꿔놓은 것**이다. 이건 React가 만든 멈춤이 아니라 우리 헬퍼가 만든 멈춤이다.

> **비유(mental model)**: 원래 알아서 흐르던 물(브라우저의 CSS 로딩)에 **밸브(`await`)**를 달아놓고 "물이 다 차면 다음 단계로"라고 정해둔 것이다. 물이 안 차면(load 이벤트 안 옴) 밸브가 영영 안 열리고, 그 뒤 공정(간트 init)이 전부 멈춘다.

---

## 4. 핵심 통찰

- **"render-blocking 아님" ≠ "안 위험함".** 2단계 `await`는 render-blocking이라는 *메커니즘*은 아니다. 그러나 `await`한 Promise가 영영 resolve되지 않으면 그 뒤 코드(간트 `init`)가 실행되지 못해 똑같이 멈춘다. "첫 페인트를 막는 메커니즘이 아니다"라는 말과 "위험하지 않다"는 말은 다르다.
- **같은 증상, 다른 메커니즘.** 1단계와 2단계는 멈추는 원리가 다르다.

| 구분 | 1단계 render-blocking | 2단계 JS `await` |
|---|---|---|
| 멈춤 주체 | 브라우저 기본 렌더 규칙 | 우리 코드(`loadStylesheet` 헬퍼) |
| 걸리는 자원 | 폰트 CDN(jsdelivr) | 아이콘 CDN(dhtmlx) |
| 멈춤 결과 | 화면 자체가 안 그려짐 | 간트가 안 그려짐 |
| 발동 조건 | `<head>` stylesheet / `@import` 로드 미완 | `<link>` load 이벤트 미발생 |
| 비유 | 문 열기 체크리스트 미충족 | 밸브(`await`)가 안 열림 |

- **범인 지목.** 증상이 "초기화중"이었으니, 간트 **초기화 시점의 `await`(2단계, dhx-icons)**가 가장 유력한 후보다.
- **근본 대응.** 어느 쪽이 진짜 원인이든 안 걸리게 하려고 **"임계 경로의 외부 요청을 전부"** 제거한 것이 핵심이다. 범인을 특정하는 대신 위험 경로 자체를 없앴다.
- ★ **이건 브라우저 버그도 React 버그도 아니다.** "외부 CDN에 의존하게 짠 우리 코드"의 **설계 선택** 문제다. (이 로직은 bcmf 코드에서 그대로 물려받았다.)

---

## 5. 해결

외부 CDN에서 받던 3개(폰트 2 + 아이콘 1)를 **우리 서버 안으로 옮겨(self-host)** 외부 의존을 제거했다. 임계 경로에 남의 서버가 끼어들 여지를 없앤 것이다.

```css
/* Before — 외부 CDN @import (해외망에서 pending 위험) */
@import url("https://cdn.jsdelivr.net/.../pretendard.css");

/* After — self-host + @font-face */
@font-face {
  font-family: 'Pretendard';
  src: url('/fonts/Pretendard.woff2') format('woff2'); /* 우리 서버 파일 */
  font-display: swap;   /* 먼저 대체 폰트로 화면 렌더, 폰트 다 받으면 교체 → 화면을 안 막음 */
}
body { font-family: 'Pretendard', sans-serif; }
```

- 폰트는 `@font-face`로 로컬 파일을 지정하고 `font-display: swap`을 줬다. 그래서 폰트 로딩이 화면을 막지 않는다 — **먼저 대체 폰트로 뜨고 나중에 교체**한다.
- 아이콘 CSS(`dhx-icons`)도 같은 방식으로 우리 서버에 두어 2단계 `await`가 매달릴 대상을 없앴다.

---

## 6. 개선 여지 (멈춤은 고쳤지만 더 단단하게/가볍게 할 점)

> 아래는 버그가 아니다. 지금 당장 안 해도 되지만, 구조적으로 더 견고하게 만들 여지다.

### ① `loadStylesheet` 헬퍼에 타임아웃이 없음 — 근본 취약점

이번 수정은 **방아쇠(외부 CDN)**를 없앤 것이지 **취약한 패턴** 자체를 없앤 게 아니다. 헬퍼는 `load → resolve`, `error → reject`만 있고 타임아웃이 없다. 그래서 어떤 스타일시트든 매달리면(load도 error도 안 뜨면) `await`가 영영 안 풀린다.

지금은 전부 same-origin(우리 서버)이라 실질 위험은 작다. 그러나 **누군가 또 외부 리소스를 추가하면 같은 멈춤이 재발**한다. `Promise.race`로 타임아웃을 걸면 방아쇠와 무관하게 구조적으로 막힌다.

```js
// p(원래 Promise)와 "ms 뒤 reject하는 Promise"를 race → 먼저 끝나는 쪽이 이김
const withTimeout = (p, ms) => Promise.race([
  p,
  new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
]);

// 8초 넘으면 withTimeout이 reject → await가 예외를 throw.
// try/catch로 받아야 '다음으로 진행'할 수 있다. 핵심은 영영 멈추지 않는다는 것.
try {
  await withTimeout(loadStylesheet(url), 8000);
} catch (e) {
  // 타임아웃/에러: 폴백(대체 처리) 후 계속 진행
}
```

### ② self-host 폰트가 2MB (기존 CDN dynamic-subset은 53KB)

`font-display: swap`이라 화면은 안 막지만(멈춤과 무관), 느린 회선엔 용량이 부담이다. **필요한 글자·굵기만 subset**하면 수백 KB로 감량 가능하다.

### ③ 같은 'CDN 의존' 패턴이 3D 모델 화면(`Model.html`)에 그대로 남음

공정표와 별개 라우트라 이번엔 미변경. 모델 화면은 해외망에서 여전히 같은 방식(tailwind / three.js / picsum CDN)으로 멈출 수 있다. 같은 self-host 방식으로 고칠 후보다.

---

## 7. 한 줄 교훈

> **검열·차단이 있는 해외망을 고려하면, 화면을 그리는 임계 경로에서 외부 CDN 의존을 걷어내고 정적 자원은 self-host한다. 남의 서버 무응답(`pending`)은 `error`가 아니라 "영영 안 끝남"이라 가장 위험하다.**

---

## 관련 문서
- [[GitHub Pages 배포 구조]] — 정적 자원을 우리 서버에서 서빙하는 배포 구조

## 참고자료
- [MDN: Render blocking](https://developer.mozilla.org/en-US/docs/Glossary/Render_blocking)
- [MDN: `@import`](https://developer.mozilla.org/en-US/docs/Web/CSS/@import)
- [MDN: `font-display`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display)
- [MDN: `Promise.race()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)
