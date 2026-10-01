# Shared components

**Spec version:** 9

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
| `href` / native destination | Platform navigation target | Caller supplies the existing song route; Web renders a real anchor, native a navigation control. |
| `onClick` | `() => void` | Optional caller side effect/native callback; never the only Web navigation mechanism. |
| `surface` | `'default' \| 'offset'` | Owning base surface; retained for compatibility, not a hover color. |

The same anatomy applies on Home: title + existing row UID chip, then author/audio availability.
Do not introduce `SeasonalSongRow`, move the UID into a new metadata layout, or impose a Home-only
72-unit row. Use a 56-unit minimum, content-driven height and `small` shape. Titles may wrap to two
lines at default size and fully at accessibility sizes; the UID wraps with its title group if
needed. Keep full accessible titles. Title is `primary` (Android `onSurface`), author `secondary`.

### Home links and interaction states

These shared semantics apply to Home's canonical rows, browse cards and action controls. A Web
destination is an anchor with its real URL (including modified-click/open-in-new-tab behavior),
an action is a button, and native controls carry the equivalent roles. The song destination and
recording button are siblings, never nested. Minimum targets: 44 × 44 CSS px/pt, 48 × 48 Android dp.

Paint a `primary` state layer **over the owning surface**: hover 8%, focus 10%, pressed 10%; choose
one interaction layer, do not add them together. Current selection has an 8% `highlight` base tint
plus a persistent marker and accessible state; tint alone is insufficient. Text stays readable.
This supersedes the old background/offset hover swap, whose offset-on-offset paint was invisible.
Do not add a competing wrapper hover. Focus is an immediate 2-unit `highlight` outline separated
by 2 units of the parent surface, outside the target and unclipped; forced colors use system roles.

Rows/cards stay flat and fixed in place: no hover scale, lift, pulse, animated radius or
`transition-all`. Use [theme utility motion](theme.md#utility-motion-tokens). Missing optional actions
are omitted; a temporarily disabled existing action retains its label, disabled semantics and
reason. No recording does not disable song navigation.

## `SongsSection`

Heading + optional "View All" link + a list or 2-up grid of `SongListItem`. **Returns `null` for an
empty list**, which is how callers get "hide when empty" for free — relied on by home's
Recently-played region.

Grid cards are an offset surface, so the section passes `surface="offset"` down. State layers
belong to the row only, not both row and wrapper.

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

Home v7 uses compact editorial rails and lists while retaining the complete destination screens.
The reusable shelf components remain available to non-Home consumers.

## `HeroBanner`

Legacy overlaid-art banner, retained for existing non-Home consumers. Home v7 uses compact text
season context instead; its full-text contract overrides this component's clamped caption and
best-effort photograph behavior. Do not retrofit other consumers in the Home slice.

| Prop | Description |
|------|-------------|
| `title` | Overlaid, bottom-left. |
| `imageSrc` | Artwork URL to attempt. |
| `badge` | Optional pill above the title (e.g. `adhika-māsa`). |
| `subtitle` | Optional line under the title. |
| `caption` | Optional smaller line, **clamped to 2 lines** — an observance list runs long and must not crowd out the title. |

**Artwork is best-effort and the gradient is a normal path, not an error.** Most slugs have no
image, so any load failure falls back to a themed gradient; the overlay and text are designed to
stay legible against the gradient alone. Callers supply `imageSrc` themselves. Before v5, Home
resolved month art via `monthImageUrlFor()` (`/assets/months/<gaudiya-month>.jpg`); provenance and
licensing remain recorded in `public/assets/months/CREDITS.md`.

## Home composition

`MonthContext` takes resolved lunar/Gaudiya names, intercalary state and observances; v7 renders
them as a compact context strip without a dial or separate focal card. `MonthSongs` takes ordered
listings, optional existing recording actions and an empty-state message. It reuses `SongListItem`;
the container is not interactive. Titles, order, caps, layout and availability are owned by
[Home v7](home.md). There is no native picker implementation requirement.

## RhythmArtwork (retired from Home)

Home v7 replaces the old standalone artwork with one clipped rhythm field inside the featured-song
surface. It uses repeated vertical beats crossed by one restrained arc. It never represents
calendar progress, playback progress, a named tāla, or sacred imagery.

Use one static vector master, identical across platforms; no random variants, image request,
calendar-precision claim or audio-state dependency. Use a 360 × 240 coordinate space with round
caps:

- Curve A: `M24 76 C116 12 240 16 338 90`, stroke 28, `accent` at 18%.
- Curve B: `M12 112 C124 48 252 64 356 140`, stroke 18, `primary` at 8%.
- Six vertical rounded marks: x = 48, 76, 112, 168, 196, 252; y = 180; width 8, height 24,
  radius 4; `accent` at 55%. Equal heights and varied spacing suggest phrasing without an equalizer.

Scale uniformly to the feature surface. Curves are broad open strokes, not rings, spinners, named
tāla notation, sacred diagrams or figurative illustration. Keep art behind and clear of text and
controls, clip it to the feature bounds, and exclude it from accessibility/hit testing. SVG,
SwiftUI Path and Compose Canvas reproduce these coordinates; art is available offline and stays
static at rest.

## Home recording picker

Where already supported (Web), keep the existing avatar/count trigger and all takes. Accessible
name: “Choose recording of [full title], [count] recordings”; expose expanded state and controlled
panel. Decorative avatars are silent. Performer/take labels use existing disambiguation and fallback
rules. No new native picker, sheet, global layer rank, player control or audio session is introduced.

The Web picker remains a non-modal anchored panel at **all widths**, with a labelled list of take
buttons, current marker and actual play/pause/loading glyph. Width `min(320, available Home width)`,
`large` radius, `background`, 1-unit `border`, no shadow, padding `md`. Constrain it within unobscured content,
flip above the trigger when needed, and cap take-list height at `min(256, free vertical space)`.
Scroll its anchor into view if necessary to expose at least one full take target. Keep it in the
existing content layer, below header/player/navigation/search; do not escape those stacking
contexts or clip it at the seasonal card. Modal focus trapping would be incorrect here.

| Picker event | Result / focus |
|---|---|
| Open | Close another Home picker; focus current take, else first. |
| Choose take | Delegate to existing player, close, return focus to trigger. |
| Escape / trigger toggle | Close; focus trigger. |
| Outside pointer | Close; allow clicked destination to receive focus. |
| Tab beyond panel | Close; continue normal focus order without trapping/restoring. |
| Another trigger | Close A, open B; focus B's current/first take. |
| Route change / parent overlay opens | Close; route/overlay owns focus. |

Picker visibility is independent of playback. A song's selected marker requires matching player
song UID; take status requires **both** song and take UID. Nonmatching takes are idle. Reflect the
existing player's `idle/loading/playing/paused/error`, including loading→paused on blocked autoplay
and playing→loading on buffering; a click or media-ready event alone does not mean playing. On
track end, close or queue advance, reflect whatever the player reports rather than inventing an
idle/paused transition. The Home picker never owns Retry or playback announcements. Loading-glyph
delay and motion are specified by Home/theme; no duplicate live region or progress announcements.

## Uid chip

The song code (`A8`, `NK31`, `PT13`) always renders as a **neutral chip** — a `--neutral` tint of the
surface, uppercase, never bare or accent-colored. It stays quiet; density changes by surface:

| Variant | Where | Shape / weight |
|---|---|---|
| **Row** | [`SongListItem`](songs-list.md), `TrackListItem`, `SongCard` | `--neutral`/20 fill, **`secondary` text**, `rounded-xl` (`rounded-lg` on the smaller card), 9–10 px base, medium; scales with text |
| **Detail** | [song-detail](song-detail.md)'s title block, the [player](player.md)'s open-song action | `--neutral`/25, **fully rounded**, 10–11 px, semibold |

v7 corrects row-chip text contrast without a new shape: `secondary` on neutral/20 over offset is
7.31:1 Gaura / 5.86:1 Shyam. `neutral` or `tertiary` text on that tinted fill fails 4.5:1 in at least
one palette. The existing detail variant's neutral text and player behavior are unchanged.

The detail variant is the one that can be **actionable**. On the player's open-song action the chip
is the link itself and carries an `ArrowUpRight` inside it after the code — the pill says *which*
song and the arrow says *opens it*. When a chip is actionable it must: raise its own tint on hover
(not only the text colour), take the focus ring on the whole chip, and keep the code `aria-hidden`
when the control already has an `aria-label` naming the song — otherwise the code is announced a
second time as loose letters.

A chip is never the expressive focal element of a screen. It has no motion of its own; any motion
belongs to what it contains (the player's arrow animates inside a clipped viewport while the chip
stays still).

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
- Every rendering of a song code is a neutral chip in one of the two documented variants; an
  actionable one lights its own background on hover and rings the whole chip on focus.
- The `BrandWordmark` follows the theme colour (no invert hack) and exposes one accessible name, not
  one per letter.
- No glyph of the wordmark is shaved by a clipping ancestor — including the first letter's left
  overhang, whose outer curve must read as a curve and not as a straight edge at the clip boundary.
  With `opticalCenter`, its cap-height band — not its em box — centers on the slot it is aligned in.
- Rows on an offset surface show a visible hover.
- `SongsSection` renders nothing for an empty list.
- `singleRow` affects home only; `/topics` and `/books` keep their grids.
- A `HeroBanner` with an unreachable `imageSrc` still renders legibly.
- Home rows/cards have native navigation semantics, visible state layers on both surfaces, and
  separate recording actions; focus is never clipped or trapped by the non-modal picker.
- Home uses the static MonthContext dial rather than RhythmArtwork or the legacy photograph banner.

## Change log

- **v9** — Home v7 removes the month dial and dashboard card composition, restores a compact
  rhythm field inside one featured-song surface, and defines explicit reading/playback actions.
- **v8** — Home v6 retires RhythmArtwork from Home and introduces composition-level Listen, Season,
  Seasonal songs, Books, Recently opened, Authors and Topics modules. Modules use their own data-led
  visual treatment rather than a shared card template.
- **v7** — Home v5 shared contracts: semantic row/card destinations, readable row UID text,
  surface-aware state layers, scalable canonical rows, accessible shelves, MonthContext/MonthSongs,
  static RhythmArtwork and existing Home picker semantics. Retains UID geometry and player/detail
  behavior; the legacy HeroBanner is no longer Home's art contract.
- **v6** — Added the **uid chip** contract. The song code was being re-styled per call site (four
  variants across the row, the card, song-detail and the player), so making the player's open-song
  action a uid pill had no rule to conform to. Two variants only — row and detail — plus the
  actionable-chip requirements (hover tint on the chip, focus ring on the chip, `aria-hidden` code
  under a labelled control) that [player.md](player.md) v14 is the first to exercise.
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
