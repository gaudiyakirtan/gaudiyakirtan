# Song

**Spec version:** 2

> Conventions (uid, language/script codes, snake_case JSON, types) are in [`README.md`](README.md).
> Field names below are the literal canonical-JSON keys (what the pipeline emits, what apps decode).

## Purpose

A `Song` is the aggregate root of the data model: one complete kirtan or bhajan. It carries its
identity, its titles across scripts, a reference to its author, its groupings (topics/tags), its
ordered verses, and its audio. Everything a screen needs to render a song is reachable from a
`Song`. Songs are read-only content shipped with the app (offline-first); never edited at runtime.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | string | yes | Stable identifier, e.g. `"N9"`. Never changes. |
| `language_of_origin` | languageCode | yes | ISO 639-3 language the song was composed in, e.g. `ben`. |
| `title_main` | list<ScriptText> | yes | The title in one or more scripts. ≥1 entry (native + Latn/IAST). |
| `author_uid` | ref<Author> | yes | The composing ācārya. `"?"` if unknown (see invariants). |
| `author_display` | list<ScriptText> | yes | Denormalized author name(s) for display without a join. |
| `topics` | list<ref<Topic>> | no | Topic groupings this song belongs to. |
| `tags` | list<string> | no | Free-form labels (festival, mood, deity, etc.). |
| `verses` | list<Verse> | yes | Ordered stanzas. ≥1. See [`verse.md`](verse.md). |
| `notes` | list<Note> | no | Localized annotations / glossary shown with the song. |
| `audio_available` | boolean | yes | Whether any recording exists. Drives player visibility. |
| `audio_files` | list<AudioTrack> | no | Recordings. Absent/empty when `audio_available = false`. |

### Value objects owned by Song

**ScriptText** — a piece of text in one script.
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `script_code` | scriptCode | yes | Script this text is written in (`Beng`, `Latn`, …). |
| `standard` | string \| null | no | Romanization scheme when `script_code = Latn` (open string; see README). |
| `text` | string | yes | The text (single line for titles/author names). |

**Note** — one localized annotation line.
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `language_code` | languageCode | yes | Language of this note. |
| `text` | string | yes | The note/glossary text. |

**AudioTrack** — a recording reference (matches the shipped corpus).
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | string | yes | Stable track id (e.g. `"tama-2"`). |
| `filename` | string | yes | Audio filename (e.g. `"A10-tama-2.mp3"`). The playable URL is `AUDIO_BASE_URL + filename` — see [player.md](../screens/player.md). |
| `artist` | string | no | Performing artist/singer (e.g. `"Tamal Krsna das"`). |

## Invariants

- `uid` is unique across all songs and immutable.
- `title_main` and `verses` are non-empty.
- `author_uid` references an existing Author, or the sentinel `"?"` for unknown authorship; when
  `"?"`, `author_display` still provides a human-readable fallback (e.g. `"অজানা লেখক"` / "unknown").
- `verses` is ordered; render order = list order (do not sort by `verse_number`).
- **Every verse has non-empty `source_text_master`.** A verse with no source is never legitimate: if
  it carries a translation, that translation renders as a floating paragraph with no original,
  transliteration or word-for-word above it (and its presence usually means the verse *splitting* is
  misaligned, so the neighbouring translations are on the wrong stanzas too); if it carries nothing,
  it is a stray block every platform still decodes and lays out.
- **One verse = one stanza.** Packing two stanzas into a verse silently breaks translation
  alignment, since translations are per stanza — see K29 in the change log.
- **`display_scripts[].text` is line-aligned to `source_text_master`** (same line count): the scripts
  are generated line-by-line from the master, so a mismatch means a verse was edited without
  regenerating them and the reader sees the wrong script line beside a given source line.
- Enforced by `pipeline/validate_verses.py`, which exits non-zero on any of the three.
- Every `ref` (`author_uid`, `topics[]`) resolves to an existing entity in the shipped dataset.
- `audio_available == (audio_files is non-empty)`.

## Example

```jsonc
{
  "uid": "A1",
  "language_of_origin": "ben",
  "title_main": [
    { "script_code": "Beng", "text": "জয় জয় গুরুদেব শ্রীভক্তিপ্রজ্ঞান" },
    { "script_code": "Latn", "standard": "IAST", "text": "jaya jaya gurudeba śrībhaktiprajñāna" }
  ],
  "author_uid": "?",
  "author_display": [{ "script_code": "Beng", "text": "অজানা লেখক" }],
  "topics": [], "tags": [],
  "verses": [ /* see verse.md */ ],
  "notes": [],
  "audio_available": false
}
```

## Platform notes

- **iOS:** a `Codable` value type decoded from bundled JSON (snake_case → camelCase via keys/decoder);
  cached via Core Data/SQLite for offline.
- **Android:** a data class decoded from `assets/` (snake_case mapping via the JSON lib); Room-persisted.
- **Web:** a TypeScript interface; loaded at build time (`getStaticProps`) into static song pages.
- All three: `Song` is loaded fully only on the detail screen; lists use the
  [Manifest](manifest.md), not full `Song` objects.

## Change log

- **v2** — Corrected `notes` and `audio_files` shapes to match the shipped corpus (verified against
  every song): `notes` is `list<Note>` (`{language_code, text}`), not `list<string>`;
  `AudioTrack` is `{uid, filename}`, not `{id, title, url, duration_seconds}`. (Found by web
  implementer during slice-1 decode; corpus is truth for shape.)
- **v1** — Canonical spec aligned to pipeline output: identity, multi-script `title_main`, author
  ref + display, topics/tags, verses, notes, audio. Field names are the literal snake_case JSON keys.
