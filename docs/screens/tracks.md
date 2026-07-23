# Screen — Tracks

**Spec version:** 1

**Figma frames:** none — this screen was built behaviorally, without a mock. Treat the layout below
as descriptive of the shipped web implementation, not as a frozen visual contract.

## Purpose

Browse the corpus by **recording** rather than by song. The catalog has 702 songs but only 244 of
them carry audio, and those 244 carry **753 individual takes** — several artists often record the
same bhajan. [songs-list](songs-list.md) collapses all of that into one row per song, so a listener
who wants "everything Kṛṣṇadāsa recorded" has no way to see it. This screen expands the corpus to
one row per take and lets it be filtered by performer.

## Vocabulary — reciter vs author

Two different people, deliberately kept distinct everywhere:

- **Author** — the *composer* of the song (`author_uid` → [Author](../data/author.md)). Śrīla
  Bhaktivinoda Ṭhākura wrote it.
- **Reciter / artist** — who *recorded this take* (`audio_files[].artist`, see
  [song.md](../data/song.md) `AudioTrack`). 44 distinct reciters in the shipped corpus.

## Data bindings

- **Cannot be built from the [Manifest](../data/manifest.md)** — the manifest carries only
  `audio_available` (a boolean), not the takes. Rows come from the full Songs via
  `services/trackListing.ts` (server-only, fs-backed) inside `getStaticProps`.
- Each song is trimmed to `ITrackSong` (uid, `titleMain`, `authorUid`, Latin `authorName`, `tracks`,
  Latin `title`) before leaving the server — never the full `ISong`; the player never reads
  verses/translations.
- **Author renderings are shipped once, not inlined.** The 244 audio songs share only 43 authors, so
  inlining per-song script arrays cost ~206 kB of duplication. They ship as a shared
  `AuthorNames` table (`authorUid` → `IScriptText[]`, ~41 kB) and are rejoined client-side by
  `toPlayable` / `pickTrackAuthor`.
- Client-safe view model + pickers live in `services/trackListingView.ts` — kept separate from
  `trackListing.ts` for the same reason `songListingView.ts` is split from `songListing.ts`: the
  pickers run at render time and must not drag `fs` into the client bundle.
- `flattenTracks(songs)` expands songs → one `ITrackRow` per take. Row identity is
  `trackRowKey = "<songUid>:<trackUid>"` — a take's `uid` is only unique *within* its song (several
  songs each have a take called e.g. `tama-1`), so the song uid must be part of the key.

## Layout & regions

- **Heading** — `Tracks`, or the reciter's name when filtered.
- **Reciter filter** — a select listing every artist with their take count, from
  `artistsOf(rows)` (sorted by count desc). Selecting one pushes `/tracks?artist=<name>`.
- **Rows** — `TrackListItem`: title in the reader's `listLanguage`, plus a secondary line that is
  the **take's artist** (falling back to the composing author when the take has none).
- **A–Z index** — from `sectionLetterForTrack`, derived from the fixed **Latin** title so the index
  never reshuffles when `listLanguage` changes (mirrors `songListingView.sectionLetterFor`).

## States

- **Unfiltered:** all 753 rows with the A–Z index.
- **Filtered by reciter:** only that artist's takes; index hidden.
- **Offline:** fully functional — rows are bundled. Audio itself still requires network (streams
  from the S3 bucket, see [player](player.md)).

## Interactions

- Tap a row → plays that take in place via the shared player, without leaving the screen.
- Reciter select → `/tracks?artist=<name>`; clearing returns to `/tracks`.
- **Search integration** ([search](search.md)) — reciters are indexed as `type: 'reciter'` entries
  and resolve to `/tracks?artist=<name>`. A reciter is a performer, so their recordings are the
  useful destination, not the songs those takes belong to. The `/tracks` page itself is also a
  palette entry.

## Known limitation — reciter names are not script-aware

Titles and **authors** on this screen re-render in the reader's `listLanguage`; **reciter names do
not**. They stay Roman in every script setting.

This is a *data* limitation, not a rendering bug. `IAudioTrack.artist` is a plain string, and all 44
values in the shipped corpus are written **without IAST diacritics** (`'Krsnadas das'`,
`'Tamal Krsna das'`, `'Sudarsan das (Radha-ramana Babaji Maharaja)'`, `'taru'`). Feeding those
through the pipeline's Aksharamukha step would produce **phonetically wrong** native script —
`Krsnadas` lacks `ṛ`, `ṣ` and `ā`, yielding কৃস্নদস rather than কৃষ্ণদাস. This is exactly why
`pipeline/add_title_author_scripts.py` guards on `IAST_DIAC` and skips non-diacritic strings.

**Fix path** (mirrors what [author.md](../data/author.md) records for `fix_author_display.py`): curate
correct IAST for the 44 reciters, transliterate from that, ship an `ArtistNames` table alongside
`AuthorNames`, and add `pickTrackArtist(track, artistNames, listLanguage)`. The curated IAST should
be reviewed by someone who knows these devotees' names before it ships — misspelling them in a
sacred script is worse than leaving them Roman.

## Per-platform notes

- **Web:** shipped — `/tracks` (`pages/tracks/index.tsx`), `TrackListItem`, `trackListing.ts` +
  `trackListingView.ts`, sidebar entry.
- **iOS / Android:** not implemented. If added, reuse the same split (server/bundle-side trimming +
  client-side pickers) and the same shared author table, so payload behavior matches.

## Verification

- **Behavioral:** 753 rows unfiltered; reciter filter narrows to that artist's takes and the count
  matches the select; tapping a row starts that exact take; the A–Z index does not reshuffle when
  `listLanguage` changes; titles and authors re-script with `listLanguage` (reciters intentionally
  do not — see above); searching a reciter name lands on `/tracks?artist=…`.

## Change log

- **v1** — Initial spec, written after the fact for the shipped web Tracks tab. Documents the
  reciter-vs-author distinction, the shared `AuthorNames` payload optimization, search integration
  (reciter → `/tracks?artist=`), and the reciter-names-are-not-script-aware data limitation.
