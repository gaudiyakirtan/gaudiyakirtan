# Gaudiya Kirtan — Documentation

A native, offline-first repository of Gauḍīya Vaiṣṇava songs, built for **iOS (Swift)**, **Android
(Kotlin)**, and **Web (Next.js)** from one shared corpus. These docs are **doc-driven**: the specs
are the source of truth, and code is verified against them — not the other way round.

## Start here

- **[`WORKFLOW.md`](WORKFLOW.md)** — the operating model: the SPEC → IMPLEMENT → VERIFY loop and the
  orchestrator / implementer / verifier roles.
- **[`implementation-mapping.md`](implementation-mapping.md)** — the **conformance matrix**: the one
  status board of spec × platform × verifier status. Look here for "what's shipped where".
- **[`../ROADMAP.md`](../ROADMAP.md)** — the release plan and open tracks.

## The two spec tiers

**[`data/`](data/) — the data source of truth.** Platform-agnostic, versioned specs for what is
stored. Field names are the literal snake_case JSON keys the pipeline emits.

| Spec | What |
|------|------|
| [`data/README.md`](data/README.md) | Conventions: uid, ISO 639-3 / 15924 script codes, master-text flags, the shared doc template |
| [`song.md`](data/song.md) · [`verse.md`](data/verse.md) · [`translation.md`](data/translation.md) | The song aggregate, its stanzas, and full-language renderings |
| [`author.md`](data/author.md) · [`collections.md`](data/collections.md) | Composers; and Book / Topic / Collection groupings |
| [`manifest.md`](data/manifest.md) | The lightweight catalog index the lists read |
| [`calendar.md`](data/calendar.md) | The lunar-month → song overlay |
| [`pipeline.md`](data/pipeline.md) | Legacy → canonical conversion + the overlay builders (code in [`../pipeline/`](../pipeline/), raw inputs in [`../pipeline/SOURCES.md`](../pipeline/SOURCES.md)) |

**[`screens/`](screens/) — behavior.** What each screen *does* and which data it binds. **Figma owns
the pixels** (`../../Gaudiya Kirtan UI/*.png`); these specs capture behavior, states, data-binding,
and cross-platform structure. See the **[screens index](screens/README.md)**. Highlights: the unified
[player](screens/player.md), the [command-palette search](screens/search.md), the
[Tracks](screens/tracks.md) library, [URL resolution + 404](screens/url-resolution.md),
[navigation](screens/navigation.md), the [Gaura/Shyam theme](screens/theme.md), and shared
[components](screens/components.md).

## Reference

- [`theme/colors.md`](theme/colors.md) · [`theme/icons.md`](theme/icons.md) · [`theme/typography.md`](theme/typography.md) — palette, icon pack, brand font.
- [`theme/haptics.md`](theme/haptics.md) — the native haptic vocabulary: the implemented seek-rail ladder, and the proposed surfaces after it.
- [`store-readiness.md`](store-readiness.md) — app-store checklist.
- Build/run commands and code style live in the repo-root [`../CLAUDE.md`](../CLAUDE.md).

## Doc conventions

Every spec follows one template (declared in [`data/README.md`](data/README.md)): **spec version →
purpose → fields / data-bindings → invariants → example → platform notes → change log.**

Corpus totals (song / author / book counts) are **deliberately not written into prose** — they go
stale the moment the corpus changes. Specs describe *shape and behavior*; the live numbers come from
the data itself (`web/src/data/manifest.json` and friends).

> **Legacy note.** An earlier pre-spec generation of these docs — `architecture/`, `shared/models.md`,
> and the per-platform `ios|android|web/implementation.md` files — has been **retired**. It was
> superseded by the `data/` + `screens/` tiers and the conformance matrix above, and had drifted to
> describe file layouts and a `Song` model that no longer exist. If an old link led you here, that's
> why.
