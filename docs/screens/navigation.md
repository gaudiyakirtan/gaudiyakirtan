# Screen — Navigation

**Spec version:** 6

**Figma frames:** `Navigation`, `Navigation-1..5`, `Sidebar`, `Header`, `mobile-menu`, `Mobile`.
The **sidebar footer** below post-dates these frames — verify the rest against them, not the footer.

## Purpose

How a reader moves through the app: a collapsible sidebar on web, a tab bar on mobile.

## Web — sidebar structure

| Region | Contents |
|--------|----------|
| Brand | `BrandWordmark` (live text, brand display face — [`components.md`](components.md)), linking home. Desktop collapse toggle. |
| Search | Opens the centered command palette (⌘K). See [`search.md`](search.md). |
| — | **Home** |
| **Library** | Songs · Tracks · Authors · Topics · Books |
| **Resources** | Verse Meters · Diacritic Guide · Pronunciation |
| **Footer** | One horizontal row — see below. |

### Hold-to-reveal keyboard shortcuts

Keyboard shortcut labels are contextual, not permanent chrome. With no modifier held, the layout
looks exactly as it does for a pointer-only reader. Holding either **Command** (`Meta`) or
**Control** reveals small keycaps beside the controls that have keyboard equivalents; releasing it
hides them again. The keycap names the modifier that is physically held (`⌘ K` or `Ctrl K`) rather
than guessing from the user agent.

The global shortcut set currently contains one action:

| Control | Shortcut | Scope |
|---------|----------|-------|
| Search (desktop sidebar and mobile top bar) | `⌘/Control + K` | Anywhere in the web app |

- A modifier press by itself performs no action, moves no focus, and prevents no browser behavior.
- A revealed keycap is positioned inside or beside its control without changing that control's
  size or moving adjacent content. It is visual help only (`aria-hidden`); the actionable control
  exposes the equivalent through `aria-keyshortcuts`.
- Modifier state is cleared on key-up, window blur, and document visibility loss. A system shortcut
  that takes focus away must never leave stale labels painted over the app.
- Context-specific keys inside an open surface are revealed there, at the controls they affect;
  Search owns `Escape`, arrow-key, and `Enter` hints in [`search.md`](search.md).

### Footer row

A single horizontal row, not a stack:

```
[⚙ Settings]  [ⓘ About]  [✉ Contact]              [☀ Gaura]
```

- **Settings, About, Contact** are **icon-only**. Each carries an `aria-label` *and* a `title`, so
  the control is announced to screen readers and discoverable on hover. An icon-only control with
  neither is unusable, not merely terse.
- **The theme toggle is the only labelled control**, pushed right. This is deliberate and should
  not be "made consistent" by stripping the label: a sun/moon glyph does not tell you *which* theme
  you would get, whereas the other three are self-evident destinations. It is labelled by the theme
  it switches **to** (Gaura / Shyam) and previews that theme's surface colours on hover.

Icons come from **Lucide**, wrapped in `icons/SidebarIcons.tsx` so call sites stay stable.

### Collections — deferred

The sidebar previously carried a **Collections** group. It is **commented out**, not deleted.

A Collection is a curated, user-facing set ([`collections.md`](../data/collections.md)) — meaningful
only once a reader can own one, which requires **auth and accounts**. Until then the corpus ships no
`collection`-kind groups and the group rendered a permanent "No collections yet".

Restore the block together with its `getSongGroups` / `pickScriptText` imports and the `collections`
binding when accounts land. The data layer is untouched: `getSongGroups('collection')` still returns
`[]` and is still asserted by a test, so the contract is intact — only the nav surface is hidden.

## Mobile

Tab bar; the sidebar becomes a drawer behind a scrim. Same destinations.

### Web mobile top bar

The web surface uses a **56 px sticky top bar** below the browser chrome. This bar is mobile-only;
the desktop sidebar and desktop content geometry are unchanged.

- Horizontal inset: **12 px** on both sides.
- Menu, reader-options (when present), and search each occupy the same **40 × 40 px** centered
  control slot. Icons may have different intrinsic drawings, but their slot centers share one
  vertical axis and the first/last slot centers are symmetric within the bar.
- The `BrandWordmark` follows the menu slot with **4 px** separation and takes the flexible middle
  region without changing the right action cluster. Its box has its own rules — below.
- Reader options and Search form a right-aligned cluster with **4 px** between their control slots.
  When reader options are absent, Search stays in the final slot; no placeholder gap is rendered.

#### The wordmark's box

The mark is live text in the 5th Avenue display face ([`typography.md`](../theme/typography.md)), and
**its ink does not fit inside its own box** — in either axis. Ascenders reach 0.761 em and the `y`
descender 0.249 em against the face's 0.754 / 0.246 em ascent / descent, and *every* glyph in the
face carries a **negative left side bearing** (`G` at −0.042 em), so the first letter's ink begins
left of the text origin. Three consequences the bar must honour:

- Its link is a **40 px** slot — the same height as a control slot, on the same axis — not a box the
  height of the text's line box. The middle region truncates **horizontally only**; a clip box the
  height of the em box shaves the ascender tops and the `y` tail. (The bar is a composited layer
  while it animates, so that overflow is rasterized against the clip box's device pixels and the
  shaving is visible on real hardware, worst on iOS Safari.) The 40 px slot also gives the brand
  link a real touch target.
- **The clip box's left edge sits left of the text origin.** The 4 px that separate the mark from
  the menu slot are the link's own **padding**, not a margin, so the clip window opens at the menu
  slot's edge while the text still starts 4 px later. A clip box that begins *at* the origin cuts
  the `G`'s bowl into a flat vertical edge — 0.042 em of it, the full height of the bowl's outer
  curve. Margin would put the clip edge back on the origin and bring the shave back.
- The mark is **optically centered on its cap-height band** — baseline → cap top shares the control
  axis — not centered on its em box. Em-box centering counts the descender space as visual weight
  and the mark reads **0.124 em high** of the icons beside it. For this face the correction is a
  0.248 em top pad on a centered mark (cap height 0.756 em; em-box centering puts the baseline
  0.254 em below the axis, cap-band centering wants 0.378 em).

All three rules are **mobile-only**: the sidebar and 404 wordmarks sit in their own space with
nothing clipping them and no fixed-size control to align against, and are unchanged.

The **4 px separation** above is measured to the mark's text origin, which is where the reader's eye
reads the left edge of the bar's text column — not to the link box, which now starts earlier because
it carries the gap as padding.

The bar is **direction-aware while scrolling on mobile**:

1. It is always visible at the top of the document and after route navigation.
2. Once the reader is beyond the bar, at least **12 px of accumulated downward travel** hides it by
   translating the complete bar above the viewport. Its sticky layout space remains, preventing a
   content jump.
3. At least **8 px of accumulated upward travel** reveals it. Direction changes reset the
   accumulator, and sub-pixel/jitter deltas do not toggle the bar.
4. Opening the menu or search first reveals the bar. The movement uses a short transform-only
   transition; `prefers-reduced-motion` removes the transition, not the behavior.
5. The behavior is gated by the same `<768 px` breakpoint as `md:hidden`; resizing to desktop resets
   the hidden state. Desktop receives no new header, spacing, scroll listener behavior, or offset.

## Layer order (web)

Every fixed or sticky surface draws from **one ordered scale**, declared once (web:
`utils/layers.ts`) and applied as an explicit `z-index`. No surface picks its own number, and a new
overlay joins the scale rather than out-bidding it.

| Rank | Layer | Surface |
|------|-------|---------|
| 10 | Content | Fixed in-page affordances floating over the reader (the alphabet rail). A menu inside a card or the header is scoped to that surface's own stacking context and never escapes it. |
| 20 | Mobile header | The 56 px sticky top bar. |
| 30 | Sidebar toggle | The floating "Open sidebar" button, shown while the desktop sidebar is collapsed. |
| 40 | Player | The [mini-player](player.md) widget and its drop-ups — page furniture: above content, below overlays. |
| 50 | Navigation scrim | The mobile drawer's dim backdrop. |
| 60 | Navigation drawer | The sidebar itself. |
| 70 | Search | The command palette — the top-level modal ([`search.md`](search.md)). |

Two relationships carry the model, and both are the point of the scale:

- **The scrim outranks the player.** Opening navigation puts the *whole current screen* behind the
  dim — the mini-player included, in **every** player state: expanded card, collapsed circle, armed
  idle FAB, the "Play this" strip, and an open drop-up. A mini-player left lit above the backdrop
  read as a control that was still live while the reader was plainly somewhere else.
- **The drawer outranks the scrim,** so the drawer itself is never dimmed.

## States

| State | Behavior |
|-------|----------|
| **Collapsed (desktop)** | Sidebar slides fully off-canvas; toggle restores it. Persisted. |
| **Drawer open (mobile)** | Scrim closes on tap; any nav tap closes it. The page behind it — content, header, mini-player — is dimmed and inert (below). |
| **Active route** | Highlighted, including nested routes (`/songs/K1` highlights Songs). |

### Drawer open (mobile) — the page behind it

- The scrim covers the viewport and **takes the pointer**: a tap anywhere on it closes the drawer,
  and nothing beneath it can be clicked through.
- The page behind it is also **inert** — the content column and the player widget both — so keyboard
  focus and assistive technology cannot reach it either. A scrim alone stops only the pointer.
- **An open player drop-up (recordings, sleep timer) closes** when the drawer opens. A transient
  menu is dismissed by attention moving elsewhere — tapping outside it already dismisses it, and
  activating the menu button from the keyboard should not behave differently. Parking one under the
  dim to reappear on close is the surprising option.
- **Nothing else about the player changes.** Position, playback, collapse/expand state, scrubber,
  sleep timer and armed song all survive the drawer untouched; closing it restores interaction
  exactly as it was.
- The drawer is a **mobile** surface. Its scrim is `md:hidden`, so crossing to the desktop
  breakpoint **closes** it rather than stranding an invisible modal over a fully interactive
  desktop layout.
- **Desktop is unaffected**: no scrim, nothing inert, and the ranks above are the order desktop
  already drew in — the sidebar and the bottom-right mini-player never overlap at any width ≥768 px.

## Per-platform notes

**Web.** `Sidebar.tsx` is client-rendered, so it imports leaf modules **directly** rather than the
`../services` barrel — the barrel re-exports `fs`-backed repositories that must never enter the
client bundle.

**iOS / Android.** Tab bar. About/Contact are not built there yet; when added they belong wherever
Settings lives, not in the main tab set.

## Verification

**Behavioral:**
- Every footer control has an accessible name; the three icon-only ones render no visible label and
  the theme toggle does.
- No Collections group appears while the corpus ships no `collection`-kind data.
- Active-route highlighting covers nested routes.
- At a 390 px viewport, the mobile menu/search control slots are symmetric, all visible control
  slots share a vertical center, and the optional reader-options slot does not displace Search.
- At a 390 px viewport the full "Gaudiya Kirtan" string renders with no glyph shaved: the mark's ink
  box — ascender tops, the `y` tail, and the `G`'s left overhang — sits inside its link's clip box on
  every edge, with the reader-options control present and absent. The `G`'s outer bowl is a curve at
  the pixel level, not a straight vertical edge at the clip boundary.
- The mark's cap-height band centers on the same axis as the 40 px control slots.
- Downward travel beyond the threshold hides the bar; small reverse jitter does not reveal it;
  upward travel beyond the threshold does. Returning to the top and route navigation reveal it.
- At 768 px and wider, the desktop layout and scroll behavior are unchanged.
- The layer ranks are strictly ordered and unique, so the ordering above is asserted, not implied by
  source order.
- With a recording loaded at 390 px, opening the menu paints the drawer above the scrim and the
  mini-player below it, in each player state; the mini-player accepts no pointer or keyboard
  interaction while the drawer is open, and the drawer itself is undimmed.
- An open player drop-up is closed by opening the drawer, including keyboard activation of the menu
  button.
- Tapping the scrim closes the drawer and returns the player to exactly the state it had — same
  position, same playback, same collapse state, interactive again.
- Search opens above the drawer; crossing to the desktop breakpoint closes the drawer.
- With no modifier held, no shortcut keycap is visible. Holding Command or Control reveals the
  Search chord at both Search affordances without reflow; release, blur, and visibility loss hide it.
- Search controls expose `aria-keyshortcuts="Meta+K Control+K"`; visual hints remain hidden from the
  accessibility tree so the shortcut is not announced twice.

**Visual:** the footer row has **no frame** — draw one. The rest verifies against the `Navigation*`
and `Sidebar` frames.

## Change log

- **v6 (web)** — Added contextual, hold-to-reveal keyboard shortcut hints. Command or Control
  reveals the global Search chord at its actual controls without layout shift; release, blur, and
  visibility loss clear it. Visual keycaps are decorative while `aria-keyshortcuts` carries the
  machine-readable contract. Search-local hints live in `search.md` v11.
- **v5 (web)** — The mobile clip box must also open **left of the text origin**: the face's negative
  left side bearing put the `G`'s bowl outside a clip box that began at the origin, shaving it flat.
  The 4 px menu-to-mark gap becomes the link's padding rather than its margin, and is specified
  against the mark's text origin.
- **v4 (web)** — Specified the mobile wordmark's box: a 40 px link slot that truncates horizontally
  only (v2's text-height clip box shaved the display face's ascenders and `y` tail), and optical
  centering on the cap-height band rather than the em box. Mobile-only; desktop unchanged.
- **v3 (web)** — Defined the **layer order** as one shared, ordered scale instead of per-component
  z-indices, and fixed the relationship it had wrong: the mini-player outranked the mobile drawer's
  scrim, so a loaded player floated lit above the dim while the menu was open. The scrim now covers
  the whole screen including every player state, the drawer stays undimmed above it, and the page
  behind is inert (not merely pointer-blocked). Open player drop-ups close with the drawer opening,
  and crossing to the desktop breakpoint closes the drawer.
- **v2 (web)** — Normalized the mobile top bar to symmetric 40 px control slots and documented its
  mobile-only direction-aware hide-on-down/reveal-on-up behavior, including thresholds, route/top
  resets, reduced motion, and the desktop non-regression contract.
- **v1** — Initial spec. Footer collapsed from four stacked full-width items to one horizontal row
  (icon-only Settings/About/Contact + labelled theme toggle); Collections group deferred pending
  auth + accounts.
