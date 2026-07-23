# Verse

**Spec version:** 2

> Conventions (script codes, standards, master-text flags, snake_case JSON, types) are in
> [`README.md`](README.md). Field names below are the literal canonical-JSON keys.

## Purpose

A `Verse` is one ordered stanza of a [Song](song.md). It holds the **master text** (the canonical
ISO 15919 Latin lines), every **script rendering** of that text, the **word-to-word** glossary, and
the full [Translations](translation.md). A verse is the unit the reader sings from and the unit the
song-detail screen lays out.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `verse_number` | integer | yes | 1-based label of the stanza. Display only — never used to reorder. |
| `source_text_master` | list<string> | yes | Master lines in ISO 15919 Latin, with inline `[FLAG_*]`. One string per line. |
| `display_scripts` | list<DisplayScript> | yes | The master rendered into each supported script. |
| `word_to_words` | list<WordToWord> | no | Per-word glossary in one or more language/scripts. |
| `translations` | list<Translation> | no | Full-meaning renderings. See [`translation.md`](translation.md). |

### Value objects owned by Verse

**DisplayScript** — the verse's lines rendered in one script.
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `script_code` | scriptCode | yes | Target script, e.g. `Beng`, `Deva`, `Latn`, `Cyrl`. |
| `standard` | string \| null | no | Romanization scheme when `script_code = Latn` (`IAST`, `ISO15919`, `BBT_Roman`, `GVP_Roman`); `null` otherwise. Open string, not an enum. |
| `text` | list<string> | yes | Rendered lines, flags resolved. Line count matches `source_text_master`. |

**WordToWord** — the ordered per-word glossary for one language rendered in one script.
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `language_code` | languageCode | yes | Gloss language, e.g. `eng`, `hin`. |
| `script_code` | scriptCode | yes | Script the *headwords* are written in. |
| `standard` | string \| null | no | Romanization scheme when `script_code = Latn`; `null` otherwise. Open string (see README). |
| `words` | list<[string, string]> | yes | Ordered `[headword, gloss]` pairs, in reading order. |

## Invariants

- `source_text_master` is non-empty and is the single source from which every `display_scripts`
  entry is generated (see [`pipeline.md`](pipeline.md)). Scripts are never authored by hand.
- Every `display_scripts[].text` has the **same line count** as `source_text_master`.
- Master-text flags (`[FLAG_*]`) appear **only** in `source_text_master`; they must be resolved (not
  literally present) in every `display_scripts` entry and in display.
- `word_to_words[].words` preserves reading order; order is meaningful and must not be sorted.
- A verse within a song is identified by its position; `verse_number` may repeat/skip across songs
  and is purely a printed label.

## Example

```jsonc
{
  "verse_number": 1,
  "source_text_master": [
    "jaya jaya gurudeba śrībhaktiprajñāna",
    "parama mohana rūpa ārta[FLAG_HYPHEN_ALPHA]bimocana 1"
  ],
  "display_scripts": [
    { "script_code": "Beng", "standard": null,
      "text": ["জয় জয় গুরুদেব শ্রীভক্তিপ্রজ্ঞান", "পরম মোহন রূপ আর্তবিমোচন ১"] },
    { "script_code": "Deva", "standard": null,
      "text": ["जय जय गुरुदेब श्रीभक्तिप्रज्ञान", "परम मॊहन रूप आर्तबिमॊचन १"] }
  ],
  "word_to_words": [
    { "language_code": "eng", "script_code": "Latn", "standard": "IAST",
      "words": [["jaya", "glory"], ["gurudeba", "spiritual master"]] }
  ],
  "translations": [ /* see translation.md */ ]
}
```

## Platform notes

- The song-detail screen composes, per verse: the reader's chosen script (from `display_scripts`),
  optionally the word-to-word, optionally the translation — toggled in Settings.
- Rendering must keep line alignment between master, chosen script, and word-to-word for long
  compounds and Indic scripts.

## Change log

- **v2** — `standard` corrected from `enum(ISO15919, IAST)` to an **open string** (corpus ships
  `IAST`, `BBT_Roman`, `GVP_Roman`, and `null`); `script_code` noted to include `Cyrl`. (Found by
  Android implementer during slice-1 decode; verified against every song.)
- **v1** — Canonical spec aligned to pipeline output: `source_text_master` + generated
  `display_scripts` (`text` lines) + `word_to_words` + `translations`, with line-count and
  flag-resolution invariants. Field names are the literal snake_case JSON keys.
