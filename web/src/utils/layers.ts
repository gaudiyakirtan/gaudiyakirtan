/**
 * The app's z-index contract — one ordered scale for every fixed/sticky surface
 * (docs/screens/navigation.md §"Layer order (web)").
 *
 * These are applied as an explicit `zIndex` style rather than a `z-*` utility so the scale lives in
 * exactly one file: a surface joins the order here instead of out-bidding its neighbours with a
 * larger number at the call site, which is how the mini-player ended up floating above the mobile
 * navigation scrim.
 *
 * Ranks are spaced by 10 so a new surface can slot between two existing ones without renumbering.
 * In-page affordances that float over the reader (the alphabet rail, in-card dropdowns) stay on the
 * `content` rank or below — they are part of the page, so an overlay must cover them too.
 */
export const LAYER = {
  /** In-page affordances floating over the reader. */
  content: 10,
  /** The mobile-only 56 px sticky top bar. */
  mobileHeader: 20,
  /** Floating "Open sidebar" button, shown while the desktop sidebar is collapsed. */
  sidebarToggle: 30,
  /** The mini-player widget and its drop-ups: above content, below overlays. */
  player: 40,
  /** The mobile drawer's dim backdrop — it must cover the player, in every player state. */
  navigationScrim: 50,
  /** The sidebar/drawer itself, so it is never dimmed by its own scrim. */
  navigationDrawer: 60,
  /** The search command palette — the top-level modal. */
  searchModal: 70,
} as const

export type LayerName = keyof typeof LAYER

/**
 * The ranks in the order they are meant to paint, bottom to top. Declaration order in `LAYER` is
 * already this order; naming it separately gives the ordering something to be asserted against.
 */
export const LAYER_ORDER: readonly LayerName[] = [
  'content',
  'mobileHeader',
  'sidebarToggle',
  'player',
  'navigationScrim',
  'navigationDrawer',
  'searchModal',
]
