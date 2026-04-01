---
title: JavaScript 실행 컨텍스트와 스코프 체인
tags:
  - JavaScript
  - 기초문법
  - 동작원리
date: 2026-04-01
---

# JavaScript 실행 컨텍스트와 스코프 체인

## 개요
> 실행 컨텍스트는 JavaScript 코드가 실행되는 환경 정보를 담은 객체다.

## 핵심 내용

### 1. 실행 컨텍스트 구성

JavaScript 엔진은 코드를 실행할 때 **실행 컨텍스트(Execution Context)** 를 생성한다.

| 구성 요소 | 설명 |
|-----------|------|
| Variable Environment | 변수, 함수 선언 저장 |
| Lexical Environment | 스코프 체인 정보 |
| this binding | this가 가리키는 대상 |

### 2. 콜 스택(Call Stack)

실행 컨텍스트는 **콜 스택**에 쌓이고, LIFO(후입선출) 방식으로 처리된다.

```javascript
function first() {
  console.log("first");
  second();
}

function second() {
  console.log("second");
  third();
}

function third() {
  console.log("third");
}

first();
// 콜 스택: [Global] → [first] → [second] → [third]
// 실행 순서: first → second → third
// 스택 해제: third → second → first → Global
```

### 3. 스코프 체인

내부 함수에서 변수를 참조할 때, 자신의 스코프 → 외부 스코프 → 전역 스코프 순서로 탐색한다.

```javascript
const global = "전역";

function outer() {
  const outerVar = "외부";

  function inner() {
    const innerVar = "내부";
    console.log(innerVar);  // "내부" (자신의 스코프)
    console.log(outerVar);  // "외부" (외부 스코프)
    console.log(global);    // "전역" (전역 스코프)
  }

  inner();
}

outer();
```

이 스코프 체인 메커니즘이 바로 [[JavaScript 클로저 이해하기|클로저]]가 동작하는 기반이다.

## 관련 문서
- [[JavaScript 클로저 이해하기]]

## 참고자료
- [MDN - Execution Context](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/this)
