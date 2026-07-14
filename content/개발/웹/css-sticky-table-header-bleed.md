---
title: sticky 테이블 헤더 투명 비침 (border-collapse의 함정)
tags:
  - 웹
  - 프론트엔드
  - CSS
  - 테이블
  - 트러블슈팅
date: 2026-07-14
---

## 개요
> **한 줄 요약: `position: sticky`로 고정한 테이블 헤더는 `border-collapse: collapse`와 만나면 테두리가 헤더를 따라오지 못해 1px 투명 줄로 본문이 비친다 — `border-collapse: separate` + 셀 소유 테두리로 해결한다.**
>
> 스크롤 테이블에서 헤더를 고정하면 거의 반드시 만나는 재발성 함정이다. 증상은 하나(글씨 비침)인데 원인은 세 갈래라, 하나만 고치면 "아직도 비치는데?"가 반복된다. 이 노트는 세 원인을 메커니즘으로 구분하고 검증된 해결 패턴을 정리한다.

---

## 1. 문제 상황

- **증상**: HTML 테이블 헤더(`<thead>`)를 `position: sticky; top: 0`으로 고정하면, 스크롤을 내릴 때 헤더의 **테두리 부분으로 본문 글씨가 비쳐 보인다**.
- **관찰**: 헤더 배경은 칠해져 있는데도 셀 경계선 자리(1px 줄)로만 아래 내용이 지나가는 게 보인다.
- **동반 증상**: 그룹 헤더(colspan)를 쓴 테이블에서 일부 컬럼 폭이 0으로 붕괴하기도 한다.

---

## 2. 큰 흐름 — 왜 테두리만 비치는가

핵심은 **"접힌 테두리는 셀의 것이 아니다"**이다.

```
[border-collapse: collapse]
  인접한 두 셀의 테두리를 하나로 접음(공유)
    │ 이 공유 테두리는 누구 소유?
    ▼
  셀이 아니라 "테이블 레이어"에 그려짐
    │
    ▼
[스크롤 발생]
  헤더 셀(배경 포함)  → sticky라서 제자리에 붙어 있음
  공유 테두리        → 테이블 소속이라 본문과 함께 스크롤되어 떠남
    │
    ▼
  테두리가 있던 1px 자리 = 아무것도 안 칠해진 투명 틈
    │
    ▼
  그 틈으로 아래를 지나가는 본문 글씨가 비침
```

비유: 사무실 파티션(셀 배경)은 바닥에 고정했는데, 파티션 사이 몰딩(공유 테두리)은 카펫(테이블 본문)에 붙여 놓은 것과 같다. 카펫을 당기면 몰딩만 딸려가고 그 자리가 훤히 뚫린다.

---

## 3. 원인 3가지 (메커니즘별 구분)

| # | 원인 | 메커니즘 | 겉보기 |
|---|---|---|---|
| 1 | `border-collapse: collapse` + sticky | 접힌 테두리가 테이블 레이어 소속 → 헤더와 함께 안 움직이고 사라짐 | 테두리 자리 1px 줄로만 비침 |
| 2 | 헤더 셀 배경이 완전 불투명이 아님 | `rgba(..., 0.9)` 같은 알파값, 또는 배경 미지정(투명) | 셀 면 전체로 비침 |
| 3 | (동반 함정) `table-layout: fixed` + colspan 그룹 헤더 | fixed는 **첫 행에서만** 컬럼 폭을 읽음 → colspan 셀 아래 하위 컬럼 폭이 0px로 붕괴 | 일부 컬럼이 사라짐/찌그러짐 |

---

## 4. 해결 패턴 (전체 예시 코드)

```css
table {
  border-collapse: separate;  /* collapse 금지 — 테두리를 셀 소유로 되돌림 */
  border-spacing: 0;          /* separate의 기본 셀 간격 제거 → collapse와 같은 외관 */
  /* 바깥 테두리 중 상·좌만 테이블이 담당 (셀이 우·하를 담당하므로) */
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
}
th, td {
  /* 테두리를 각 셀이 소유 — 우·하만 그리면 이웃과 중복 없이 격자 완성 */
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
}
thead th {
  position: sticky;
  top: 0;
  background: #f5f5f5;  /* 완전 불투명 색 — rgba/알파 금지, 미지정 금지 */
}
```

```html
<!-- 컬럼 폭은 colgroup으로 명시 — rowspan/colspan 헤더 구조와 무관하게 적용 -->
<table>
  <colgroup>
    <col style="width: 120px" />
    <col style="width: 80px" />
    <col style="width: 200px" />
  </colgroup>
  <thead>...</thead>
  <tbody>...</tbody>
</table>
```

### 포인트별 해설

1. **`border-collapse: separate; border-spacing: 0`** — 테두리 소유권을 각 셀로 되돌린다. 셀 소유가 되면 sticky 헤더 셀이 이동을 멈출 때 테두리도 함께 붙어 있는다. `border-spacing: 0`이 없으면 셀 사이가 벌어져 collapse와 외관이 달라진다.
2. **셀은 `border-right` + `border-bottom`만** — 상하좌우를 다 그리면 이웃 셀과 2px 겹침이 생긴다. 우·하만 그리고, 격자의 바깥 상·좌 변은 `table`의 `border-top`/`border-left`가 채운다.
3. **헤더 배경은 알파 없는 완전 불투명 색** — sticky 헤더는 본문 위에 "떠 있는" 것이라, 배경에 조금이라도 투명도가 있으면 아래가 그대로 비친다.
4. **컬럼 폭은 `<colgroup><col>`** — `table-layout: fixed`가 첫 행(colspan 그룹 헤더)에서 폭을 읽어 붕괴하는 문제를 우회한다. `<col>` 폭은 헤더 행 구조와 무관하게 컬럼 자체에 적용된다.

---

## 5. 핵심 통찰

- **"배경은 셀의 것, 접힌 테두리는 테이블의 것"** — collapse 모드에서 둘의 소유자가 달라서, sticky가 배경만 데려가고 테두리는 두고 가는 게 이 버그의 전부다.
- 증상이 같아도(비침) 원인 축이 다르다: **테두리 소유권**(collapse) vs **배경 투명도**(알파) vs **레이아웃 폭 계산**(fixed+colspan). 하나 고치고 안 되면 나머지 축을 점검한다.

## 교훈

- sticky 테이블 헤더를 만들 땐 처음부터 `separate + spacing:0 + 셀 소유 테두리 + 불투명 배경 + colgroup` 세트를 기본값으로 깔고 시작하는 게 빠르다 — 재발 함정은 "만나면 고치기"보다 "패턴으로 예방"이 싸다.

## 관련 문서
- [[web-cdn-render-blocking-freeze|외부 CDN 의존이 부른 화면 멈춤]]
