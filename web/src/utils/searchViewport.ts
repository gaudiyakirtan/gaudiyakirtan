/**
 * Usable-viewport metrics for the full-screen mobile search surface (docs/screens/search.md v9).
 *
 * `100dvh` already tracks the browser's collapsing toolbars, but it does **not** track the
 * on-screen keyboard: on iOS Safari the keyboard shrinks the *visual* viewport while the layout
 * viewport (and therefore `dvh`) stays tall, so a `dvh`-only surface puts its bottom half behind
 * the keyboard. `window.visualViewport` is the only thing that reports the truth, so the surface
 * publishes its height/offset as CSS variables and the mobile media query consumes them, with
 * `100dvh` as the declared fallback for browsers that have no `visualViewport`.
 *
 * DOM-free on purpose (like `mobileHeaderScroll`), so the arithmetic is testable without a browser.
 */

export const SEARCH_VIEWPORT_HEIGHT_VAR = '--gk-search-viewport-height'
export const SEARCH_VIEWPORT_TOP_VAR = '--gk-search-viewport-top'

/** The slice of `VisualViewport` this needs — anything shaped like it works. */
export interface IVisualViewportLike {
  height: number
  offsetTop: number
}

export interface ISearchViewportMetrics {
  height: number
  offsetTop: number
}

/**
 * Reads the visual viewport into whole pixels, or `null` when it cannot be trusted (absent API,
 * or a zero/invalid height mid-rotation) — `null` means "say nothing and let the CSS `100dvh`
 * fallback stand", which is always better than pinning the surface to a bogus height.
 */
export function readSearchViewport(viewport?: IVisualViewportLike | null): ISearchViewportMetrics | null {
  if (!viewport) return null

  const height = Math.round(viewport.height)
  if (!Number.isFinite(height) || height <= 0) return null

  // A negative offset is meaningless here (the surface would sit above the visible area) and a
  // non-finite one is a broken reading; both collapse to the top of the visual viewport.
  const rawOffset = viewport.offsetTop
  const offsetTop = Number.isFinite(rawOffset) ? Math.max(0, Math.round(rawOffset)) : 0

  return { height, offsetTop }
}

/** Whole-pixel comparison, so sub-pixel scroll/resize noise doesn't re-render the surface. */
export function searchViewportEquals(
  a: ISearchViewportMetrics | null,
  b: ISearchViewportMetrics | null,
): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return a.height === b.height && a.offsetTop === b.offsetTop
}

/**
 * The custom properties the surface sets. Empty when there are no metrics, so the stylesheet's
 * `var(..., 100dvh)` fallback applies untouched rather than being overridden with a guess.
 */
export function searchViewportStyle(metrics: ISearchViewportMetrics | null): Record<string, string> {
  if (!metrics) return {}
  return {
    [SEARCH_VIEWPORT_HEIGHT_VAR]: `${metrics.height}px`,
    [SEARCH_VIEWPORT_TOP_VAR]: `${metrics.offsetTop}px`,
  }
}
