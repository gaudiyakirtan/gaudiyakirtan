# Screen — Home

**Spec version:** 5

**Status:** SPEC only; Web, iOS and Android are stale against v5. This contract supersedes the old
`Home*` Figma frames and the alternatives in `.agent-inputs/`. Those inputs are references, not
implementation requirements. No current capture establishes v5 conformance.

## Purpose and scope

Home answers **“What do I sing, read, or hear now?”** It is the functional application landing
screen on all three platforms. Visual parity means shared hierarchy, surfaces, type roles, artwork
and interaction feedback over **each platform's existing features**.

| Decision | Contract |
|---|---|
| Primary action | Open a song; choosing a recording is a separate action where supported. |
| Layout | Adaptive feed with a supporting month-context pane at expanded widths. |
| Navigation | Existing Web sidebar/drawer and search; existing native tabs, Search and Settings. |
| Hierarchy | Seasonal repertoire; recents/native Songs; Topics, Books, Authors; complete native featured reading. |
| Expressive focus | Month context and adjacent repertoire form one seasonal composition. Without a calendar, the brand heading and native Songs lead; do not invent a month card. |
| Why it earns emphasis | The month explains the songs' relevance. Static art and type carry the emphasis; the global player owns playback expression. |

Blend devotional editorial identity (5th Avenue branding, real credits, warm paper/dark ink),
productivity clarity (aligned rows and independent actions), and airy composition (unequal widths,
intrinsic heights, generous gaps). No marketing hero, widget dashboard, glass, floating ornaments,
cinematic scroll, parallax or scroll-triggered reveal.

### Feature preservation

| Platform | Preserve | Absent capabilities remain absent in this slice |
|---|---|---|
| Web | Month songs (six after partition), recording picker/current-take toggle playing in place, four recent entries, Topics/Books/Authors, search shortcuts, sidebar collapse, drawer and persistent player. | Native Songs and featured verses are not added. |
| iOS | Full manifest-backed Songs grid and existing filtering, author/topic/book navigation, Search with autofocus, Settings sheet, tabs, complete featured N9 verses with reader preferences, shared playback. | Calendar, recents and Home recording picker. Lead with Songs after the brand heading. |
| Android | Uncapped resolved month list, existing four-song grid, browse sections, complete featured N9 verses, Search/Settings, tabs and shared player. | Recents and Home recording-picker wiring. Month rows keep opening song detail. |

No catalog truncation, new Show-all workflow, replacement verse quotation, fake disabled feature,
new repository or player session. Missing functional parity is a separate future slice and is
**not a prerequisite** for Home v5 visual conformance. Preserve all existing player capabilities.

## Content and order

One source/traversal order at every width; omit unavailable or empty optional regions without
substitutes. The brand heading is independent of calendar availability.

1. **Brand:** “Śrī Gaudiya Kirtan”, one page heading, Regular 5th Avenue. Existing theme-appropriate
   mridanga is decorative; gap `md`, height 36 compact/medium or 40 expanded. Let text wrap; hide
   the mark before squeezing text. No greeting line or per-letter animation in this heading.
2. **Seasonal composition** (Web/Android): two sibling cards, **MonthContext** then **MonthSongs**.
   Context: “This month” → lunar name → Gaudiya name → observances. Intercalary windows use
   **Puruṣottama** as the main name plus `adhika-māsa`; do not use the repeated ordinary lunar month
   as the main name; omit a duplicate secondary name. Text sits on a solid surface, separate from
   art. Observances wrap in full;
   no truncation, disclosure, calendar link, countdown or claim that a festival occurs today.
   The second card is headed “Sung this month” and contains canonical `SongListItem` rows.
3. **Recently played** (Web): retain the label; add “Songs you recently opened”. Keep four most
   recent valid entries and existing device-local `{ uid, lastOpenedAt }` history/persistence.
   Song-detail visits write history; choosing recordings does not. No resume/progress claims.
4. **Songs** (native): preserve selection, ordering and **every** iOS manifest entry / Android's
   four entries in a lazy grid. No popularity label or ranking.
5. **Topics**, then **Books**, then **Authors**: one horizontal shelf each at ordinary text size.
   Preserve existing selection, limits and working View all destinations. Empty sections hide
   with their headings. Counts, if shown, come from the corpus.
6. **Featured reading** (native): complete existing song/verses with script, translation and
   word-by-word preferences intact. Primary-text title, real credit and non-actionable row-variant
   UID chip; reading column capped at 680 units and centered. No display font on verse text.

### Calendar precedence and data

[`today.md`](today.md) **v2 Ranking and provenance** governs order: resolve the shipped
`song_uids` sequence through the Manifest, omit unresolved references, then concatenate playable
and non-playable subsequences **without changing order within either**. Use existing resolved
recording availability (Web's actual take map); never sort by `basis`, title, count or popularity.
Apply Web's six-row display cap **after** partitioning; Android retains all rows. `basis` is
provenance only. Titles/credits follow the reader's script and repository fallbacks.

For Home, this resolves legacy contradictions: Today v2's old verification bullet “Songs are
ordered by `basis` strength” is superseded by its v2 ranking section. Home has **no daily ārati or
upcoming-festival region**, including empty/out-of-range fallbacks, despite older Today layout/state
language. Home's placement and states here govern its embedded Today surface. The calendar's
month-level honesty constraints and boundary uncertainty remain binding.

Use existing [calendar](../data/calendar.md), [Manifest](../data/manifest.md),
[author](../data/author.md) and [collections](../data/collections.md) repositories. Resolve device-local
dates against bundled half-open windows; no UTC conversion or new lunar arithmetic. Web resolves
date/history **after mount**, importing `calendarRepository` directly rather than the `fs`-bearing
services barrel. Refresh supported calendar surfaces at local midnight and on foreground/resume or
timezone change. iOS calendar remains outside this slice.

## Responsive geometry

Units are CSS px / iOS pt / Android dp; text scales independently. **A** is available width after
persistent navigation and safe-area insets, **before** Home gutters. Select the class from A, then
center the inner frame of width `min(A − 2 × gutter, 1120)`.

| Class | A | Gutter | Seasonal layout | Recents / native Songs grid |
|---|---:|---:|---|---|
| Compact | <600 | `lg` 16 | Stacked, `lg` 16 gap | 1 column |
| Medium | 600–839 | `xl` 24 | Stacked, `xl` 24 gap | 2 columns |
| Expanded | ≥840 | `xxl` 32 | 5:7 widths after `xl` 24 gap; top-aligned, intrinsic heights | 2 / 3 columns |

Major-section gaps `xxl` 32; top/bottom padding `xl` 24; heading-to-content gap `lg` 16. Both seasonal
cards: `large` 22 radius, 1-unit `border`, `backgroundOffset`, padding `lg` 16 compact/medium or `xl`
24 expanded. No enclosing card, nested artwork border or ambient shadow. Rows use `small`; browse
cards `medium`. UID chips retain their shared shape contract.

Month context has a 160-unit **minimum**, never fixed height. Compact/medium art occupies a 96 × 64
trailing slot beside text; omit it if the card's inner width is <320. Expanded art is 240 × 160 below
text with `lg` gap. Text/art never overlap. At 390 × 844 and default text size, target the first
seasonal row visible with existing chrome/player present; full observances and enlarged text win
over this target.

Recents and each browse section occupy their **own full-width row**. No masonry or packing Topics
beside hydrated Recents. Shelf gap `md` 12. Topic cards: width 176, minimum height 112. Books: width
144 compact/medium, 160 expanded, 3:4 contained cover above text. Authors: width 208, minimum height
88, 48-unit portrait beside text. All heights grow; text stays outside artwork.

At 200% text scaling, native accessibility sizes, or insufficient room for readable controls, use
one column, expand labels/titles, and turn shelves into vertical lists retaining **all their items**.
At 400% Web zoom there is no page-level horizontal overflow. No nested vertical scrolling except
the existing recording panel. Reserve measured player/navigation/safe-area obstruction plus `lg`
16 clearance; keep focused controls visible. Preserve Web's existing 768 viewport navigation
breakpoint, sidebar/rail widths and header behavior; A controls Home layout independently.

## Type, color and art

Use [`colors.md`](../theme/colors.md) and [`typography.md`](../theme/typography.md). These are Home
roles, not a new global type scale:

| Role | Web (rem-based utilities) | iOS scalable style | Android project typography |
|---|---|---|---|
| Brand | `text-3xl/9`, expanded `text-4xl/10`, display Regular | Custom brand relative to `.title` / expanded `.largeTitle`, Regular | `headlineMedium`, expanded `displaySmall`, brand Regular |
| Month | `text-2xl/8`, semibold | `.title2`, semibold | `headlineSmall` |
| Section | `text-xl/7`, semibold | `.title3`, semibold | `titleLarge` |
| Body | `text-base/6`, regular | `.body` | `bodyLarge` |
| Metadata / shelf labels | `text-sm/5`, regular / medium | `.subheadline` | `bodyMedium` / `labelLarge` |
| Song row / UID | Shared `SongListItem` / UID styles | Shared equivalents | Shared equivalents |

Keep named native roles, including the repo's customized Android scale; do not substitute guessed
stock sizes. Preserve brand ink clearance and script-capable fallbacks; Bengali/Devanagari may
increase line height. No synthetic bold, compressed tracking or marquee in Home-owned content.

Page = `background`; cards = `backgroundOffset`; titles/action labels = `primary`; credits/body =
`secondary`; small metadata = full-opacity `tertiary`. Accent/highlight identifies icons, focus and
current selection. Android text uses `onSurface`, **not** accent-bearing Material `primary`; iOS uses
`primaryText` / `secondaryText` / `tertiaryText`. `border` is decorative; control boundaries use
`neutral`. Small View all labels use primary text with an underline and accent arrow.

Gaura accent on offset is 3.40:1 and onHighlight on accent is 4.18:1: filled accent Home controls are
**icon-only with accessible names**, not small white text. Neutral text on Gaura offset is 4.14:1;
use the readable shared row-chip treatment and tertiary/secondary text instead. Verify text ≥4.5:1
and meaningful icons/focus ≥3:1, including composited interaction states.

Seasonal art is always bundled, static **RhythmArtwork** from
[`components.md`](components.md#rhythmartwork): equal-height marks and broad curves, no figures,
deities, sacred diagrams, equalizer bars or spinner-like rings. Existing month photographs are not
displayed by v5; retain their assets/credits. Real covers, author/performer portraits and the brand
mark remain content identity with existing fallbacks. No image fetch is needed for seasonal art.

## Interaction, motion and states

Reuse canonical song rows/UID placement. The Web recording button is a **sibling** of the song link;
see [`components.md`](components.md#home-recording-picker). Selecting a different take invokes the
existing global player immediately and closes the picker; the current take delegates to existing
play/pause behavior. Opening/dismissing a picker does not change playback. Errors, Retry, autoplay
restrictions, queue/track-end decisions and announcements stay in the global player. Home adds no
second error or live-status region.

Use [`theme.md`](theme.md#utility-motion-tokens): `press`/`release` for fixed-target feedback,
`hover` for surface state, `selection`/`icon` for current-take tint and play/pause crossfade,
`panelEnter`/`panelExit` for the existing Web panel. Only standalone icon glyphs may scale to 0.96 on
Web/iOS press; rows/cards stay still. Android uses stock indication and motion-scheme effects.
No added playback spring, radius morph, waveform, pulse, art drift or looping decoration. Heading
and art are static. Player/navigation retain their own motion contracts.

| State | Presentation |
|---|---|
| Web before date hydration | Static, non-announced placeholder in the same responsive two-card layout: 160-min context plus six standard row slots. No build-date month or shimmer. Replace instantly; final height follows actual content. |
| Valid month | Real context/ordered rows; art available at first paint. Local-date changes swap instantly, without entrance/scroll animation. |
| Empty month | Keep both cards; list says “No songs are specific to this month.” No fabricated rows or daily-slot fallback. |
| Out of range | Remove seasonal composition and its gap; keep brand and other available modules. |
| First run / unreadable history | No recents heading/placeholder; other regions continue. History arrival/reorder is instant. |
| No recording / unsupported picker | Song remains readable; omit recording action, not song. Availability is not an offline/download guarantee. |
| Current recording | Persistent accent marker plus current-take text/glyph derived from the player; only matching song/take reflects its status. Other rows remain idle. |
| Loading | In an open picker, show loading glyph after 250 ms still loading; cancel on status/take change. Never delay commands or hold a stale spinner after completion. |
| Audio error / autoplay blocked | Reflect actual player status, never optimistic “Playing”. Reading remains usable; recovery stays in the player. |
| Missing cover / portrait | Existing contained cover fallback / initials; no error banner or fabricated identity. |

Reduced motion removes custom scale, translation and rotation; state swaps/content changes are
immediate. No smooth shelf scrolling. Web loading uses a static glyph plus accessible state; native
system status indicators retain OS behavior. Focus appears immediately in every mode.

## Implementation and verification handoff

Existing entry points: Web `web/src/components/{HomeScreen,NowSection,SongListItem}.tsx`; iOS
`ios/gk-ios/Views/HomeView/HomeView.swift`; Android
`andorid/app/src/main/java/com/gaudiyakirtan/myapplication/ui/home/HomeScreen.kt`. Compose parallel
MonthContext/MonthSongs, canonical row, shelf and artwork responsibilities in platform idioms.
No dependency or data-model change is required.

Later verification covers both themes at A=390, 720, 1024; Web sidebar open/collapsed; each platform's
actual feature set; long Latin/Bengali/Devanagari titles; enlarged text; reduced motion; keyboard,
VoiceOver/TalkBack; final content and focus clear of player/navigation. Use semantic headings,
lists and links, 44 × 44 Web/iOS or 48 × 48 Android targets, and complete accessible names.
Decorations are hidden from assistive technology. Forced colors retain system outlines/selection
markers. Check the picker focus cycle and that dismissal never stops playback.

Calendar platforms: populated/intercalary/empty/out-of-range months, local-midnight and timezone
changes, shipped order within both partitions, caps after partitioning. Web additionally: hydration
under a clock different from build time, first-run/populated history, picker loading/paused/error,
and another surface changing the active take. Native: every catalog entry and featured verse stays
accessible. New captures assess this v5 contract; old Figma frames neither block implementation nor
serve as acceptance baselines. Record conformance only after build/run and visual/behavioral
verification; this SPEC phase claims none of those passes.

## Change log

- **v5** — Synthesizes devotional editorial, productivity clarity and airy composition. Fixes v3
  header/v4 history drift; settles brand, geometry, abstract art, shared semantics and bounded
  motion. Preserves platform features/caps; resolves Home/Today conflicts to Today v2's shipped
  order and Home's no-daily-slots composition.
- **v4 (Web)** — Playable-first stable partition and in-place recording picker. Earlier “basis
  ranking within each run” wording is superseded by Today v2 and v5 above.
- **v3** — This month leads; observances moved into context; daily ārati/upcoming festivals removed
  from Home while their data remained available.
- **v2** — Upcoming-festival hero; Recently played and separate Authors/Books/Topics sections.
- **v1** — Replaced fabricated popularity grids with recommendations for the current context.
