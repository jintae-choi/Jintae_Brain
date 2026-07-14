import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/sidebarToggle.scss"
// @ts-ignore
import script from "./scripts/sidebarToggle.inline"
import { classNames } from "../util/lang"

const SidebarToggle: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <button
      type="button"
      class={classNames(displayClass, "sidebar-toggle")}
      aria-label="사이드바 접기/펼치기"
      aria-expanded={true}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="chevron"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  )
}

SidebarToggle.css = style
SidebarToggle.beforeDOMLoaded = script

export default (() => SidebarToggle) satisfies QuartzComponentConstructor
