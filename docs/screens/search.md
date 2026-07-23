# Screen — Search

**Spec version:** 1

**Figma frames:** `Search`, `Search-1`.

**Prior art:** `../../search-benchmark/` — fuzzy + semantic (Chroma / sqlite-vec) spikes, and
`search-database.csv` (real user search attempts, e.g. "krishna vimostottra" →
*Śrīkṛṣṇera Viṁśottara-śatanāma*) usable as fuzzy-match ground truth.

## Purpose

Fast, forgiving lookup of a song by title or author across the whole catalog, fully offline. The
search bars already present (decoratively) on Home/Library and the Search tab all resolve here.
Kirtan titles are transliterated Sanskrit/Bengali, so **fuzzy, diacritic-insensitive matching is
essential** — users type "govinda" for "gōvinda", "vimostottra" for "viṁśottara".

## Data bindings

- Indexes the [Manifest](../data/manifest.md) only (703 entries) — never full songs. Matches against:
  - every `titles[]` entry (all scripts, so a user can match Roman *or* native script), and
  - the resolved author name (`author_uid` → derived Author).
- A result resolves to a `uid`; tapping opens [song-detail](song-detail.md).

## Matching rules (tier 1 — fuzzy, required)

- **Normalize** query and target: lowercase, strip diacritics (ā→a, ṁ→m, ś→s), collapse
  whitespace/punctuation. Match on the normalized forms so accents and transliteration variants are
  forgiven.
- **Fold transliteration-equivalent letters** (Gauḍīya/Bengali romanization treats these as one):
  **v↔b** (`madhava`↔`madhaba`, `viṁśottara`↔`biṁśottara`) and **j↔y**. Folding these at normalize
  time measurably lifts recall (web: +several points) — adopt on all platforms for parity.
- **Rank**: exact/prefix hits first, then substring, then fuzzy (edit-distance / token overlap).
  Author matches rank below title matches. Cap and order by score.
- Match against all title scripts so native-script queries also work.
- Evaluate quality against `search-database.csv` (the recorded attempts should return their intended
  song in the top results).

## Semantic search (tier 2 — optional, later)

On-device semantic search (the `search-benchmark/sqlite` sqlite-vec + gte-small spike) is a **later
enhancement**, not required for this slice. Keep the search interface abstracted so a semantic tier
can layer behind the same result list.

**Known tier-1 limitation:** hard *metathesis* cases — letters transposed inside a token
(`vimostottra` for `viṁśottara`, `asktam` for `aṣṭakam`) — are not reliably matched by
normalize+edit-distance without hurting precision. The distinctive token typed alone still hits;
the noisy full query is the semantic tier's job. Keep tier-1 conservative (precision over recall).

## Layout & regions

- **Search field** (top) — autofocus on the Search tab; live results as the user types.
- **Results list** — reuses the [songs-list](songs-list.md) row (title in `listLanguage` + author +
  audio badge), ordered by score.
- **Idle state** — before typing: optionally recent/suggested (defer; empty is fine).
- **No-results state** — a clear "no matches" message.

## States

- **Empty query:** idle state (no results list).
- **No matches:** explicit empty message.
- **Offline:** fully functional — the index is the bundled manifest.

## Interactions

- Type → live-filter results (debounced).
- Tap result → [song-detail](song-detail.md) for that `uid`.
- The **Home** search affordance (and the dedicated Search tab) is the global title/author search
  and navigates/expands into this screen.
- **Do NOT hijack a Library search bar that already does real per-category filtering** (e.g. mobile
  Library filtering Songs/Authors/Topics/Books) — replacing that with global search is a regression.
  Only genuinely-decorative search affordances get wired to this screen.

## Per-platform notes

- **iOS:** a `SearchView` + `SearchViewModel` over the manifest; `SearchBar` component already exists.
- **Android:** a `SearchScreen` (Compose) + `SearchViewModel`; `SearchBar`/`LibrarySearchBar` exist.
- **Web:** a `/search` route (or expanding the header search box) filtering the embedded manifest
  client-side.
- All: normalization/ranking should live in one shared-per-platform helper so behavior matches.

## Verification

- **Visual:** matches `Search` / `Search-1` frames per platform.
- **Behavioral:** diacritic-insensitive queries return the right song (spot-check several rows from
  `search-database.csv`); native-script query matches; author query returns that author's songs;
  no-results state shows; tap → correct song; works offline.

## Change log

- **v3 (web)** — Palette is now **universal**: finds pages/nav (with icons), songs, books, topics,
  authors, and tags — one flat ranked list, each row showing a type icon + type label. Data entities
  come from `/search-index.json` (emitted by gen-markdown.mjs) + hardcoded page entries; generic
  ranking via `search.ts` `scoreText`. Tags link to `/songs?tag=<tag>` (filter reads `/tag-index.json`).

- **v2 (web)** — Search is now a **centered command-palette modal** (`SearchModal.tsx`), opened by
  the sidebar Search button, the mobile header, or **⌘/Ctrl-K** from anywhere — not a full page. Same
  offline ranker (`services/search.ts`); the client-safe index is fetched once from
  `/search-listings.json` (emitted by `scripts/gen-markdown.mjs`, romanized author names included) so
  it never drags the fs repositories into the bundle. Arrow-key navigation + Enter to open; Esc/backdrop
  to close. The standalone `/search` **page was removed** — the modal is a superset and the single entry
  point.
- **v1** — Initial spec: offline fuzzy (diacritic-insensitive) search over the Manifest titles (all
  scripts) + author, ranked results reusing the song-list row; semantic search flagged as a later
  optional tier.
