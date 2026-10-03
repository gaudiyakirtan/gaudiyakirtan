# Screen — Home

**Spec version:** 5

**Figma frames:** `Home`, `Home-1`, `Home-2` — these show the **superseded** four-browse-grid
layout. The structure below has **no frame yet**; see [Verification](#verification). Frames exist,
but they no longer describe what this screen is for.

## Purpose

Home answers **"what do I sing right now?"** — not "what is in this app?".

### Why v1 changes the screen's job

The shipped home was four browse sections — Popular Songs, Browse by Topics, Popular Authors,
Featured Books. Three problems, all structural rather than cosmetic:

1. **Every section duplicated a nav destination.** Songs, Authors, Topics and Books are all
   permanently in the sidebar (web) / tab bar (mobile). Home was a table of contents for a menu
   already on screen.
2. **Two sections claimed "Popular" with no popularity data.** The code said so itself — songs were
   sorted by "has a recording" as a proxy, and "Popular Authors" was song-count descending. There is
   **no usage signal in the corpus**, and none can be manufactured: across the whole corpus, only a
   handful of songs appear even once in the dated community livestreams. Far too sparse to rank on.
3. **Nothing on it ever changed.** The same four songs and ten authors, every visit, forever — so
   there was no reason to return to it.

v1 replaces "what's in here" with "what's for now", using data the app already ships: the
[calendar](../data/calendar.md) overlay knows the lunar month, and its `daily[]` slots are indexed by
time of day. That makes the screen change through the day and through the year.

## Data bindings

| Region | Source |
|--------|--------|
| Recently played | Local device state; resolves uids via [`manifest.md`](../data/manifest.md) |
| Authors | [`author.md`](../data/author.md) |
| Books / Topics | [`collections.md`](../data/collections.md) |
| This month | [`calendar.md`](../data/calendar.md) — `months[]` (songs + observances), `windows[]` (month name) |

All titles resolve through the Manifest in the reader's selected script. Never hardcode a title.

## Layout & regions

Ordered by priority. On mobile this is the landing tab and the ordering matters most.

### 1. Welcome + this month (hero)

Home's lead region, and the only one that changes on its own — the lunar month turns over roughly
monthly, the ārati slot every few hours. Banner left, songs right.

It carries the seasonal recommendations: in Āṣāḍha the month yields the Jagannātha/Ratha-yātrā and
Guru-pūrṇimā songs, in Kārtika the Dāmodarāṣṭakam set. Removing it leaves home recommending
nothing.

**Artwork.** `monthImageUrlFor()` resolves `/assets/months/<gaudiya-month>.jpg`. Most months have
no image and fall back to a themed gradient — a normal path, not a failure. Provenance and
licensing for each file are recorded in `public/assets/months/CREDITS.md`.

The region is headed **"Welcome to Gaudiya Kirtan!"** with the mridanga logo beside it — the
greeting is the screen's opening line; the month itself is named on the banner below. The logo is
decorative (`alt=""`, `aria-hidden`), since the heading already carries the meaning.

**Left — the banner** carries all the contextual text: the lunar month name, the Gaudiya month
name beneath it, the month's observances as a clamped caption, and an `adhika-māsa` badge when the
month is intercalary.

**Right — nothing but the song list**, under a "Sung this month" label, ranked by `basis` strength.
This is [`today.md`](today.md) embedded as a region; that spec governs its provenance ranking and
honesty constraints.

**Playable songs lead.** Within that ranking the list is **stably partitioned so songs with
recordings come first** — the month's lead region should open with what the reader can actually
hear, not with rows whose only affordance is "read". The partition is stable: relative order inside
each group is untouched, so `basis` ranking still governs within the playable and non-playable runs.
Each playable row carries a **recording picker** on its right — the stacked cluster of singer
avatars plus a take count (the same control the [player](player.md) uses) — and choosing a take
starts it in the mini-player **in place, without navigating**, so the reader stays on Home.

The **time-of-day ārati** slot is **not** shown here. `daily[]` and `getDailySlots()` remain in the
data layer for a future surface; note if it returns the `sunrise` slot it must fall through, since
that slot ships zero songs (the Aruṇodaya kīrtanas are not in the corpus).

### 2. Recently played

The songs the reader last opened, **most recent first**. Stored **locally on the device**, never synced or
transmitted: `{ uid, lastOpenedAt }`, most-recent first, capped at ~10 entries. Written when a song
detail screen is opened.

Absent on first run — the region hides itself entirely rather than showing a placeholder.

### 3. Topics — one row

### 4. Books — one row

### 5. Authors — one row

Each is **one horizontally-scrollable row**, not a wrapping grid: the grid belongs on `/topics` and
`/books`, where the whole set is the point; on home it costs three rows of vertical scroll per
section. The sections take an opt-in `singleRow` flag so those index pages are unaffected.

Topics and Books each hide themselves when the corpus ships no groups of that kind.

**No "Popular" region, and no "With recordings" region.** There is no usage signal in the corpus
and none can be manufactured: only a handful of songs appear even once across the dated community
livestreams. Anything labelled "popular" would be fabricated.

## States

| State | Behavior |
|-------|----------|
| **First run** | Recently played is hidden; every other region still renders. |
| **Empty month** | Month has no songs (Pauṣa). Show the banner and say so plainly — never fabricate rows. See [`today.md`](today.md). |
| **Date out of calendar range** | Hide the region entirely rather than showing a wrong month. |
| **Loading (web)** | See the static-generation warning below. Reserve the hero's space; never render a stale date. |

## Interactions

- Any song row → [song-detail](song-detail.md); audio affordance → [player](player.md).
- Author / book / topic cards → their list or detail routes.
- Opening a song writes the Recently-played entry. Nothing else on this screen mutates state.

### Interaction feedback (web, v5)

Hover, keyboard focus and press each answer one question: *what is under me, and where does it
lead?* The budget follows the design contract — **one expressive area, everything else quiet**:

- **Expressive — the recording picker** in the month card. It is the screen's one in-place
  *playback* action, so it alone gets a spring: overshoot on press release and on the panel's
  entrance.
- **Standard — every repeated browse control** (song rows, Topic/Book/Author cards, View All):
  200 ms on the standard curve `cubic-bezier(0.2, 0, 0, 1)`, 100 ms into a press, no overshoot.

Constraints that apply to every item below:

- **The resting composition does not change.** Nothing animates on load, nothing moves on its own,
  and a cue that adds a glyph keeps it invisible at rest.
- **Boxes stay put; content moves.** Travel is applied to a row's or card's *contents*, inside its
  own clip or padding, never to the box itself — so a horizontally-scrolling rail (which clips both
  axes) never shaves a hovered card, and measured geometry is the same at rest and in hover. The one
  exception is a card's press shrink, which can only move inward.
- **Keyboard parity.** Every hover cue also fires on `:focus-visible`, on top of a visible focus
  ring. A browse card's ring is a 2 px `--highlight` ring on a 2 px `--background` offset, so it reads
  against any card colour; the single-row rails reserve 4 px above the cards for it (taken back with
  a matching negative margin, so the cards do not move).
- **Reduced motion** (`prefers-reduced-motion: reduce`) removes every translate, scale and spread.
  Colour, tint, underline, focus ring and open/selected state all remain; the picker panel fades
  instead of springing.
- **Native semantics.** Every clickable row and card is a real `<button type="button">` (navigation
  stays the caller's callback, per [components](components.md)); View All stays a link.

| Control | Hover / focus | Press | What it communicates |
|---|---|---|---|
| **Song row** (`SongListItem`, all lists) | Surface tint (as before) + the title/author block travels 4 px toward the trailing edge; focus adds an inset ring | `--highlight` tint; travel settles to 2 px | "This row opens forward, into the song" |
| **Recording picker toggle** | The stacked singer faces **fan apart** symmetrically (3 px per step); they stay fanned while the picker is open | Shrinks to 94 %, springs back past 100 % on release | "Several singers are folded in here"; fanned = open |
| **Recording picker panel** | — | — | Springs out of the toggle (origin top-right: rise 6 px, scale 96 % → 100 %, fade); takes stagger in 4 px from the trailing edge, 25 ms apart, capped at the 6th; exit is a 120 ms fade, never a bounce |
| **Topic card** | An up-right arrow slides diagonally into the empty bottom-right corner, level with the count pill (never under a two-line title); the pill's tint rises | Card shrinks to 97 % | "This opens the topic" |
| **Book card** | The cover zooms 5 % inside the card's clip (a glance into it; 300 ms, the screen's one full-bleed move); the title lifts 2 px | Card shrinks to 97 % | Depth — looking into the book |
| **Author card** | The avatar warms to a `--highlight` tint, its initial lifts 2 px, the name turns `--highlight` | Card shrinks to 97 % | Targets one person in the rail |
| **View All** | The label underlines; the arrow travels 4 px right | Arrow settles to 2 px | "More of this section, that way" |

View All's accessible name is "View all <section>" (the arrow is decorative), so the three links on
Home no longer share one name, and its target is 28 px tall without moving the heading row.

Hover-scale on the cards is **withdrawn**, not re-tuned: inside a `singleRow` rail it was clipped
top and bottom, and it read the same on every card regardless of what the card is.

## Per-platform notes

**All platforms.** Resolve the current date in the device's local timezone. A UTC conversion
shifts the lunar month for users west of Greenwich in the evening.

**Web.** ⚠️ The home page is statically generated. Anything time-dependent — the lunar month,
recently played — **must** resolve client-side after
mount, or the build's date gets baked into the HTML and served forever. Static props remain correct
for the corpus-derived regions (Authors, Books, Topics). `calendarRepository` is client-safe for exactly this reason;
import it directly, not via the `../services` barrel, which pulls in `fs`-based repositories.

**iOS.** `TodayView` + a `RecentsStore` over `UserDefaults`. Recompute on
`significantTimeChangeNotification` and on foreground, so a session left open overnight does not
keep showing yesterday's month or the small hours' ārati.

**Android.** Home composable + a `RecentsStore` over DataStore. `LocalDate.now()` / `LocalTime.now()`
with the device zone; recompute on resume.

## Verification

**Behavioral:**
- The month region reflects the *viewer's* local date and hour, not the build's. On web, verify by
  building and loading with an overridden clock — a baked-in month is the specific failure to catch.
- Recently played is hidden on first run, appears after opening a song, most recent first, and
  survives a reload.
- In a month with no songs (Pauṣa), the banner still renders and the right column says so; no
  fabricated rows.
- The observances read on the banner, not in the right-hand column.
- No region is labelled "Popular", and none claims a recording count is a popularity ranking.
- Interaction feedback (v5): the resting composition, content order, and card geometry match v4;
  every song row and browse card is a focusable `button` and opens its route on Enter; each hover
  cue also appears on keyboard focus; a hovered card in a rail is not clipped and its focus ring is
  fully visible; the picker's faces fan out on hover and while open; under
  `prefers-reduced-motion: reduce` no transform is applied but focus rings and tints still are; no
  horizontal page overflow at 390 px.

**Visual:** Figma fidelity remains blocked because the existing `Home*` frames show the superseded
layout. Mainline before/after regression evidence for v5 is stored in
`docs/screenshots/web/home-v5-micro-transitions/`, captured on October 3, 2026 at 1440 × 1000 and
390 × 844 in Gaura, with additional Shyam and active hover/picker states.

## Change log

- **v5 (web)** — Added [Interaction feedback](#interaction-feedback-web-v5): a hover / focus / press
  contract for song rows, browse cards, View All and the recording picker, under a single
  expressive budget (the picker) with everything else on standard motion. Clickable rows and cards
  become native buttons; card hover-scale is withdrawn (rails clipped it); reduced motion keeps all
  state feedback and drops all spatial movement. Resting layout, content and ordering are unchanged.
  The header now matches the change log (it still read v3 after v4).
- **v4 (web)** — **This month** now sorts songs **with recordings first** (a stable partition, so
  `basis` ranking still holds within each run), and those rows gained a **recording picker** — the
  player's stacked singer-avatar cluster — that starts any take in the mini-player without leaving
  Home. The region's job is seasonal *listening*, so the playable songs lead it.
- **v3** — Removed the "Upcoming festivals" hero; **This month** is now the lead region, keeping
  the banner + song-list layout. Observances moved onto the banner; the time-of-day ārati block
  removed from this screen (its data layer stays). Region heading is the welcome greeting +
  mridanga logo; the month name lives on the banner. `calendar.md` v2 `festivals[]` and `getUpcomingFestivals()` remain
  in the data layer, unused by any screen.
- **v2** — Hero was **upcoming festivals** (banner + song list, from `calendar.md` v2 `festivals[]`);
  Continue renamed **Recently played**; Authors/Books/Topics restored as sections; the browse row
  and "With recordings" removed. "This month" (lunar songs + ārati) sits below the hero — it is
  what answers "what do I sing now" when the next dated festival has no songs.
- **v1** — Re-purposed from four browse grids to "what do I sing right now": Now (time-of-day ārati
  + lunar month), Continue, one browse row, and an honestly-labelled "With recordings". Retires the
  fabricated "Popular" ranking.
