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
- The `BrandWordmark` follows the menu slot with **4 px** separation and takes the flexible middle
  region without changing the right action cluster. Its box has its own rules — below.
- Reader options and Search form a right-aligned cluster with **4 px** between their control slots.
  When reader options are absent, Search stays in the final slot; no placeholder gap is rendered.

#### The wordmark's box

The mark is live text in the 5th Avenue display face ([`typography.md`](../theme/typography.md)),
whose **ink is taller than its em box**: ascenders reach 0.761 em and the `y` descender 0.249 em,
against the face's 0.754 / 0.246 em ascent / descent. Two consequences the bar must honour:

- Its link is a **40 px** slot — the same height as a control slot, on the same axis — not a box the
  height of the text's line box. The middle region truncates **horizontally only**; a clip box the
  height of the em box shaves the ascender tops and the `y` tail. (The bar is a composited layer
  while it animates, so that overflow is rasterized against the clip box's device pixels and the
  shaving is visible on real hardware, worst on iOS Safari.) The 40 px slot also gives the brand
  link a real touch target.
- The mark is **optically centered on its cap-height band** — baseline → cap top shares the control
  axis — not centered on its em box. Em-box centering counts the descender space as visual weight
  and the mark reads **0.124 em high** of the icons beside it. For this face the correction is a
  0.248 em top pad on a centered mark (cap height 0.756 em; em-box centering puts the baseline
  0.254 em below the axis, cap-band centering wants 0.378 em).

Both rules are **mobile-only**: the sidebar and 404 wordmarks sit in their own space with nothing
clipping them and no fixed-size control to align against, and are unchanged.

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

## States

| State | Behavior |
|-------|----------|
| **Collapsed (desktop)** | Sidebar slides fully off-canvas; toggle restores it. Persisted. |
| **Drawer open (mobile)** | Scrim closes on tap; any nav tap closes it. |
| **Active route** | Highlighted, including nested routes (`/songs/K1` highlights Songs). |

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
  box — ascender tops through the `y` tail — sits inside its link's clip box on both edges, with the
  reader-options control present and absent.
- The mark's cap-height band centers on the same axis as the 40 px control slots.
- Downward travel beyond the threshold hides the bar; small reverse jitter does not reveal it;
  upward travel beyond the threshold does. Returning to the top and route navigation reveal it.
- At 768 px and wider, the desktop layout and scroll behavior are unchanged.

**Visual:** the footer row has **no frame** — draw one. The rest verifies against the `Navigation*`
and `Sidebar` frames.

## Change log

- **v3 (web)** — Specified the mobile wordmark's box: a 40 px link slot that truncates horizontally
  only (v2's text-height clip box shaved the display face's ascenders and `y` tail), and optical
  centering on the cap-height band rather than the em box. Mobile-only; desktop unchanged.
- **v2 (web)** — Normalized the mobile top bar to symmetric 40 px control slots and documented its
  mobile-only direction-aware hide-on-down/reveal-on-up behavior, including thresholds, route/top
  resets, reduced motion, and the desktop non-regression contract.
- **v1** — Initial spec. Footer collapsed from four stacked full-width items to one horizontal row
  (icon-only Settings/About/Contact + labelled theme toggle); Collections group deferred pending
  auth + accounts.
