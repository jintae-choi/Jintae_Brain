---
name: explorer-long-title-hover
description: 탐색기(목차) 긴 문서명은 marquee가 아니라 hover 시 줄바꿈 펼침으로 표시
type: project
---

탐색기(왼쪽 목차)의 긴 문서명 처리 = **한 줄로 자르고(넘치면 숨김) 마우스를 올리면(hover) 줄바꿈을 풀어 전체 이름을 표시**한다. "물 흐르듯" 좌우로 흐르는 marquee·자동 스크롤이 **아니다**.

구현: `quartz/styles/custom.scss`의 `.explorer-content` 규칙 — 평소 `white-space: nowrap` + `overflow: hidden`(한 줄 클립), `:hover`에서 `white-space: normal`(펼침). 결정 기록은 CSS 주석에만 있었고 SSOT(메모리)엔 없어 헷갈렸던 항목.
