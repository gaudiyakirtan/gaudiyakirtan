# Screen — Navigation

**Spec version:** 3

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
- The `BrandWordmark` follows the menu slot with **4 px** separation and is optically centered on
  the same axis. It takes the flexible middle region without changing the right action cluster.
- Reader options and Search form a right-aligned cluster with **4 px** between their control slots.
  When reader options are absent, Search stays in the final slot; no placeholder gap is rendered.

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

**Visual:** the footer row has **no frame** — draw one. The rest verifies against the `Navigation*`
and `Sidebar` frames.

## Change log

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
