// @ts-ignore
import themeSwitcherScript from "./scripts/themeswitcher.inline"
import styles from "./styles/themeswitcher.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const options = [
  { id: "A", label: "A", title: "Technical Docs — 깔끔/전문" },
  { id: "B", label: "B", title: "Academic — 학술/여백" },
  { id: "C", label: "C", title: "Developer — 다크/모노" },
]

const ThemeSwitcher: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div
      class={classNames(displayClass, "theme-switcher")}
      role="group"
      aria-label="디자인 테마 선택"
    >
      {options.map((opt) => (
        <button
          class="theme-option"
          data-design={opt.id}
          title={opt.title}
          aria-label={opt.title}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

ThemeSwitcher.beforeDOMLoaded = themeSwitcherScript
ThemeSwitcher.css = styles

export default (() => ThemeSwitcher) satisfies QuartzComponentConstructor
