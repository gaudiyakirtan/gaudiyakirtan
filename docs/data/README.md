# Data Specifications

Platform-agnostic specifications for the core data entities and data flows of Gaudiya Kirtan.
These docs are the **source of truth** for data (see [`../WORKFLOW.md`](../WORKFLOW.md)). iOS,
Android, and Web all derive their models and data layers from here.

These specs describe *what* is stored and *what* each field/step means — precisely enough to be
unambiguous, but without any platform-specific types or code. There is no codegen; each platform
implements idiomatically.

---

## Entity Index

| Spec | Entity | Role |
|------|--------|------|
| [`song.md`](song.md) | **Song** | Aggregate root — a single kirtan/bhajan |
| [`verse.md`](verse.md) | **Verse** | An ordered stanza; owns transliterations & word-to-word |
| [`translation.md`](translation.md) | **Translation** | A full-language rendering of a verse's meaning |
| [`author.md`](author.md) | **Author** | The ācārya / composer of songs |
| [`collections.md`](collections.md) | **Book / Topic / Collection** | Groupings of songs |
| [`manifest.md`](manifest.md) | **Manifest** | Lightweight catalog index for listing/sync |
| [`calendar.md`](calendar.md) | **Calendar** | Lunar-month overlay — which songs suit which time of year |
| [`pipeline.md`](pipeline.md) | **Data Pipeline** | Old format → canonical format, transliteration, translation |

---

## Shared Conventions

All entity specs use these conventions. Defined once here; referenced everywhere.

### Identifiers (`uid`)
A stable string key: a source/section letter-prefix + number. Examples: `A1`, `M3`, `RK14`, `MS24`,
`N9`. A `uid` never changes once assigned; it is how songs, authors, and collections cross-reference
each other.

### Language codes (`languageCode`, `languageOfOrigin`)
**ISO 639-3**, three lowercase letters. In use: `ben` (Bengali), `san` (Sanskrit), `hin` (Hindi),
`eng` (English). Every human-language field is tagged with one.

### Script codes (`scriptCode`)
**ISO 15924**, four letters, initial-cap. Present in the shipped corpus (10): `Latn` (Latin/roman),
`Beng` (Bengali), `Deva` (Devanagari), `Orya`, `Gujr`, `Knda`, `Telu`, `Mlym`, `Taml`, and `Cyrl`
(Cyrillic, for transliteration into Russian orthography). Any text that can be rendered in multiple
scripts carries a `scriptCode`.

### Transliteration standard (`standard`)
An **open string** naming the romanization scheme; only meaningful when `script_code = Latn`, and
`null` for non-Latin scripts. Known values in the shipped corpus: `IAST`, `ISO15919`, `BBT_Roman`
(Bhaktivedanta Book Trust roman), `GVP_Roman` (Gaudiya Vedanta Publications roman). Model it as a
string, **not a closed enum** — new schemes may appear. The **master** verse text is ISO 15919
Latin; all other scripts (and alternate roman schemes) are generated from it (see
[`pipeline.md`](pipeline.md)).

### Master-text flags
The master transliteration embeds inline flags marking transliteration edge-cases that scripts
render differently. They are stripped/interpreted when generating each script. Current flags:

| Flag | Meaning |
|------|---------|
| `[FLAG_HYPHEN_ALPHA]` | Alphabet-only hyphen (compound join), not a spoken pause |
| `[FLAG_PULLBACK]` | Pullback conjunct at a line break |
| `[FLAG_DROP_INHERENT]` | Dropped inherent vowel (Bengali) |
| `[FLAG_BV]` / `[FLAG_JY]` | B/V and J/Y distinction to preserve when transliterating |

> The flag list is authoritative here. Adding a flag is a spec change to this file (bump version).

### Field naming (canonical JSON)
The **canonical on-disk JSON is `snake_case`** — this is exactly what the pipeline emits and what
each app decodes (`title_main`, `source_text_master`, `display_scripts`, `author_uid`,
`word_to_words`, `audio_available`, …). The field names in these specs are the literal JSON keys, so
there is no ambiguity about what is stored. Each platform maps them to its own idiom at decode time
(camelCase in TS/Swift/Kotlin) — that mapping is a platform detail, not a schema change.

### Types used in specs
`string`, `integer`, `boolean`, `list<T>`, `ref<Entity>` (a `uid` referencing another entity),
`enum(...)`, and inline object shapes `{ field: type, ... }`. `?` marks an optional field.

---

## Entity Doc Template

Every entity spec follows this structure so implementers and the verifier always know where to look:

1. **Spec version** — integer, bumped on every change; the number platforms conform to.
2. **Purpose** — one paragraph: what it is and why it exists.
3. **Fields** — a table: `field | type | required | description`, plus notes for non-obvious rules.
4. **Invariants** — rules that must always hold (ordering, uniqueness, referential integrity).
5. **Example** — one concrete instance.
6. **Platform notes** — semantic guidance per platform (naming, storage), never code.
7. **Change log** — what changed at each spec version.

---

## Canonical vs. Legacy

The **canonical** shape defined by these specs is the target. The legacy on-disk format
(`pipeline/songs/*.json`, the word-stream `{w,h,s,o}` model) is the *input* to the pipeline,
not the contract. Apps consume only canonical data. See [`pipeline.md`](pipeline.md) for the
old → canonical mapping.
