# Component — Today (songs for the current date)

**Spec version:** 2

**Figma frames:** **none yet.** `Home`, `Home-1`, `Home-2` define the home screen this component
sits in, but no frame covers the component itself — it post-dates the Figma file. See
[Verification](#verification): until a frame exists the **visual layer of the verifier cannot run**,
and this component ships on behavioral verification only. Design the frame before calling it done.

## Purpose

Answers "what should I sing today?" on the home screen. Locates the current date in the Gaudiya
lunar calendar and surfaces that month's songs, its observances, and the daily ārati slots.

This is the first surface for the [calendar](../data/calendar.md) overlay, which currently renders
nowhere. It is a **discovery aid**, not a liturgical authority — see
[Honesty constraints](#honesty-constraints).

## Data bindings

| Source | Used for |
|--------|----------|
| [`calendar.md`](../data/calendar.md) | The lunar window for today, that month's `songs[]` + `observances[]`, the `daily[]` ārati slots |
| [`manifest.md`](../data/manifest.md) | Resolving each `song_uid` → title (in the reader's script), author, `audio_available` |

`calendar.json` stores **uids only**. Every displayed title comes from the Manifest, in the reader's
selected script — never hardcode a title into this component.

Each song ref carries a `basis` (`observed` · `panjika` · `book` · `thematic`) recording *why* it is
attached to the month. See [Ranking and provenance](#ranking-and-provenance).

## Layout & regions

A section on the home screen, above or below the existing songs/authors/books/topics sections
(final position is a Figma decision, not a spec one).

1. **Header** — the month, in both namings: *"Kārtika · Dāmodara"*. Optionally the pakṣa
   (waxing/waning). For an `adhika` window the month is **Puruṣottama** — label it as such; do not
   show the repeated lunar-month name as if it were the ordinary month.
2. **Observance line** — `observances[]`, comma-joined or as chips. May be long; truncate rather
   than wrap indefinitely.
3. **Song list** — reuse the existing song-list-item component; do not invent a new row style.
   Tapping a row opens [song-detail](song-detail.md). Audio affordance appears when
   `audio_available`, consistent with [player](player.md).
4. **Daily slots** *(optional, secondary)* — the ārati slots, which apply every day regardless of
   month. Consider collapsing behind a disclosure; they are constant and will otherwise dominate.

## States

| State | Condition | Behavior |
|-------|-----------|----------|
| **Populated** | Window found, `month.songs` non-empty | Normal render. |
| **Empty month** | Window found, `month.songs` is `[]` | **Expected, not an error.** Pauṣa ships zero festival songs. Show the month header + observances, and fall back to the daily ārati slots. Never fabricate rows. |
| **Out of range** | Date outside `window_start`..`window_end` | Hide the component entirely, or show only the daily slots. Never show a wrong month. |
| **Loading** | Web only, before hydration | See the static-generation note below. Render a skeleton or nothing — never a stale month. |

There is no error state for data loading: `calendar.json` is bundled, not fetched.

## Interactions

- Song row → [song-detail](song-detail.md). Audio affordance → [player](player.md).
- The month header **may** link to a fuller month/calendar view. That view is **not specified here**
  and does not exist; omit the affordance rather than link to a stub.
- Nothing on this component mutates state. It is read-only.

## Ranking and provenance

**Preserve the month's shipped song order.** `calendar.json` emits each month's `song_uids` as a
curated sequence, and that sequence is the ranking — do not re-sort it.

The only reordering permitted is a **stable partition putting songs with recordings first**, so the
region opens with what the reader can actually hear. Stable is load-bearing: relative order inside
the playable and non-playable runs must be untouched. Use a partition, not a comparator keyed on a
boolean — such a sort is not guaranteed stable across language runtimes and would reshuffle
same-audio songs, losing the curated sequence.

### Why not sort by `basis`

v1 required sorting by `basis` strength (`observed` → `panjika` → `book` → `thematic`). That is
withdrawn. `basis` records *why* a song is attached to the month — `observed` is backed by dated
recordings of it actually being sung then, `thematic` is a subject-matter match with no dated
evidence — and it remains genuinely useful metadata. But it is **evidence strength, not singing
order**, and sorting on it fragments a sequence that was curated as a sequence: in Śrāvaṇa it lifts
a lone `panjika` song above the two `book` songs that belong together.

The distinction v1 wanted to protect is real, and the honesty constraints below still carry it.
Surfacing the basis in the UI stays **optional** and should be subtle if done at all (a tooltip or a
small marker, not a badge on every row).

### Display cap

A month may reference more songs than a home region should show. Capping the rendered list is
permitted; web caps at 6. The cap is a **display** concern — apply it after the partition, and never
in the data layer, so the full list stays available to any other surface.

## Honesty constraints

These follow from [`calendar.md`](../data/calendar.md)'s stated accuracy limits and are binding on
the UI:

- **Do not present this as "today's prescribed songs."** It reflects what the month suits, drawn
  from observed practice and the songbook — not a liturgical instruction. Wording like
  *"Songs for Kārtika"* is accurate; *"Today you should sing…"* is not.
- **Do not claim a festival falls today.** The overlay resolves *months*, not observance days;
  `observances[]` lists what falls somewhere in the month. Exact dates need the pañjikā, which the
  app does not ship.
- **Month boundaries carry ±1 day uncertainty** (a closing full-moon day may belong to either
  month, depending on local sunrise). Do not render a countdown, "day N of the month", or anything
  else implying day-level precision.

## Per-platform notes

**All platforms.** Resolve today's date in the device's **local** timezone. Converting to UTC first
shifts the date by a day for users west of Greenwich in the evening, silently showing the wrong
month. Do not reimplement the lunar arithmetic — look the date up in the precomputed `windows`
table.

**Web.** ⚠️ **The home page is statically generated.** Resolving the date in `getStaticProps` would
bake the *build* date's month into the HTML and serve it forever. This component must resolve the
date **client-side** (an effect after mount, or equivalent), which is why
`calendarRepository` is client-safe — it imports `calendar.json` as a module rather than reading it
through `fs` like the Manifest repository does. Import it directly rather than through the
`../services` barrel, which pulls in `fs`-based repositories that must never enter the client
bundle (same constraint `Sidebar.tsx` documents). Expect a first paint without the section; render a
skeleton rather than a stale month.

**iOS.** A `TodayView` fed by a view model over the bundled `calendar.json`. Windows are half-open —
use `..<`, not `...`. Recompute on `UIApplication.significantTimeChangeNotification` so a session
left open across midnight does not keep showing yesterday.

**Android.** A `TodaySection` composable with a view model over `assets/calendar.json`. Use
`LocalDate.now()` with the device zone. Same midnight-rollover concern as iOS.

## Verification

**Behavioral:**
- On a date inside a known window, renders that month (e.g. `2026-11-14` → *Kārtika · Dāmodara*).
- On a date in an `adhika` window, renders **Puruṣottama**, not the repeated month name.
- On a date whose month has no songs (Pauṣa), renders the empty state with daily slots — not an
  error, not fabricated rows.
- On a date outside the precomputed range, the component is absent — never a wrong month.
- Titles resolve through the Manifest and follow the reader's script setting.
- Songs are ordered by `basis` strength.
- **Web only:** the rendered month reflects the *viewer's* date, not the build date. Verify by
  building, then loading with an overridden clock — a statically-baked month is the specific failure
  this catches.

**Visual:** blocked — no Figma frame exists (see header). Author one, then verify against it.

## Change log

- **v2** — **Withdraws basis sorting.** The month's shipped `song_uids` order is now the ranking;
  the only permitted reordering is a stable playable-first partition. v1's `observed` → `panjika` →
  `book` → `thematic` sort fragmented a sequence the pipeline curates as a sequence. Web already
  behaved this way and was the drift that surfaced the question — the conflict was found by
  rendering both platforms' Śrāvaṇa list side by side and finding them ordered differently. `basis`
  is retained as provenance metadata; it is no longer a sort key. Also records that a display cap
  (web: 6) belongs in the UI, never in the data layer.
- **v1** — Initial spec: data bindings, states (incl. the real empty-month case), basis ranking,
  honesty constraints, the web static-generation trap, per-platform date handling.
