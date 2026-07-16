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
    // 목차 순서: ①컴퓨터 계층(아래→위) ②개발 파이프라인 ③도구·메타
    const folderOrder = [
      "시스템",
      "shell",
      "DB",
      "Data",
      "php",
      "JavaScript",
      "웹",
      "git",
      "Docker",
      "배포",
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
    // 그 외(파일끼리, 목록 밖 항목)는 기본 정렬: 폴더 먼저, 이름 숫자·가나다순
    if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
      return a.displayName.localeCompare(b.displayName, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    }
    return !a.isFolder && b.isFolder ? 1 : -1
  },
  mapFn: (node) => {
    if (node.isFolder && node.displayName === "Docker") {
      node.displayName = "🐳 Docker"
    }
  },
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
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
  beforeBody: [
    Component.Breadcrumbs(),
    Component.Flex({
      components: [
        { Component: Component.SidebarToggle() },
        { Component: Component.Darkmode() },
      ],
      direction: "row",
      gap: "0.5rem",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
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
  right: [],
}
