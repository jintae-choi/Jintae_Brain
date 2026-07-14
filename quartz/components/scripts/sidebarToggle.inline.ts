const SIDEBAR_TOGGLE_STORAGE_KEY = "sidebarLeftCollapsed"

function applyCollapsedState(collapsed: boolean) {
  document.documentElement.toggleAttribute("data-sidebar-left-collapsed", collapsed)
  for (const button of document.getElementsByClassName("sidebar-toggle")) {
    button.setAttribute("aria-expanded", (!collapsed).toString())
  }
}

// Apply saved state immediately so re-render after SPA navigation doesn't flash open.
applyCollapsedState(localStorage.getItem(SIDEBAR_TOGGLE_STORAGE_KEY) === "true")

function toggleSidebar(this: HTMLElement) {
  const collapsed = document.documentElement.hasAttribute("data-sidebar-left-collapsed")
  applyCollapsedState(!collapsed)
  localStorage.setItem(SIDEBAR_TOGGLE_STORAGE_KEY, (!collapsed).toString())
}

document.addEventListener("nav", () => {
  applyCollapsedState(localStorage.getItem(SIDEBAR_TOGGLE_STORAGE_KEY) === "true")

  for (const button of document.getElementsByClassName("sidebar-toggle")) {
    button.addEventListener("click", toggleSidebar)
    window.addCleanup(() => button.removeEventListener("click", toggleSidebar))
  }
})
