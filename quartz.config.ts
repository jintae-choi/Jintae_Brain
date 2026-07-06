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
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Noto Serif KR",
        body: "IBM Plex Sans KR",
        code: "JetBrains Mono",
      },
      // 기본 팔레트 = 기본 테마 A(화이트+인디고 / 슬레이트 다크)와 동일.
      // 검색 미리보기·OG 등 테마 속성 밖 영역의 색 일치용.
      colors: {
        lightMode: {
          light: "#ffffff",
          lightgray: "#e6e8eb",
          gray: "#6b7280",
          darkgray: "#374151",
          dark: "#0f172a",
          secondary: "#4f46e5",
          tertiary: "#4338ca",
          highlight: "rgba(79, 70, 229, 0.1)",
          textHighlight: "#fde68a80",
        },
        darkMode: {
          light: "#0f172a",
          lightgray: "#1e293b",
          gray: "#94a3b8",
          darkgray: "#cbd5e1",
          dark: "#f1f5f9",
          secondary: "#818cf8",
          tertiary: "#a5b4fc",
          highlight: "rgba(129, 140, 248, 0.18)",
          textHighlight: "#fde68a3a",
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
