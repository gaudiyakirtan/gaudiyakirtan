# Data Pipeline

**Spec version:** 1

> Conventions (flags, scripts, standards, language codes) are in [`README.md`](README.md).

## Purpose

The pipeline turns the **legacy song corpus** into the **canonical dataset** the apps ship. It is
platform-agnostic data preparation (implemented in Python at `pipeline`), and its
**output contract** is the entity specs in this folder: every song it emits must be a valid
[Song](song.md) with valid [Verses](verse.md), [Translations](translation.md), and a
[Manifest](manifest.md) entry.

The apps never see the legacy format; they consume only pipeline output.

## Inputs and outputs

| | Location | Shape |
|--|----------|-------|
| **Input** | `pipeline/songs/*.json` (~703) | Legacy word-stream format (`{w,h,s,o}` per token) |
| **Output** | canonical song files + `manifest` | This folder's specs |

Two **overlay** builders run separately from the song conversion above. They consume the finished
corpus rather than the legacy input, and emit grouping/lookup data referencing songs by `uid`:

| Builder | Emits | Spec |
|---------|-------|------|
| `build_song_groups.py` | `song_groups.json` | [`collections.md`](collections.md) |
| `build_calendar.py` | `calendar.json` | [`calendar.md`](calendar.md) |

Both write into all three platform data directories and validate before writing —
`build_calendar.py --check` validates without writing. Because they reference songs by `uid`,
re-run them after any change that adds, removes, or renumbers songs.

## Stages (high level)

```
Legacy JSON (word-stream, native script, mostly untranslated)
   │
1. Parse legacy → intermediate  (convert ⬅1-style markers into master-text flags)
   │
2. Build master text            (ISO 15919 Latin lines with [FLAG_*] markers)   → Verse.sourceTextMaster
   │
3. Fix mixed-script issues      (clean stray scripts / truncations in the master)
   │
4. Generate transliterations    (Aksharamukha: master → each scriptCode)        → Verse.transliterations
   │
5. Build word-to-word           (align tokens; fill missing glosses via Claude) → Verse.wordToWords
   │
6. Generate translations        (fill missing full translations via Claude)     → Verse.translations (source=generated)
   │
7. Assemble Song + Manifest     (titles, author ref/display, topics, audio, md5)→ Song, Manifest
   │
Canonical dataset (bundled, offline-first)
```

## Contract rules

- **Master is authoritative.** ISO 15919 Latin (`source_text_master`) is the one hand-owned text;
  every script in `display_scripts` is *generated* from it and must round-trip (line counts match,
  flags resolved). Never author a non-Latin script by hand.
- **Flags are resolved in ALL rendered text, not just verses.** `[FLAG_*]` markers must be resolved
  wherever text is displayed — `title_main`, `author_display`, and `notes` included, not only
  `display_scripts`. (`[FLAG_HYPHEN_ALPHA]` → `-` in roman; other flags stripped.) A leaked flag in a
  title is a data bug — see `fix_title_flags.py`, which the canonical output now passes.
- **No placeholders in output.** Legacy sentinels (`"NULL"`, `"UNDEFINED"`, empty synonym maps) must
  be resolved or omitted — they must not reach canonical data (see [`translation.md`](translation.md)).
- **Provenance is recorded.** Anything the Claude step produces is marked `source = generated` so it
  can later be human-verified.
- **Deterministic identity.** A song's `uid` is preserved from legacy; its `md5` is computed over the
  canonical file so the Manifest can detect changes for offline sync.

## Verification

Pipeline output is verified against the entity specs (conformance) and by spot-rendering songs in
the apps (behavioral) — the same two-layer standard as code (see [`../WORKFLOW.md`](../WORKFLOW.md)).
A spec change here or in any entity doc is a trigger to re-run the affected stage.

## Change log

- **v1** — Initial spec: legacy → canonical stages, master-authoritative rule, no-placeholder rule,
  generated-provenance rule, deterministic identity/hash.
