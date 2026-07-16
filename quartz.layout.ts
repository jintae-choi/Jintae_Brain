import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// 탐색기(Explorer) 공용 설정 — 일반 페이지·목록 페이지 두 곳에서 함께 사용
// 주의: sortFn·mapFn은 toString()으로 브라우저에 전송되므로 함수 밖 변수를 참조하면 안 된다.
const explorerOptions: Parameters<typeof Component.Explorer>[0] = {
  folderDefaultState: "open",
  initiallyOpenFolders: ["개발"],
  useSavedState: false,
  // 정렬(sort)을 이름 치환(map)보다 먼저 실행 — "🐳 Docker"가 아니라 "Docker"로 매칭하기 위함
  order: ["filter", "sort", "map"],
  sortFn: (a, b) => {
    // 목차 순서 — 비교는 같은 폴더 안 형제끼리만 일어나므로, 최상위와 하위 폴더 이름을 한 배열에 섞어 둬도 된다
    const folderOrder = [
      // 시스템 하위
      "OS",
      "shell",
      // 최상위: 계층 아래→위 (시스템 → 서버 → DB → git → 웹 → 메타)
      "시스템",
      "서버",
      // 서버 하위
      "Docker",
      "배포",
      "DB",
      "git",
      "웹",
      // 웹 하위
      "JavaScript",
      "Agentic AI",
      "프로젝트",
      "기술동향",
    ]
    if (a.isFolder && b.isFolder) {
      const ai = folderOrder.indexOf(a.displayName)
      const bi = folderOrder.indexOf(b.displayName)
      if (ai !== -1 || bi !== -1) {
        // 목록에 없는 새 폴더는 맨 뒤로
        return (ai === -1 ? folderOrder.length : ai) - (bi === -1 ? folderOrder.length : bi)
      }
    }
    // 파일끼리는 파일명(슬러그) 숫자순 — "1. …" 파일 번호가 탐색기 표시 순번과 일치하게
    if (!a.isFolder && !b.isFolder) {
      return a.slug.localeCompare(b.slug, undefined, { numeric: true, sensitivity: "base" })
    }
    // 목록 밖 폴더끼리는 이름 숫자·가나다순
    if (a.isFolder && b.isFolder) {
      return a.displayName.localeCompare(b.displayName, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    }
    return !a.isFolder && b.isFolder ? 1 : -1
  },
  mapFn: (node) => {
    // 폴더별 상징 이모지 — 직렬화 제약으로 매핑 표를 함수 안에 선언
    if (node.isFolder) {
      const folderIcons: Record<string, string> = {
        시스템: "🖥️",
        OS: "⚙️",
        shell: "🐚",
        서버: "🗄️",
        Docker: "🐳",
        배포: "🚀",
        DB: "🛢️",
        git: "🌿",
        웹: "🌐",
        JavaScript: "🟨",
        "Agentic AI": "🤖",
        프로젝트: "📂",
        기술동향: "📡",
      }
      const icon = folderIcons[node.displayName]
      if (icon) {
        node.displayName = `${icon} ${node.displayName}`
      }

      // 문서(파일)는 이모지 대신 폴더 안 순번 — sort가 map보다 먼저라 표시 순서와 일치
      let n = 1
      for (const child of node.children) {
        if (!child.isFolder) {
          const plain = child.displayName.replace(/^\p{Extended_Pictographic}️?\s*/u, "")
          child.displayName = `${n}. ${plain}`
          n++
        }
      }
    }
  },
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  // 상단 고정 바: 왼쪽 브레드크럼 + 오른쪽 컨트롤 버튼(사이드바 접기·다크모드·리더모드).
  // header 슬롯에 두어야 custom.scss의 sticky(스크롤 상단 고정)가 본문 전체 높이에서 작동한다
  header: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.Flex({
      components: [
        { Component: Component.SidebarToggle() },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
      direction: "row",
      gap: "0.5rem",
    }),
  ],
  afterBody: [
    Component.ConditionalRender({
      component: Component.RecentNotes({
        title: "📌 최근 학습 기록",
        limit: 5,
        showTags: false,
        filter: (f) => !f.slug?.endsWith("index"),
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jintae-choi",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ArticleTitle(),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.TagList(),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
      ],
    }),
    Component.Explorer(explorerOptions),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
      ],
    }),
    Component.Explorer(explorerOptions),
  ],
  right: [],
}
