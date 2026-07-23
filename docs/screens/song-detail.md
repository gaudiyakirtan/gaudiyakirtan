# Screen — Song Detail

**Spec version:** 3

**Figma frames:** `Song`, `Song-1`, `Song-2`, `Song-3`, `Song-4`, `Song (hidden song)`,
`Song Component (app)`, `Song Component (web)`, `song view`.

## Purpose

The reading screen: shows one [Song](../data/song.md) in full — its title, author, and each
[Verse](../data/verse.md) laid out with the reader's chosen script, optional word-to-word glossary,
and optional [Translation](../data/translation.md). This is where kirtan is actually sung from, so
legibility and script/toggle correctness are paramount.

## Data bindings

- Loads the full `Song` by `uid` (the only screen that loads a full song; lists use the Manifest).
- Per verse, renders **two script lines together** (the frames always show both — this overrides any
  singular reading of "one transliteration"):
  1. the **native reference** line — the song's `language_of_origin` script (e.g. Bengali/Devanagari),
     shown muted; and
  2. the **chosen reading** line — the `display_scripts` entry matching the reader's script setting
     (default `Latn`/IAST), highlighted. When the chosen script *is* the native script, show just
     the one line. Fallback to `Latn`/IAST if the chosen script is absent for that song.
  - `word_to_words` when the word-to-word toggle is on (matched by language + script);
  - `translations` when the translation toggle is on (matched by language).
- Title/author from `Song.titles` / `Song.authorDisplay` in the current script.
- Player affordance shown only when `Song.audioAvailable` (opens [player](player.md)).

## Layout & regions

- **Top toolbar:** back · (player control, iff audio) · a display-settings control (the "Aa" menu:
  quick script / word-to-word / translation / collapse toggles) · and the bookmark + share icons
  shown in the frames (see deferred note below).
- **Header:** title (chosen script, accent color), author (primary-text color), then a **chip row**:
  the song `uid`, its **book / topic memberships**, and its free-form **tags**. Books render in the
  accent and link to the book page (a named work is the strongest membership, so they sort first);
  topics are outlined and link to the topic page; tags are plain, non-navigating labels. Membership
  titles follow the reader's **List language**, like every other list surface.
  - ⚠️ **Membership is read from `song_groups.json`, not `Song.topics`.** The corpus deliberately
    never populates `Song.topics` (see `services/queueContext.ts`), so a song can belong to a topic
    while its own `topics` array is empty — e.g. `PT7` is member 51/51 of `topic-pancatattva` yet
    ships `topics: null`. Resolve membership by scanning the groups (web: `getSongMemberships(uid)`,
    derived at build time), never off the song. Tags are a separate concept and *are* a song field.
- **Body:** vertical list of verses in `Song.verses` order. Each verse block stacks chosen-script →
  romanization → word-to-word → translation, aligned line-for-line (line counts guaranteed equal per
  `verse.md`), word-to-word and translation shown when toggled on.
- **Mobile** (`Song Component (app)`, frames `Song-3` dark / `Song-4` light): a **full-screen
  reader with the top toolbar and NO bottom tab bar** (bottom nav is hidden on this screen). Single
  scrollable column. (Corrected in v2 — earlier prose said "tab bar below"; the frames are authoritative.)
- **Web** (`Song Component (web)`): wider reading layout in the content area beside the sidebar.

## States

- **Loading:** skeleton verses while the song file decodes.
- **Hidden song** (`Song (hidden song)`): a song may be marked hidden/collapsed — verses collapsed
  to titles/first line until expanded. (Define the hide trigger in data if adopted; until then this
  is a display-only collapse.)
- **Offline:** fully functional — song is bundled; no network needed.
- **Missing translation/script:** omit the toggle target gracefully (never show `NULL`/empty per
  `translation.md`); if the chosen script is unavailable, fall back to IAST.

## Interactions

- Script switch, word-to-word toggle, translation toggle — reflect [settings](settings.md) defaults;
  quick-toggled here via the "Aa" menu. Romanization scheme (IAST/BBT/GVP) follows the Settings
  `romanStandard`; no per-screen picker (frames show IAST only).
- Back → previous list, preserving scroll.
- **Deferred affordances** (present in frames, wired in later slices — render as stubs or omit, but
  handle consistently across platforms):
  - Play → [player](player.md) with this song queued. Shown iff `audio_available`; action stubbed
    until the player slice.
  - Bookmark → the mobile Collections/bookmarks feature (later slice).
  - Share → target unspecified (later slice).
  - Tap author → the [author-filtered list](songs-list.md) (`?author=` — the route now exists).
  - Tap topic → the topic's songs ([browse](browse.md)). **Shipped on web** (v5) as the header's
    membership chips; iOS/Android still render no membership. Tags **are** a corpus field
    (`Song.tags`, populated for ~300 songs) and render as labels, but are not yet navigable.

## Known data gaps

Both flagged by all three implementations; tracked as pipeline enhancements, not screen bugs:

1. **Word-to-word superscripts.** The frames show superscript line markers (¹ ² ³) tying each
   word-to-word pair to its source line. The canonical `word_to_words` data does **not** encode a
   line index, so the superscripts can't be reproduced. Render the flowing "headword — gloss;" style
   without them until the pipeline enriches `word_to_words` with a per-line index.
2. **Author romanization.** ✅ **Resolved.** `author_display` now ships a native (Beng/Deva) entry
   **plus** a `Latn` IAST entry for every author, so the header author honors the script toggle
   exactly like the title (Roman reading → "Śrīla Locana dāsa Ṭhākura"). Generated by
   `pipeline/fix_author_display.py`: Aksharamukha draft (Bengali ৱ→ব normalized for correct
   syllabification) → a curated map applying Gaudiya/GVP conventions (v for ৱ/ব in proper nouns,
   single `-ārya`, split `Śrī`/`Śrīmad` prefixes). Written byte-identically to all three platform
   song dirs. The picker order is `[displayScript, 'Latn', 'Beng']` — Latn is the universal
   fallback now that it's always present.

## Per-platform notes

- **iOS:** `SongView.swift` + `VerseView.swift`; SwiftUI; script/toggle state from settings model.
- **Android:** `SongScreen.kt` + `VerseView.kt`; Compose; state hoisted to a `SongViewModel`.
- **Web:** `songs/[id].tsx` + `SongScreen.tsx` + `VerseListItem.tsx`; statically generated per song.
- All: verse alignment must survive long Sanskrit compounds and RTL-free Indic scripts without
  breaking the master↔script↔gloss line correspondence.

## Verification

- **Visual:** matches `Song` / `Song Component (app|web)` frames per platform (header, verse block,
  toggle affordances).
- **Behavioral:** loads a real bundled song offline; script switch re-renders all verses; toggles
  show/hide word-to-word and translation; hidden-song collapse works; author/tag navigation lands
  correctly; play appears iff `audioAvailable`.

## Change log

- **v5 (web)** — The header gained a **membership chip row**: the book(s) and topic(s) a song
  belongs to, linking to those collection pages, beside the existing `uid` and tags. Membership is
  derived from `song_groups.json` at build time (`getSongMemberships`), **not** from `Song.topics`,
  which the corpus leaves unpopulated by design — the reason a song like `PT7` could sit in
  `topic-pancatattva` while showing no topic at all. Also corrected a stale note claiming free-form
  tags were "not a corpus field"; `Song.tags` ships for ~300 songs.
- **v4 (web)** — Both verse lines are now **independent script choices**: line 1 = `displayScript`
  (source, muted), line 2 = `transliterationScript` (the highlighted reading — **any** script, since
  it's just a transliteration; Latin resolves via `romanStandard`). The two lines dedupe when they
  render identically (the default: both English/IAST → one line). See
  [textDisplay.resolveScriptLines / scriptRenderKey] and [settings.md](settings.md) v4.
- **v3** — Clarified verses render **native reference + chosen reading script together** (all frames
  show both; resolves the singular-vs-dual ambiguity all 3 implementations hit). Added the **author
  romanization** data gap. song-detail now verified green on all 3 platforms at v3.
- **v2** — Corrected mobile layout to a **full-screen reader with top toolbar, no bottom tab bar**
  (the frames are authoritative; earlier prose was wrong — caught by the Android implementer).
  Documented deferred affordances (player/bookmark/share/author/tag) and the word-to-word
  superscript **data gap**. Clarified romanization follows Settings.
- **v1** — Initial spec: full-song reading screen, script/gloss/translation binding + toggles,
  hidden-song and offline states, platform-split layout, player entry.
