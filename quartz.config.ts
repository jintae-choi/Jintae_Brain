import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Jintae Brain",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "ko-KR",
    baseUrl: "jintae-choi.github.io/Jintae_Brain",
    ignorePatterns: ["private", "templates", ".obsidian", "LICENSE.md"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "JetBrains Mono",
        body: "IBM Plex Sans KR",
        code: "JetBrains Mono",
      },
      // 팔레트 = 디자인 C(Developer — GitHub/VS Code 톤). 라이트/다크 양쪽.
      // 검색 미리보기·OG 등 테마 속성 밖 영역의 색도 여기서 맞춘다.
      colors: {
        lightMode: {
          light: "#f7f8fa",
          lightgray: "#e1e4e8",
          gray: "#6e7681",
          darkgray: "#24292f",
          dark: "#0d1117",
          secondary: "#0969da",
          tertiary: "#0550ae",
          highlight: "rgba(9, 105, 218, 0.12)",
          textHighlight: "#fff8c580",
        },
        darkMode: {
          light: "#1e1e1e",
          lightgray: "#2d2d30",
          gray: "#858585",
          darkgray: "#d4d4d4",
          dark: "#e8e8e8",
          secondary: "#4ec9b0",
          tertiary: "#9cdcfe",
          highlight: "rgba(78, 201, 176, 0.16)",
          textHighlight: "#d7ba7d4f",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        // 코드블록은 모든 테마에서 다크 배경 고정이라 토큰도 다크 전용 테마 하나로 통일
        theme: {
          light: "one-dark-pro",
          dark: "one-dark-pro",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Plugin.CustomOgImages(),
    ],
  },
}

export default config
