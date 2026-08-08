# Shared components

**Spec version:** 5

**Figma frames:** `Components`, `Group 15/16`, `Frame *`.

Contracts for components reused across screens. The rule these exist to enforce: **a song row looks
the same everywhere.** A screen decides *which* songs and in *what order*; it does not invent its
own row markup.

## `SongListItem`

The canonical song row: title in the reader's `listLanguage`, uid chip, author name, audio
indicator. Used by every song list — [`songs-list`](songs-list.md), [`home`](home.md),
[`browse`](browse.md).

| Prop | Type | Description |
|------|------|-------------|
| `song` | `ISongListing` | The row's data. |
| `onClick` | `() => void` | Navigation is the caller's job; the row does not embed a link. |
| `surface` | `'default' \| 'offset'` | Which background the row sits on. |

### The `surface` prop exists because of a real bug

The default hover tint is `--background-offset`. When a row is placed **on** an offset surface —
home's month card, or `SongsSection`'s grid cards — the hover painted the same colour over itself
and was **invisible**. Pass `surface="offset"` there and the hover flips to `--background`.

Any new surface that is not the page background must pass `offset`, or its rows will silently lose
their hover state.

## `SongsSection`

Heading + optional "View All" link + a list or 2-up grid of `SongListItem`. **Returns `null` for an
empty list**, which is how callers get "hide when empty" for free — relied on by home's
Recently-played region.

Grid cards are an offset surface, so the section passes `surface="offset"` down. Do not re-add a
hover to the wrapper: the wrapper and the row then animate against each other.

## `TopicsSection` · `BooksSection` · `AuthorsSection`

Heading + cards. Each takes:

| Prop | Description |
|------|-------------|
| `limit` | Max items rendered. |
| `viewAllLink` | Optional "View All" target. |
| `singleRow` | **Opt-in.** One horizontally-scrollable row instead of the wrapping grid. |

`singleRow` is opt-in on purpose. The wrapping grid is correct on `/topics` and `/books`, where the
whole set is the point; on [`home`](home.md) it costs three rows of vertical scroll per section.
Only home passes the flag, so the index pages are unaffected.

Topics and Books each render nothing when the corpus ships no groups of that kind.

## `HeroBanner`

The half-width banner used by home's calendar region ([`home.md`](home.md) §1).

| Prop | Description |
|------|-------------|
| `title` | Overlaid, bottom-left. |
| `imageSrc` | Artwork URL to attempt. |
| `badge` | Optional pill above the title (e.g. `adhika-māsa`). |
| `subtitle` | Optional line under the title. |
| `caption` | Optional smaller line, **clamped to 2 lines** — an observance list runs long and must not crowd out the title. |

**Artwork is best-effort and the gradient is a normal path, not an error.** Most slugs have no
image, so any load failure falls back to a themed gradient; the overlay and text are designed to
stay legible against the gradient alone. Callers supply `imageSrc` themselves — home resolves month
art via `monthImageUrlFor()` (`/assets/months/<gaudiya-month>.jpg`), whose provenance and licensing
are recorded in `public/assets/months/CREDITS.md`.

## Icons

Standardized on **Lucide**, wrapped in `icons/SidebarIcons.tsx` so call sites stay stable if the
pack changes. Add a wrapper there rather than importing `lucide-react` at a call site.

Decorative imagery (the mridanga beside home's welcome heading) must be `alt=""` + `aria-hidden` —
the heading already carries the meaning, and announcing it twice is worse than not at all. Where
artwork is theme-dependent, pick by the resolved `theme` from `ThemeContext`, and only in a
component that already renders client-side — otherwise the server and client disagree at hydration.

## `BrandWordmark`

The "Gaudiya Kirtan" wordmark, rendered as **live text in the brand display face** (`font-display`,
the 5th-Avenue face shipped on all three platforms) rather than the old `sri-gaudiya-kirtan.svg`
bitmap it replaces. Text over image is a deliberate trade: it inherits `currentColor` (so it follows
the Gaura/Shyam palettes with none of the `filter: invert(1)` hack the SVG needed), stays crisp at
any zoom/DPI, costs no request beyond the font a heading already loads, and is selectable and
translatable.

On hover each letter lifts in a staggered spring and warms to `--highlight`. The letters are split
**only** for that animation, so the visible glyphs are `aria-hidden` and the accessible name comes
from a single `aria-label` on the wrapper — otherwise assistive tech announces the mark one letter
at a time. A reader who prefers reduced motion (`useReducedMotion`) still gets the colour shift, just
not the per-letter spring.

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Size / colour utilities for the mark (e.g. `text-lg`). |
| `opticalCenter` | `boolean` | Opt-in: center the mark on its **cap-height band** instead of its em box. |

`opticalCenter` exists because the display face's descender space is not visual weight: centered on
its em box, the mark reads 0.124 em high of anything sized beside it. It is opt-in and only
meaningful where a **centering** parent gives the mark a fixed-height slot — today the mobile top bar
([`navigation.md`](navigation.md)), which aligns it against 40 px control slots. The sidebar and 404
marks sit in their own space with nothing to align to and stay em-box centered.

**The face's ink does not fit inside the mark's box, in either axis**, so *any* clipping ancestor
must be given room on all four edges:

- Vertically, ascenders reach 0.761 em and the `y` descender 0.249 em against the face's
  0.754 / 0.246 em ascent / descent, so a clip box the height of the text's line box shaves the
  ascender tops and the tail.
- Horizontally, **every glyph in the face has a negative left side bearing** (`G` −0.042 em, `y`
  −0.102 em): the ink begins *left of the text origin*. A clip box whose left edge sits on the origin
  cuts the first letter's outer curve into a flat vertical edge — small in absolute terms, and
  unmistakable on a capital.

Clipping the mark **to a width** is fine and is how the mobile bar truncates; clipping it to its own
box is not. Give the clipping ancestor height and a left inset, and let it trim only the far edge.

Used by the sidebar brand ([`navigation.md`](navigation.md)); the mridanga music logo that used to
sit beside it was removed. iOS and Android ship the same display face (iOS `BrandFont.swift`,
Android `res/font/`) so the wordmark reads identically across platforms. It is also the brand on the
[404 page](url-resolution.md).

## Verification

- A song row renders identically on every screen that shows songs.
- The `BrandWordmark` follows the theme colour (no invert hack) and exposes one accessible name, not
  one per letter.
- No glyph of the wordmark is shaved by a clipping ancestor — including the first letter's left
  overhang, whose outer curve must read as a curve and not as a straight edge at the clip boundary.
  With `opticalCenter`, its cap-height band — not its em box — centers on the slot it is aligned in.
- Rows on an offset surface show a visible hover.
- `SongsSection` renders nothing for an empty list.
- `singleRow` affects home only; `/topics` and `/books` keep their grids.
- A `HeroBanner` with an unreachable `imageSrc` still renders legibly.

## Change log

- **v5** — Added the **detail-screen app bar** contract (`GaudiyaTopAppBar` on Android). Five screens
  had each hand-rolled the same back-arrow + title `Row`, so none of them got the platform app bar's
  title truncation, standard navigation-icon touch target, insets, height or typography. It is one
  component with a `title`, an optional `onBackClick`, and a trailing `actions` slot; its container
  is the screen `background` so the bar reads as part of the screen rather than a floating strip.
  Android's song screen is the deliberate exception — its header carries a player pill rather than a
  title, so it stays a bespoke composition.
- **v4** — `BrandWordmark`: the ink overflows the mark's box **horizontally** too — every glyph has a
  negative left side bearing — so a clipping ancestor needs a left inset as well as height.
- **v3** — `BrandWordmark`: documented that the display face's ink overflows its em box (so a
  clipping ancestor must be taller than the text) and added the opt-in `opticalCenter` prop that
  centers the mark on its cap-height band.
- **v2** — Added `BrandWordmark`: the live-text wordmark in the brand display face that replaces the
  `sri-gaudiya-kirtan.svg` logo, with a per-letter hover spring behind a single accessible name.
- **v1** — Initial spec: `SongListItem.surface` (and the invisible-hover bug it fixes),
  `SongsSection` empty-list contract, opt-in `singleRow`, `HeroBanner`, icon and decorative-image
  rules.
