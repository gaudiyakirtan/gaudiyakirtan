# Manifest

**Spec version:** 1

> Conventions (uid, language/script codes, types) are in [`README.md`](README.md).

## Purpose

The `Manifest` is the lightweight catalog index of the whole song set. It lets every list, search,
and browse screen operate **without loading full [Song](song.md) objects**, and it drives
offline-sync change detection. It is the successor to the legacy `_list.json`.

A full `Song` is loaded only when the reader opens the detail screen; everything else reads the
Manifest.

## Shape

The Manifest is a list of `ManifestEntry`:

> Field names below are the literal canonical-JSON keys (snake_case; see [`README.md`](README.md)).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | ref<Song> | yes | The song this entry indexes. |
| `primary_title` | ScriptText | yes | The title to show in lists (script chosen per app default). |
| `titles` | list<ScriptText> | no | All titles, so search can match any script. |
| `author_uid` | ref<Author> | yes | For author-grouped listing without loading the song. |
| `language_of_origin` | languageCode | yes | For language filters. |
| `audio_available` | boolean | yes | To badge songs that have recordings. |
| `first_letter` | string | no | Normalized leading character for the alphabetical scroll index. |
| `md5` | string | yes | Content hash of the canonical song file, for change detection / offline sync. |

## Invariants

- One entry per song; `uid` values are unique and cover the full shipped set.
- `md5` equals the hash of that song's canonical JSON; changing a song changes its `md5`.
- Every `author_uid` and `uid` resolves within the shipped dataset.
- The Manifest is generated from the canonical songs (see [`pipeline.md`](pipeline.md)), never
  hand-maintained.

## Example

```jsonc
[
  { "uid": "N9", "primary_title": { "script_code": "Latn", "standard": "IAST", "text": "akrodha paramānanda" },
    "author_uid": "ldt", "language_of_origin": "ben", "audio_available": false,
    "first_letter": "A", "md5": "…" }
]
```

## Platform notes

- Bundled alongside the song set in every app; loaded once at startup and kept in memory / a fast
  local table.
- Search (fuzzy + optional semantic) indexes the Manifest's titles + author; results resolve to a
  `uid`, then the detail screen loads the full song.

## Change log

- **v1** — Initial canonical spec, replacing legacy `_list.json`; adds `md5` sync hash, multi-title
  search support, and `firstLetter` for alphabetical scroll.
