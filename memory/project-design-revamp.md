---
name: project-design-revamp
description: "Jintae Brain 디자인 개선 프로젝트 — 2026-07-02 4축 진단 완료, 4단계 로드맵 수립"
type: project
---

2026-07-02 사이트 전면 진단 완료 (디자인/라이브사이트/버전/아키텍처/벤치마크 5개 에이전트).

**핵심 진단**: 뼈대(구조·기능·아키텍처)는 상급, 디테일 마감이 부족.
- 테마: A(Technical Docs, 기본)/B(Academic)/C(Developer) 3종 + `quartz/styles/custom.scss` 484줄 커스텀 존재. `quartz.config.ts`의 세이지 그린(#3f6f63) 기본 팔레트는 테마 스위처에 즉시 덮여 죽어 있음.
- 주요 결함: 한글 `word-break: keep-all` 미적용, 본문 폭 920px 과다(custom.scss:36), font-weight 800 합성 볼드(custom.scss:47,182), 콜아웃 원색, 코드블록 파일명 라벨 미활용, 랜딩 빈약, 노트 title이 파일명 그대로, og:image:type 오타(`image/.png`).
- 아키텍처 실질 버그: `.dockerignore` 부재 → `Dockerfile:10`의 `COPY . .`가 Windows node_modules로 Linux 설치본을 덮어씀.
- 스택 판정: Quartz 4.5.2 = v4 라인 최신 유지(v5.0.0은 2026-03 출시, YAML 전환·플러그인 재편 중이라 관망). Node 22 → 24(Active LTS) 승격 권장. 대안 SSG 이전 비추천(wikilink+그래프뷰 네이티브는 Quartz뿐).

**진행 상황 (2026-07-02)**:
- 완료: STEP 1 가독성 기본기(keep-all·행간 1.7·본문폭 760px·볼드 700) + 랜딩 재구성(index.md 큐레이션·RecentNotes "최근 학습 기록"·홈 메타 숨김·푸터 GitHub 링크 교체) + 배포/기술동향 index.md 신설.
- 완료: **시안 C(터미널 다크, VS Code 참고) 채택** — 기본 테마 A→C 변경, 테마 C를 시안 수준으로 확장(터미널 타이틀바·프롬프트 breadcrumb·주석형 메타·코드 라인넘버·파일명 탭 CSS·콜아웃 터미널 팔레트·GitHub식 표·상태바 푸터). quartz.config.ts 기본 팔레트를 C와 일치시킴(죽은 세이지 그린 제거), 다크 구문 테마 dark-plus. C 다크 순백 헤딩 #e8e8e8로 보정. A/B는 유지(동결). 전부 custom.scss+자체 파일이라 upstream 충돌 면적 불변.
- 시안 4종(A 모던독스/B 웜페이퍼가든/C 터미널다크/D 에디토리얼)을 위젯 목업으로 제시. C로 구현했으나 **사용자 피드백으로 C 탈락**: "터미널 다크 눈에 안 들어옴, C 다크 진짜 별로". A가 선두("눈에 잘 들어옴"), B는 편하지만 내용 전달력 부족, D는 고급지지만 코드 가독성 약함. → 라운드2 시안 E(독스 프로=A 강화+슬레이트 다크)/F(소프트 딤+딤드 다크)/G(노션 클린)/H(에디토리얼×독스 하이브리드) 제시, 각각 라이트+다크 쌍으로. **디자인 확정 전 구현·커밋·다음 단계 진행 금지** (사용자 지시). 로컬의 C 구현분은 미커밋 상태로 보류 — 방향 확정 후 재작업.
- 소통 주의: 선택 다이얼로그 답변·위젯 버튼 클릭이 채팅 메시지처럼 도착하는 것에 사용자가 혼란 느낌. 사용자가 직접 타이핑한 메시지와 UI 클릭을 구분해서 인용할 것.
- 라운드2 피드백: **A 확정 우세** (핵심 콜아웃·개념 설명·흐름도·코드·표 구성 전부 호평). E는 A만 못하지만 **E의 슬레이트 다크는 호평**. B/C/D/F/G/H 탈락.
- **최종 확정 (2026-07-03): 최종안 1 "A 오리지널"** — 라이트 화이트+인디고(#4f46e5), 다크 슬레이트(#0f172a+#818cf8). 구현 완료: 기본 테마 A 복귀, A 팔레트 인디고화, 코드블록 전 모드 다크 슬레이트(one-dark-pro 토큰, Stripe 방식), 파일명 탭(신호등) CSS, 하이라이트 라인, 콜아웃(인디고/앰버), 표(세로줄 제거+인디고 헤더), 태그 칩, 흐름도는 밝은 카드(`pre:not(:has(code[data-language]))`). B/C 코드블록도 다크 배경으로 조정(토큰 호환). config 기본 팔레트 = A와 일치.
- 발견 사실: **라인 넘버는 Quartz 기본 기능**(base.scss:463, upstream) — 버그 아님, 유지. 버그 수정: 테마별 인라인 `code` 배경 규칙이 pre>code까지 덮던 문제 → `:not(pre) > code`로 스코프 (A/B/C 3곳).
- **2026-07-06 커밋 완료** (4개, 로컬 main): `a6a586e` 엔진/디자인(팔레트·코드탭·탐색기·사이드바) / `994e9fa` 노트 디자인정비(H1중복제거·코드탭20·frontmatter·랜딩) / `5d47ab5` 새 노트(웹CDN·RDP, 사용자작성+내포맷) / `00960e1` gh문서(사용자작성). Docker 기본 모드 복귀 완료.
- 검증 완료: 코드탭 20개 렌더 OK, H1 단일화 OK, frontmatter 9개 YAML유효, 배치 24개 본문 무변경(기계 검사 통과).
- push 완료 — 2026-09-17 확인: 위 커밋 4개 모두 origin/main 에 포함(배포됨).
- 목업 패리티 추가 처리: `--titleFont` 변수 A=산세리프/C=모노 지정(사이트명 세리프 버그 수정), JB 로고 박스, 페이지 1480px 중앙정렬, 헤딩 스케일 축소(h1 2→1.45rem 등).

**남은 로드맵**:
1. push → 배포 확인 (승인 대기)
2. 아키텍처 5건: .dockerignore(1순위)·CI 캐시·CHOKIDAR_USEPOLLING(Windows 핫리로드)·actions SHA 고정·업스트림 동기화 루틴
3. og:image:type 오타·og:url /index 접미사 (quartz 코어, 관망)
4. 노트 description frontmatter 작성(SEO), B테마 p+p 들여쓰기 버그, 스위처 A/B/C 라벨 개선

**남은 작업**:
1. 노트에 ` ```bash title="..." {N} ` 문법 적용(코드 탭·라인 하이라이트 활성화 — CSS는 준비됨)
2. 노트 title 서술화 + description 작성 (SEO/공유)
3. og:image:type 오타·og:url /index 접미사 수정 (quartz 코어 영역, 관망)
4. B 테마 p+p 들여쓰기 버그, 스위처 A/B/C 라벨 개선
5. 아키텍처: .dockerignore(1순위)·CI 캐시·CHOKIDAR_USEPOLLING(Windows 핫리로드)·3001 포트 노출·actions SHA 고정
6. 여러 index.md의 date:0 경고 정리

관련: [[user-profile]], [[feedback-writing-structure]]
