const STORAGE_KEY = "design-theme"
const DEFAULT_DESIGN = "A"
const VALID = ["A", "B", "C"]

const initial = (() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved && VALID.includes(saved) ? saved : DEFAULT_DESIGN
})()
document.documentElement.setAttribute("data-design-theme", initial)

document.addEventListener("nav", () => {
  const syncActive = (design: string) => {
    document.querySelectorAll(".theme-option").forEach((el) => {
      const match = el.getAttribute("data-design") === design
      el.classList.toggle("active", match)
      el.setAttribute("aria-pressed", match ? "true" : "false")
    })
  }

  const current = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_DESIGN
  document.documentElement.setAttribute("data-design-theme", current)
  syncActive(current)

  const switchDesign = (e: Event) => {
    const target = e.currentTarget as HTMLElement
    const design = target.getAttribute("data-design")
    if (!design || !VALID.includes(design)) return
    document.documentElement.setAttribute("data-design-theme", design)
    localStorage.setItem(STORAGE_KEY, design)
    syncActive(design)
  }

  for (const btn of document.querySelectorAll(".theme-option")) {
    btn.addEventListener("click", switchDesign)
    window.addCleanup(() => btn.removeEventListener("click", switchDesign))
  }
})
