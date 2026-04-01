---
title: JavaScript 클로저(Closure) 이해하기
tags:
  - JavaScript
  - 기초문법
  - 함수
date: 2026-04-01
---

# JavaScript 클로저(Closure) 이해하기

## 개요
> 클로저는 함수가 선언된 렉시컬 환경을 기억하는 함수다.

## 핵심 내용

### 1. 클로저란?

클로저는 **내부 함수가 외부 함수의 변수에 접근할 수 있는 메커니즘**이다.
외부 함수가 실행을 마쳐도, 내부 함수가 외부 함수의 변수를 참조하고 있다면 그 변수는 메모리에서 해제되지 않는다.

```javascript
function outer() {
  let count = 0;
  return function inner() {
    count++;
    return count;
  };
}

const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

### 2. 실용적 활용: 데이터 은닉

클로저를 사용하면 private 변수를 흉내낼 수 있다.

```javascript
function createUser(name) {
  let _name = name; // 외부에서 직접 접근 불가

  return {
    getName: () => _name,
    setName: (newName) => { _name = newName; },
  };
}

const user = createUser("진태");
console.log(user.getName()); // "진태"
user.setName("Jintae");
console.log(user.getName()); // "Jintae"
```

### 3. 주의: 반복문에서의 클로저

`var`를 사용하면 클로저가 같은 변수를 공유해서 의도치 않은 결과가 발생한다.

```javascript
// 문제 코드
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 3, 3, 3
}

// 해결: let 사용 (블록 스코프)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 0, 1, 2
}
```

## 관련 문서
- [[JavaScript 실행 컨텍스트와 스코프 체인]]

## 참고자료
- [MDN - Closures](https://developer.mozilla.org/ko/docs/Web/JavaScript/Closures)
