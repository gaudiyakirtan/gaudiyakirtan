# Screens — About & Contact

**Spec version:** 1

**Figma frames:** **none.** Both post-date the Figma file, so the screen verifier's **visual layer
cannot run**; they ship behaviorally-verified only. Draw frames before calling them done.

## Purpose

Two static content pages reachable from the sidebar footer:

- **`/about`** — what this collection is, how big it is, how the text is prepared, and **who it
  comes from**.
- **`/contact`** — how to send a correction, and what to include so it is actionable.

### Why these exist

The corpus previously carried a placeholder "song" (`A0`, authored by "The Gaudiya Kirtan Team")
whose body was an app announcement — a beta notice pinned to a past festival. Using a song record
as a message channel put non-song content into every song list, search index and count. About is
the proper home for that content; `A0` has since been removed from the corpus (702 songs, not 703).

## Data bindings

**`/about`** reads counts from the shipped corpus at **build time**, so the page cannot drift as
songs are added or removed:

| Figure | Source |
|--------|--------|
| songs, songs with a recording, authors | [`manifest.md`](../data/manifest.md) |
| books, topics | [`collections.md`](../data/collections.md) |

Never hardcode a count. `A0`'s removal changed three of them in one commit; a hardcoded page would
have silently lied.

**`/contact`** binds only to config (`CONTACT_EMAIL`, `PROJECT_SITE`).

## Layout & regions

### `/about`

1. What the collection is.
2. **The collection** — a stat grid (songs · with recordings · authors · books · topics · scripts).
3. **How the text is prepared** — one ISO 15919 master per verse, all other scripts generated from
   it, so a correction propagates once; inline flags for the lossy cases. Links to the pronunciation,
   diacritics and meter guides.
4. **Sources and acknowledgements** — see below.
5. **This edition** — actively developed; gaps shown honestly rather than filled.

### `/contact`

Four cards for what is worth sending — a correction to a song, a missing song, a missing
translation, an app problem — each naming the detail that makes it actionable (song title + verse
number; device + script).

## Attribution (required, not optional)

About **must** credit *Śrī Gauḍīya Gīti-guccha — An Anthology of Gauḍīya Vaiṣṇava Songs* (Abridged
Edition, 7th ed., February 2016), compiled under the guidance of Śrī Śrīmad Bhaktivedānta Nārāyaṇa
Gosvāmī Mahārāja, published by Gaudiya Vedanta Publications — the source of the songs, their
arrangement into books and topics, and the English translations.

Its front matter licenses **the text** under Creative Commons Attribution–NoDerivatives 4.0
International, and **explicitly excludes design, photographs and artwork**. Those are not
reproduced. State both facts on the page; this is a store-submission concern, not a courtesy.

## States

| State | Behavior |
|-------|----------|
| **No contact address published** | `CONTACT_EMAIL` is `null` → render a "not published yet" note pointing at the project site. **Never** render a `mailto:` to a placeholder address: it would silently swallow every correction someone took the trouble to write. |
| **Address published** | Render the `mailto:` link. |

## Interactions

Read-only. Outbound links only (guides, project site, `mailto:` when configured).

## Per-platform notes

**Web.** Both live in the **sidebar footer**, as icon-only actions — see
[`navigation.md`](navigation.md). `/about` is statically generated (`getStaticProps` for counts);
`/contact` is fully static.

**iOS / Android.** Not built. When they are, the counts must come from the bundled corpus the same
way — not from a hardcoded string in a resource file.

## Verification

**Behavioral:**
- Counts on `/about` match the shipped corpus (currently 702 / 244 / 83 / books / topics).
- With `CONTACT_EMAIL` unset, `/contact` shows the "not published" state and renders **no**
  `mailto:` link; with it set, the link appears.
- The Gīti-guccha attribution and the CC BY-ND 4.0 / artwork-excluded statement are both present.
- Both pages reachable from the sidebar footer, and both have a `<title>`.

**Visual:** blocked — no Figma frames exist.

## Change log

- **v1** — Initial spec: build-time counts, required attribution, the no-placeholder-`mailto:` rule,
  and the `A0` background that motivated About.
