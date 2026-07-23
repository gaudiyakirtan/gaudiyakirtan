# Screen — Home

**Spec version:** 3

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
   **no usage signal in the corpus**, and none can be manufactured: of 702 songs, only ~30 appear
   even once across 2,172 dated community livestreams. Far too sparse to rank on.
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
and none can be manufactured: ~30 of 702 songs appear even once across 2,172 dated community
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

**Visual:** blocked — the existing `Home*` frames show the superseded layout. Draw a frame for this
structure, then verify against it.

## Change log

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
