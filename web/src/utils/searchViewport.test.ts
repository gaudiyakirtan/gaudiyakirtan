import { describe, expect, it } from 'vitest'
import {
  readSearchViewport,
  searchViewportEquals,
  searchViewportStyle,
  SEARCH_VIEWPORT_HEIGHT_VAR,
  SEARCH_VIEWPORT_TOP_VAR,
} from './searchViewport'

describe('search viewport metrics', () => {
  it('reads the visual viewport in whole pixels', () => {
    expect(readSearchViewport({ height: 743.5, offsetTop: 0 })).toEqual({ height: 744, offsetTop: 0 })
  })

  it('reports the keyboard-shrunk height, which is the whole point of measuring', () => {
    // iOS Safari: the layout viewport (and therefore 100dvh) stays 844 while the keyboard is up.
    expect(readSearchViewport({ height: 508, offsetTop: 0 })).toEqual({ height: 508, offsetTop: 0 })
  })

  it('keeps the offset the browser reports when the page is pushed up', () => {
    expect(readSearchViewport({ height: 508, offsetTop: 62.4 })).toEqual({ height: 508, offsetTop: 62 })
  })

  it('falls back to the stylesheet when there is nothing trustworthy to report', () => {
    expect(readSearchViewport(null)).toBeNull()
    expect(readSearchViewport(undefined)).toBeNull()
    expect(readSearchViewport({ height: 0, offsetTop: 0 })).toBeNull()
    expect(readSearchViewport({ height: Number.NaN, offsetTop: 0 })).toBeNull()
  })

  it('clamps a negative or broken offset rather than lifting the surface off-screen', () => {
    expect(readSearchViewport({ height: 844, offsetTop: -12 })?.offsetTop).toBe(0)
    expect(readSearchViewport({ height: 844, offsetTop: Number.NaN })?.offsetTop).toBe(0)
  })

  it('treats sub-pixel churn as no change', () => {
    const before = readSearchViewport({ height: 743.6, offsetTop: 0.2 })
    const after = readSearchViewport({ height: 743.8, offsetTop: 0.4 })
    expect(searchViewportEquals(before, after)).toBe(true)

    expect(searchViewportEquals(before, readSearchViewport({ height: 508, offsetTop: 0 }))).toBe(false)
    expect(searchViewportEquals(before, null)).toBe(false)
    expect(searchViewportEquals(null, null)).toBe(true)
  })

  it('publishes the measurement as custom properties, and nothing at all when unmeasured', () => {
    expect(searchViewportStyle({ height: 508, offsetTop: 62 })).toEqual({
      [SEARCH_VIEWPORT_HEIGHT_VAR]: '508px',
      [SEARCH_VIEWPORT_TOP_VAR]: '62px',
    })
    // No variables → the mobile rule's `var(…, 100dvh)` fallback stands, and the desktop card is
    // untouched either way.
    expect(searchViewportStyle(null)).toEqual({})
  })
})
