import { useEffect, useState } from 'react'
import {
  readSearchViewport,
  searchViewportEquals,
  type ISearchViewportMetrics,
} from './searchViewport'

/**
 * Tracks the *visible* viewport while the search surface is open (docs/screens/search.md v9), so the
 * full-screen mobile presentation can size itself to what the reader can actually see — the part
 * `100dvh` gets wrong is the on-screen keyboard.
 *
 * Listens only while open: `visualViewport` fires on every keyboard show/hide, rotation and
 * pinch-zoom, and there is no reason to re-render the app for those when search is closed. Returns
 * `null` when there is nothing better than the stylesheet's `100dvh` fallback to offer.
 */
export function useSearchViewport(open: boolean): ISearchViewportMetrics | null {
  const [metrics, setMetrics] = useState<ISearchViewportMetrics | null>(null)

  useEffect(() => {
    if (!open) {
      setMetrics(null)
      return
    }

    const viewport = typeof window === 'undefined' ? null : window.visualViewport
    if (!viewport) return

    const sync = () => {
      const next = readSearchViewport(viewport)
      setMetrics((current) => (searchViewportEquals(current, next) ? current : next))
    }

    sync()
    viewport.addEventListener('resize', sync)
    // `scroll` on the visual viewport is how iOS reports the page being pushed up around a focused
    // input — the height may not change at all, only `offsetTop`.
    viewport.addEventListener('scroll', sync)
    return () => {
      viewport.removeEventListener('resize', sync)
      viewport.removeEventListener('scroll', sync)
    }
  }, [open])

  return metrics
}
