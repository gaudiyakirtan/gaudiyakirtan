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

- Indexes the [Manifest](../data/manifest.md) only — never full songs. Matches against:
  - every `titles[]` entry (all scripts, so a user can match Roman *or* native script), and
  - the resolved author name (`author_uid` → derived Author).
- A result resolves to a `uid`; tapping opens [song-detail](song-detail.md).
- **Reciters** (web palette) — the performing artists on `audio_files[].artist`, distinct from a
  song's composing author. Emitted as `type: 'reciter'` entries and
  resolving to **`/tracks?artist=<name>`** — a reciter is a performer, so the useful destination is
  their *recordings* ([tracks](tracks.md)), not the songs those takes belong to.

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

- **v8 (web)** — **Reciter names in the palette now follow `listLanguage` too, and the author
  renderings are de-duplicated.** Two follow-ups to v7:
  - **Reciters were the last romanized-only entity.** Their names (`audio_files[].artist`) are
    Gauḍīya devotional names, so they transliterate like a title — but the corpus stores them as a
    single romanized string. `pipeline/build_reciter_scripts.py` supplies a hand-authored IAST per
    performer and transliterates it to every Indic script with aksharamukha, **keeping non-Sanskrit
    tokens Latin** (sannyāsī initialisms `BV`/`BP`/`BR`, place qualifiers `(Bay Area)`/`(Florida)`/
    `(UK)`, `&`), into `src/data/reciter_names.json` keyed by artist code (the recording-uid
    prefix). `gen-markdown` attaches those `scripts` to each reciter entry (by code), and
    `services/reciterNames.ts` serves them to the tracks list as well. So a Bengali reader now sees
    `শ্রীল BV স্বামী প্রভুপাদ`, `রসিক দাসী`, `রাধিকা দাসী (Bay Area)`.
  - **`authorScripts` de-duplicated.** v7 copied each author's per-script names onto every one of
    their song rows (82 authors across 702 songs). Song entries now drop `authorScripts`; the palette
    builds an author-name → scripts map from the `author` entries (which already carry them) and
    looks a song's author up by its shared romanized name. Index raw 1.06 MB → 673 KB; gz 184 → 155
    KB (155 KB is dominated by the title `scripts`, not the authors). Matching and display are
    unchanged.
- **v7 (web)** — **Palette results now render in the reader's `listLanguage`, not always romanized.**
  The palette was the one title-showing surface that ignored the display-script setting (the song
  list, cards, detail, groups, home and mini-player all honor it via `pickScriptText` /
  `pickListTitle`). The cause was the data, not the component: `search-index.json` carried a Latin
  `label` only, so the palette had nothing else to show. Each entry that has script renderings
  (song, book, topic, author — not tag/reciter, which have none) now also carries a `scripts` map
  (`{Beng, Deva, …}`, Latin omitted since it is the `label`) and a song carries `authorScripts`;
  `SearchModal` displays `scripts?.[listLanguage] ?? label` (and the author likewise). **Matching is
  unchanged** — it still runs on the Latin label + the romanized query (v6), so only what the reader
  *sees* follows `listLanguage`. The index grows 22 KB → 184 KB gzipped (still one on-open fetch);
  an e2e test pins a Bengali reader getting Bengali titles. This closes a recurring class of bug:
  any Latin-only *derived* artifact (like the search index) silently ignores the script setting even
  when every component is correct — the fix is to carry the scripts in the data.
- **v6 (web)** — **Search now works in any supported script — by transliterating the query, not by
  indexing every script.** The index stays Latin (IAST); a query typed in Bengali, Devanagari,
  Telugu, Kannada, Malayalam, Gujarati, Oriya or Tamil is romanized to IAST on the fly and matched
  against the one Latin Duet index. This is ~a tenth the payload of shipping a per-script index
  (~900 KB each) and works in *both* directions the multi-script fix needed to: a reader typing
  their own script finds the song, without the corpus carrying nine extra copies of every line.
  - **Maps** are generated at build time from **aksharamukha** (the same engine that romanized the
    corpus, so a runtime romanization lines up with the indexed text by construction) by
    `pipeline/build_translit_maps.py` → `web/src/data/translit-maps.json` (8 KB, ~2 KB gzipped,
    bundled — the transliterator must run synchronously per keystroke, so it can't be a lazy fetch).
    The map carries only the alphabet: per script, each vowel, each **bare** consonant, the vowel
    each dependent sign (matra) stands for, the virama, and the anusvara/visarga/candrabindu marks.
  - **Assembler** (`services/translit.ts`, ~40 lines) applies the abugida rules the map omits: a
    consonant carries an inherent `a`; a following matra replaces it; a virama drops it (which is
    also how conjuncts fall out — क्ष walks to `k` + (virama: no vowel) + `ṣ` + `a` = `kṣa`). It
    detects the script from the first strong character and is a **no-op for Latin**, so it is safe
    and cheap on every query. Wired once inside `searchDuet`, so the palette and the URL rescuer
    both get it.
  - **Measured** on the corpus's own native titles run back through the actual assembler + Duet:
    **100% R@1** for Bengali, Devanagari, Telugu, Kannada, Malayalam, Gujarati and Oriya; **99.1%**
    for Tamil (its overloaded consonants carry aksharamukha's superscript-digit disambiguation,
    which mostly still matches). Content-line queries in native script work too. Retrieval is this
    high because Duet is fuzzy and its normalizer strips diacritics, so small romanization
    differences wash out. **Not covered:** Cyrillic (the corpus's Russian-transliteration rendering
    is alphabetic, not Brahmic — a separate small map, deferred), and typing in a script's *native
    digits* for a uid.
- **v5 (web)** — **Duet is now the matcher for both the palette and the URL rescuer, and verse
  content is searchable.** The tiered `scoreText` ranker is replaced by **Duet** (`services/duet.ts`),
  the joint-objective winner from the `search-lab/` benchmark: `min(R@1 title, R@1 content) = 86.6%`
  where `scoreText` was 65.8%, held back by title recall on the metathesis/compound misspellings it
  structurally cannot reach. Duet runs two retrieval paths — a fielded character-trigram + phonetic
  title index with a Levenshtein rerank, and a **per-line** content index (every verse line is its
  own document, aggregated to song by **max**, never pooled — pooling is the documented
  79.7%→23.4% collapse) — fused by max so a song wins by whichever field matched. The engine and its
  ~20 tuned constants are ported verbatim from the lab (validated top-5-identical on 20 queries) and
  should be treated as a unit.
  - **New index:** `scripts/gen-markdown.mjs` emits **`search-content.json`** — every song's IAST
    verse lines keyed by uid (702 songs, 15,552 lines, ~210 KB gzipped). Taken from the `Latn`
    `display_scripts`, the same field the `.md` twins use, which is already free of the pipeline's
    `[FLAG_HYPHEN_ALPHA]` sentinel that `source_text_master` carries. It is a **separate, lazily
    fetched** file: the palette loads it in the background on first open, so title/entity search is
    live instantly off the 22 KB `search-index.json` and content search lights up a moment later —
    nobody pays 210 KB just to jump to a song.
  - **Palette:** builds one Duet index over pages + entities (+ content for songs) and searches it;
    a song is now findable by a line of its text ("radhika charana renu" → *Rādhikā-caraṇareṇu*),
    not only its title.
  - **URL rescuer:** uses the same Duet matcher for its fuzzy pass, over **labels only** (a URL
    names a thing, it does not quote a line of one), gated by a score floor (1.5) and the same 1.15×
    ambiguity margin. Pass 1 (case-exact) is unchanged. All 25 resolver precision tests stay green:
    `/setings`→`/settings`, `/trackz`→`/tracks`, `/pronunciaton`→`/resources/pronunciation`,
    `/akrodha`→`/songs/N9` resolve; `/xyzzy`, `/jaya jaya`, `/songs/NA9` and `/arati` still 404.
  - **Still Latin-only:** both indexes carry romanized text only, so a query *typed* in Bengali or
    Devanagari is still unmatched (title labels and verse lines are IAST). The metathesis case
    `krishna vimostottra`→*biṁśottara* remains unsolved at rank 1 — Duet does not reach it either
    (it was the skeleton matcher `jaigopal`'s specialty in the lab). `scoreText`/`textCloseness` in
    `search.ts` are now unused by the app (only `normalizeSearchText` is, via Duet) but stay as
    tested utilities.
- **v4 (web)** — **The palette and the URL rescuer now search the same set.** They shared the
  `scoreText` ranker but not the data: the palette kept its own 12-entry page list while
  `urlResolver` had a shorter 8-route one that was *case-matched only, never fuzzy-matched*. So ⌘K
  found "Settings" from a typo while `/setings` 404'd, and `/resources/*` was unreachable from a URL
  at all. The list now lives once, as `NAV_ENTRIES` in `services/urlResolver.ts`, and the palette
  imports it (attaching icons by href).
  Also added a **typo tier**: every tier `scoreText` is confident about (exact/prefix/substring)
  requires the query to be literally *contained* in the target, which a misspelling never is —
  `/setings` scored 30.5 against a floor of 60. A normalized edit-distance similarity ≥ 0.8
  (`textCloseness`) is now promoted to the substring tier, then judged by the same floor **and the
  same 1.15× ambiguity margin**, so `/setings`, `/trackz` and `/pronunciaton` resolve while
  `/xyzzy`, `/jaya jaya` and `/bhaktivinoda` still 404 on purpose (the last two are genuine ties —
  a dozen songs at exactly 80.0 and a three-way tie at 60.0).
  **Known gap, not fixed here:** `search-index.json` labels are Latin-only (0 of 968 rows carry
  Indic text), so a Bengali/Devanagari title is unfindable in *either* path even though every song
  ships 10 script renderings. The multi-script matcher that would fix it
  (`buildSearchIndex`/`searchIndex`/`searchListings` in `search.ts`, plus `search-listings.json`)
  still exists and is tested but has **zero importers** — it was the removed `/search` page's engine
  (see v2). Wiring it up, or emitting all scripts into `search-index.json`, is the real fix.
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
