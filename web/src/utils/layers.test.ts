import { describe, expect, it } from 'vitest'
import { LAYER, LAYER_ORDER, type LayerName } from './layers'

// The layer scale is the whole point of the contract, so the relationships it encodes are asserted
// rather than left to source order (docs/screens/navigation.md v3). A regression here is exactly the
// bug this replaced: a surface quietly out-ranking the overlay that is supposed to cover it.
describe('layer scale', () => {
  it('lists every layer exactly once, in strictly increasing rank order', () => {
    expect([...LAYER_ORDER].sort()).toEqual((Object.keys(LAYER) as LayerName[]).sort())
    const ranks = LAYER_ORDER.map((name) => LAYER[name])
    expect(new Set(ranks).size).toBe(ranks.length)
    for (let i = 1; i < ranks.length; i += 1) {
      expect(ranks[i]).toBeGreaterThan(ranks[i - 1])
    }
  })

  it('keeps the player above the page it floats over', () => {
    expect(LAYER.player).toBeGreaterThan(LAYER.mobileHeader)
    expect(LAYER.player).toBeGreaterThan(LAYER.sidebarToggle)
    expect(LAYER.player).toBeGreaterThan(LAYER.content)
  })

  it('puts the navigation scrim over the player and the drawer over the scrim', () => {
    // Opening the menu dims the whole screen INCLUDING the mini-player...
    expect(LAYER.navigationScrim).toBeGreaterThan(LAYER.player)
    // ...while the drawer stays above its own backdrop, undimmed.
    expect(LAYER.navigationDrawer).toBeGreaterThan(LAYER.navigationScrim)
  })

  it('keeps search as the top-level modal', () => {
    for (const name of LAYER_ORDER) {
      if (name === 'searchModal') continue
      expect(LAYER.searchModal).toBeGreaterThan(LAYER[name])
    }
  })
})
