# Feature — Markdown export (`.md`)

**Spec version:** 1 · **Platform:** Web

## Purpose

Appending `.md` to any content-page URL returns a clean Markdown rendering of that page, so songs,
books, topics, and indices are readable/consumable as plain text (LLM ingestion, copy-paste, sharing
the source of a verse). E.g. `/songs/N9` → `/songs/N9.md`.

## How it works

A build-time generator, `web/scripts/gen-markdown.mjs`, reads the bundled corpus
(`src/data/songs/*.json`, `src/data/song_groups.json`) and writes Markdown twins into `public/`,
which Next.js (dev, `next start`, and Vercel) serves verbatim — no server route needed. It runs on
`prebuild`/`predev` (package.json), so the twins always match the shipped data. The generated files
are git-ignored (build artifacts).

## Coverage

- **Songs** — `public/songs/<uid>.md`: romanized title + native title, author, per-verse romanized
  reading lines, native lines, word-for-word gloss (English), and translation (English).
- **Books / Topics** — `public/{books,topics}/<uid>.md`: group title, count, and a linked song list.
- **Indices** — `songs.md` (A–Z all songs), `authors.md` (with counts), `books.md`, `topics.md`,
  and a site `index.md` that points at them.

## Verification

- `curl -I /songs/N9.md` → `200 text/markdown`; body has the title, verses, gloss, and translation.
- `/books.md`, `/topics.md`, `/authors.md`, `/songs.md`, `/index.md` all resolve.

## Change log

- **v1** — Initial build-time Markdown export for songs, groups, and indices.
