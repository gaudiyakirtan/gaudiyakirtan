# Translation

**Spec version:** 1

> Conventions (language codes, types) are in [`README.md`](README.md).

## Purpose

A `Translation` is the full-meaning rendering of a single [Verse](verse.md) into one human language.
Where [WordToWord](verse.md) gives per-word glosses, a `Translation` gives the connected prose
meaning of the whole stanza. A verse may carry translations in several languages.

## Fields

> Field names below are the literal canonical-JSON keys (snake_case; see [`README.md`](README.md)).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `language_code` | languageCode | yes | Target language, ISO 639-3, e.g. `eng`, `hin`. |
| `text` | list<string> | yes | The translation, as one or more display lines/paragraphs. |
| `source` | enum(human, generated) | no | Provenance. `generated` = produced by a translation agent; `human` = hand-authored/verified. Defaults to `human` when absent. |

## Invariants

- `(verse, language_code)` is unique — at most one translation per language per verse.
- `text` is non-empty; an absent translation is represented by omitting the entry, never by an empty
  or placeholder string. (The legacy sentinels `"NULL"` / `"UNDEFINED"` must never appear in
  canonical data.)
- `language_code` need not equal the song's `language_of_origin` (e.g. a Bengali song with an
  English translation).

## Example

```jsonc
{
  "language_code": "eng",
  "source": "generated",
  "text": [
    "The noble Nityānanda Prabhu, the personification of supreme transcendental bliss, is never angry.",
    "Devoid of all false ego, He wanders throughout the town."
  ]
}
```

## Platform notes

- Translations are optional to display; the Settings screen controls whether they appear under each
  verse and in which language(s).
- `source = generated` may be surfaced subtly in UI (e.g. an "auto-translated" hint) so readers know
  it is not yet human-verified.

## Change log

- **v1** — Initial canonical spec, including `source` provenance and the ban on legacy placeholder
  sentinels.
