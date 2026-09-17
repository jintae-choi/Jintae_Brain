---
title: 🛢️ WBS 계층 데이터의 정규화와 뷰 역정규화
tags:
  - DB
  - 데이터모델링
  - 정규화
  - 뷰
  - WBS
date: 2026-09-17
---

## 개요
> lv1~lv7 열을 한 테이블에 펼쳐 저장하던 WBS(작업분류체계) 데이터를 트리 테이블 2개 + 교차 테이블로 정규화하고, "예전처럼 펼쳐서 보고 싶다"는 조회 요구는 뷰(View)로 해결한 기록이다. **저장은 정규화, 조회는 역정규화** — 두 요구를 한 구조로 만족시킨다. (학습 시점 2026-04, 사례 값은 일반 예시로 바꿨다.)

---

## 1. 전체 개념 / 흐름

### 1-1. 큰 그림

```
[기존] tb_wbs_flat ── 한 행에 lv1~lv7 열, 상위 이름을 하위 행마다 반복
          │
          │ 정규화 (원자성 회복)
          ▼
[저장]  tb_location (위치 트리)  ──┐
        tb_work_type (공종 트리) ──┼──► tb_wbs_mapp (리프 = 위치 × 공종)
          │                        │
          │ 뷰가 조인·전개          │
          ▼                        ▼
[조회]  vw_wbs ── lv1~lv7 펼친 형태 + wbs_cd(계층 코드) + source + 원본 id
                 (팀이 원한 모양 그대로, 저장 구조는 건드리지 않음)
```

### 1-2. 사전 지식 / 용어

- **WBS(Work Breakdown Structure, 작업분류체계)** — 공사·프로젝트를 큰 단위에서 작은 단위로 쪼갠 트리. 예: 도로 → 구조물공 → 교량 → 하부공 → 교대 → 기초.
- **Adjacency List(인접 리스트)** — 각 행이 `parent_id`로 부모를 가리키는 트리 저장 방식. 가장 기본적이고 널리 쓰인다.
- **Junction Table(교차 테이블, 매핑 테이블)** — 두 테이블의 N:M 관계를 담는 중간 테이블. ERD의 "관계"를 실제로 구현하는 테이블이다.
- **뷰(View)** — 저장된 SELECT 쿼리. 데이터를 갖지 않고 조회 시점에 원본 테이블을 조인해 보여준다.
- **정규화 / 역정규화** — 중복을 없애 한 사실이 한 곳에만 있게 만드는 것 / 조회 편의를 위해 일부러 펼쳐 두는 것.
- **안티패턴** — 자주 쓰이지만 나중에 문제가 생기는 설계. 반대말은 패턴(검증된 해결책).

### 1-3. 비교 예시 / 익숙한 것과 대조

| 항목 | 펼친 테이블 (기존, 안티패턴) | 정규화 테이블 + 뷰 (현재) |
|---|---|---|
| 저장 형태 | 한 행에 `lv1`~`lv7` 열, 해당 레벨까지만 채움 | 위치 트리·공종 트리·교차 테이블 3개 |
| "교대" 이름 변경 | "교대"가 들어간 모든 행을 UPDATE | `tb_work_type` 1행만 수정 |
| 무결성 | 문자열 일치에 의존, FK 없음 | FK로 보장 |
| 도메인 | 위치(location)와 공종(work_type)이 한 테이블에 혼재 | 도메인별 테이블 분리 |
| 팀이 보던 펼친 형태 | 테이블 자체 | `vw_wbs` 뷰가 조회 때 재조립 |
| 같은 펼친 형태를 테이블로 두면 | — | 다시 안티패턴. **뷰이기 때문에** 원자성이 안 깨진다 |

### 1-4. 구성요소 역할

| 구성요소 | 역할 |
|---|---|
| `tb_location` | 위치 트리(Adjacency List). `location_id`, `parent_id`, `name`, `level`, `sort_order` |
| `tb_work_type` | 공종 트리(Adjacency List). `work_type_id`, `parent_id`, `name`, `level`, `sort_order` |
| `tb_wbs_mapp` | 리프 한 개 = (위치, 공종) 한 쌍. `wbs_id`, `location_id`, `work_type_id` |
| `vw_wbs` | 세 테이블을 조인해 lv1~lv7 한 줄 형태로 전개. 저장은 안 함 |
| `wbs_cd` (뷰 컬럼) | `W-` + 각 레벨 `sort_order` 3자리 연결. 문자열 정렬 = 트리 순서 |
| `source` (뷰 컬럼) | 그 행의 `name`이 `location`에서 왔는지 `work_type`에서 왔는지 명시 |

---

## 2. 전체 예시 코드

### 2-1. 기존 구조 (안티패턴) — 예시 데이터

```text
wbs_cd                      name       lv1   lv2       lv3    lv4   lv5     lv6   lv7
W-001                       도로       도로
W-001001                    구조물공   도로  구조물공
W-001001001                 A교        도로  구조물공  A교
W-001001001001              양방       도로  구조물공  A교    양방
W-001001001001002           하부공     도로  구조물공  A교    양방  하부공
W-001001001001002001        교대       도로  구조물공  A교    양방  하부공  교대
W-001001001001002001001     기초&저판  도로  구조물공  A교    양방  하부공  교대  기초&저판
W-001001001001002001002     교대본체   도로  구조물공  A교    양방  하부공  교대  교대본체
                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                       상위 레벨 값이 하위 행마다 반복 → 데이터 중복
```

### 2-2. 정규화 후 구조 — 테이블 정의와 예시 데이터

```sql
-- 위치 트리 (Adjacency List)
CREATE TABLE tb_location (
  location_id  INT PRIMARY KEY,
  parent_id    INT NULL REFERENCES tb_location(location_id),
  name         VARCHAR(100) NOT NULL,
  level        INT NOT NULL,
  sort_order   INT NOT NULL          -- 같은 부모 아래에서 유일
);

-- 공종 트리 (Adjacency List)
CREATE TABLE tb_work_type (
  work_type_id INT PRIMARY KEY,
  parent_id    INT NULL REFERENCES tb_work_type(work_type_id),
  name         VARCHAR(100) NOT NULL,
  level        INT NOT NULL,
  sort_order   INT NOT NULL
);

-- 교차 테이블: 리프 한 개 = (위치, 공종) 한 쌍
CREATE TABLE tb_wbs_mapp (
  wbs_id       INT PRIMARY KEY,
  location_id  INT NOT NULL REFERENCES tb_location(location_id),
  work_type_id INT NOT NULL REFERENCES tb_work_type(work_type_id)
);
```

```text
tb_location                              tb_work_type
location_id parent_id name   level       work_type_id parent_id name       level
1           NULL      도로   1           1            NULL      구조물공   1
2           1         A교    2           6            1         하부공     2
3           2         양방   3           7            6         교대       3
                                         8            7         기초&저판  4

tb_wbs_mapp
wbs_id  location_id  work_type_id
3       3 (양방)     8 (기초&저판)
```

### 2-3. 뷰가 만들어 주는 결과 — 두 가지 전개 패턴

```text
[구조물공 패턴]  위치 3단 + 공종 4단 = 7단
wbs_cd                      lv  name       source     location_id  work_type_id  wbs_id
W-001                        1  도로       location   1            null          null
W-001001                     2  구조물공   work_type  null         1             null
W-001001001                  3  A교        location   2            null          null
W-001001001001               4  양방       location   3            null          null
W-001001001001002            5  하부공     work_type  null         6             null
W-001001001001002001         6  교대       work_type  null         7             null
W-001001001001002001001      7  기초&저판  work_type  3            8             3

[토공 패턴]  위치 4단 + 공종 3단 = 7단
wbs_cd                      lv  name       source     location_id  work_type_id  wbs_id
W-001002                     2  토공       work_type  null         37            null
W-001002002                  3  본선       location   4            null          null
W-001002002001               4  양방       location   5            null          null
W-001002002001001            5  1구간      location   6            null          null
W-001002002001001002         6  깎기       work_type  null         41            null
W-001002002001001002001      7  땅깎기     work_type  6            42            24
```

### 2-4. 뷰의 뼈대 (개념 스케치)

실제 뷰 정의는 프로젝트마다 다르다. 아래는 "리프에서 출발해 레벨별 행을 UNION ALL로 만들고 DISTINCT로 공유 부모를 접는다"는 구조만 보인 스케치다.

```sql
CREATE VIEW vw_wbs AS
SELECT DISTINCT * FROM (
  -- lv1: 리프의 최상위 위치
  SELECT CONCAT('W-', LPAD(l1.sort_order, 3, '0')) AS wbs_cd,
         1 AS lv, l1.name, 'location' AS source,
         l1.location_id, NULL AS work_type_id, NULL AS wbs_id
    FROM tb_wbs_mapp m
    JOIN tb_location l3 ON l3.location_id = m.location_id
    JOIN tb_location l2 ON l2.location_id = l3.parent_id
    JOIN tb_location l1 ON l1.location_id = l2.parent_id
  UNION ALL
  -- lv2 … lv6: 같은 방식으로 위치·공종 레벨을 한 단씩 더 붙인다
  UNION ALL
  -- lv7: 리프 자체 — 세 id 를 모두 가진다
  SELECT CONCAT('W-', /* 상위 6단 코드 */ LPAD(w4.sort_order, 3, '0')) AS wbs_cd,
         7 AS lv, w4.name, 'work_type' AS source,
         m.location_id, m.work_type_id, m.wbs_id
    FROM tb_wbs_mapp m
    JOIN tb_work_type w4 ON w4.work_type_id = m.work_type_id
) t;
```

---

## 3. 라인별 / 포인트별 상세 해설

### 3-1. 계층 코드 `wbs_cd` — sort_order 3자리 연결

```sql
CONCAT('W-', LPAD(l1.sort_order, 3, '0'))   -- lv1: W-001
-- lv2 이하는 상위 코드 뒤에 자기 sort_order 3자리를 이어 붙인다: W-001001, W-001001001 …
```

- `LPAD(값, 3, '0')` — 3자리로 왼쪽을 0으로 채운다(`1` → `001`). 자릿수가 같아야 문자열 정렬이 숫자 순서와 같다.
- `sort_order`가 같은 부모 아래에서 유일하면 코드도 자동으로 유일하다.
- 뷰에서 생성하므로 `sort_order`를 바꾸면 코드가 따라 바뀐다. 테이블에 코드를 저장했다면 생겼을 동기화 문제가 없다.

### 3-2. `source` 컬럼 — 이름의 출처를 명시

- lv5는 행마다 위치일 수도, 공종일 수도 있다(구조물공 패턴은 공종 "하부공", 토공 패턴은 위치 "1구간").
- lv7은 `location_id`·`work_type_id`·`wbs_id` 세 개를 다 갖지만 `name`은 공종에서 온다.
- id 조합으로 출처를 추측하게 두면 혼란스럽다. `source` 한 컬럼으로 못 박는 것이 정확하다.

### 3-3. `UNION ALL` + `DISTINCT` — 트리 전개

- `UNION ALL` — 여러 SELECT 결과를 중복 제거 없이 이어 붙인다. 리프(lv7) 한 행에서 lv1~lv7 각 레벨 행을 하나씩 만든다.
- `DISTINCT` — 여러 리프가 공유하는 부모 행(예: "도로", "구조물공")이 리프 수만큼 생기므로 한 번만 남긴다.
- 각 행에 원본 id(`location_id`, `work_type_id`, `wbs_id`)를 붙여야 뷰 결과에서 원본 행으로 되돌아갈 수 있다.

### 3-4. 리프만 세 id를 모두 가진다

- lv7 행은 `tb_wbs_mapp` 행 그 자체다. 그래서 `wbs_id`가 있고, 위치·공종 id도 둘 다 있다.
- lv1~lv6 행은 트리의 중간 노드라 자기 쪽 id 하나만 있고 나머지는 `null`이다.

> **용어박스: 뷰 vs 테이블**
> 뷰는 저장된 쿼리다. lv1~lv7이 반복되는 결과를 담아도 원자성을 깨지 않는다. 같은 구조를 실제 테이블로 만들면 도메인 혼재·문자열 의존이 되살아나 안티패턴이 된다.

---

## 4. 핵심 통찰
두 독립 트리(위치·공종)를 하나로 합쳐 보여주는 것은 **뷰로 만들면 정답, 테이블로 만들면 안티패턴**이다. 저장 구조(정규화)와 표시 구조(역정규화)를 분리하면 무결성과 조회 편의를 동시에 가진다.

---

## 5. 경험과 교훈 / 트러블슈팅

### ❌ 상황: 정규화했더니 "예전처럼 펼쳐서 보게 해 달라"
- 팀은 lv1~lv7이 한 줄에 펼쳐진 형태로 데이터를 확인해 왔다. 정규화된 세 테이블은 그 눈에 낯설었다.
- **원인**: 저장 구조와 조회 형태를 같은 것으로 보고 있었다.
- **해결**: 저장은 세 테이블 그대로 두고 `vw_wbs` 뷰가 조회 때 예전 형태로 재조립한다. 양쪽 요구를 모두 만족한다.

### 뷰 컬럼 구조가 바뀌면 `CREATE OR REPLACE`가 안 된다
- 컬럼 수·타입이 달라지는 변경은 `DROP VIEW` → `CREATE VIEW`로 해야 한다.

### 뷰와 백엔드 로직은 경쟁이 아니라 역할 분담
- 뷰는 DB 레벨에서 확인·분석할 때, 백엔드는 API 응답을 만들 때. 같은 전개 로직을 두 곳에 두는 것이 아니라 용도가 다르다.

---

## 6. Best Practices
- 계층 코드는 레벨별 `sort_order` 3자리 연결이 가장 직관적이다. 정렬이 곧 트리 순서가 된다.
- 이름 출처가 모호한 전개 결과에는 `source` 컬럼을 둔다.
- 전개 결과의 모든 행에 원본 테이블 id를 유지한다. 없으면 뷰에서 원본으로 돌아갈 길이 없다.
- 트리 저장은 Adjacency List로 시작한다. 깊이가 고정(여기서는 7단)이면 뷰의 UNION 개수도 고정이라 단순하다.

---

## 관련 문서
- [[dry run 패턴 이해]] — DB 변경을 안전하게 검증하는 방식
