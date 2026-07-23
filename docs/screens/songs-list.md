# Screen — Song List / Library

**Spec version:** 1

**Figma frames:** `Songs`, `Song List`, `Song List-1`, `Flat Song List`, `Library_Songs`,
`Library`, `Library (Author)`, `Library (Author)-1`, `Library (Author)-2`.

## Purpose

The browsing surface for the whole catalog: a scrollable list of all songs with an alphabetical
index, driven entirely by the [Manifest](../data/manifest.md) (never full [Song](../data/song.md)
objects). On mobile this is the **Library** tab; on web it's the **Songs** page. Tapping a row opens
[song-detail](song-detail.md).

## Data bindings

- Reads the **Manifest** — `primary_title`, `titles`, `author_uid`,
  `first_letter`, `audio_available`. Full songs are loaded only on navigation to detail.
- Row title renders in the reader's [`listLanguage`](settings.md) script (from `titles`); falls back
  to `primary_title` (Latin) when that script is absent.
- Author name per row: resolved from the derived Author catalog by `author_uid` (empty
  `author_display` → uid fallback, per [author.md](../data/author.md)).
- Audio badge shown when `audio_available`.

## Layout & regions

- **Header:** screen title + search entry (opens [search](search.md)).
- **List:** one row per song — title (in `listLanguage`), author, audio badge. Two presentations
  exist in the frames: a **card grid** (`Songs`) and a **flat list** (`Flat Song List` / `Song
  List`); platform picks per its frame (web supports both responsively; mobile uses the flat list).
- **Alphabetical index:** an A–Z scrubber (`AlphabeticalScrollView`/`AlphabeticalScrollBar` already
  exist) keyed to `first_letter`; tapping a letter jumps to that section. Grouping/sort key is the
  stable Latin `primary_title` so the index does not reshuffle when `listLanguage` changes.
- **Library (Author) variants:** the same list filtered to one author (the target of song-detail's
  deferred author-tap) — header shows the author, list shows only their songs.

## States

- **Loading:** none needed — the manifest is bundled and read synchronously offline.
- **Empty:** only the author-filtered view can be empty (unknown author) — show a simple empty state.
- **Offline:** fully functional (bundled manifest).

## Interactions

- Tap row → [song-detail](song-detail.md) for that `uid`, preserving list scroll on back.
- Tap A–Z letter → scroll to section.
- Tap author (in a row or the Library (Author) header) → author-filtered variant of this screen.
  **This unlocks the author-tap navigation that song-detail deferred.**
- Search affordance → [search](search.md).

## Per-platform notes

- **iOS:** `LibraryView.swift` + `SongsGridView.swift`/`SongListItem.swift`; `LibraryViewModel`
  over the repository's manifest; `AlphabeticalScrollView` for the index; reads `ReaderSettings`.
- **Android:** `LibraryScreen.kt` + `SongsSection`/`SongListItem` + `AlphabeticalScrollBar`;
  `LibraryViewModel` over the manifest.
- **Web:** `pages/songs/index.tsx` + `SongListItem`/`SongCard`; the manifest is embedded at build
  time; A–Z via anchors/scroll.

## Verification

- **Visual:** matches `Songs`/`Flat Song List`/`Library_Songs` (list rows + A–Z index) and
  `Library (Author)` (filtered) per platform.
- **Behavioral:** all songs listed; A–Z jump works; row tap → correct song; changing
  `listLanguage` re-renders titles without reshuffling the index; author-filter shows only that
  author's songs; works offline.

## Change log

- **v1** — Initial spec: manifest-driven catalog list with A–Z index, card/flat presentations,
  `listLanguage`-aware titles with stable Latin sort, and the author-filtered (Library-Author)
  variant that unlocks song-detail's deferred author navigation.
