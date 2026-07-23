# Screen — URL resolution & 404

**Spec version:** 1

**Figma frames:** none — built behaviorally. The layout below is descriptive of the shipped web
implementation, not a frozen visual contract.

## Purpose

Rescue a URL that would otherwise 404, and when it can't be rescued, land the reader on a branded,
useful not-found page rather than a dead end.

The site is a **static export**, so there is no server to answer `/songs/n9` with a `301` — but the
information needed to do it is already shipped to the browser in `/search-index.json` (the same file
the command palette searches). Resolution therefore runs **client-side, on mount**, before any 404
copy is shown.

Why it's needed: song uids are **case-sensitive** in the route (`/songs/N9` is a page, `/songs/n9`
is not), and links get retyped by hand, lowercased by chat clients, and shortened to a bare
`/akrodha` in conversation. Every one of those is a reader who knows exactly what they want.

## Data bindings

- `/search-index.json` (emitted by `scripts/gen-markdown.mjs`) — an array of `ISearchEntry`
  (`type`, `label`, `subtitle?`, `href`, and `code?` = the song uid). Songs, books, topics, authors,
  tags and reciters are all indexed.
- The resolver reuses the **same fuzzy ranker** as the palette (`services/search.ts` `scoreText`),
  so navigation-by-URL and search-by-name agree on what "close" means.
- Pure and client-safe: `services/urlResolver.ts` `resolvePath(pathname, entries)` has no I/O; the
  404 page fetches the index and feeds it in.

## Behavior — `resolvePath(pathname, entries)`

Two passes, most-certain first. Returns `{ href, via: 'case' | 'fuzzy' }` or `null` (show the 404).

**Scope is read from the path shape first:**

| Path shape | Example | Scope searched |
|------------|---------|----------------|
| One segment | `/akrodha` | **Everything** (global) |
| Two segments, known collection prefix | `/songs/n9`, `/books/saranagati` | **That collection only** (`songs`→song, `books`→book, `topics`→topic) |
| Two segments, unknown prefix | `/resources/typo` | Left alone (`null`) |
| Three+ segments | — | Left alone (`null`) |

A two-segment path names one collection, so it must resolve **inside** it — `/songs/na9` can never
land on a book.

**Pass 1 — case fix (always safe).** Lowercase both sides and look for a page whose final segment
matches. Covers any casing (`n9`, `N9`, `gp10`). Top-level routes (`/songs`, `/about`, …, in
`STATIC_ROUTES`) join this pass **only when nothing scopes the path**, so `/ABOUT` is fixed but
`/songs/settings` is not treated as a page. If the path is already the canonical spelling of a real
page (so it 404'd for some other reason), it returns `null` rather than risk a redirect loop.

**Pass 2 — fuzzy, only when the answer isn't in doubt.** Score every candidate's `label` (and, for
songs, its `code`) against the term. Two guards, both must pass:
- `bestScore ≥ 60` (`FUZZY_MIN_SCORE`) — the ranker's **substring tier**: the typed path is
  literally *contained* in the target's name (`akrodha` ⊂ `akrodha paramananda`), not merely sharing
  tokens. A wrong redirect is worse than a 404 (it destroys the evidence of what was asked for), so
  anything softer falls through.
- `bestScore ≥ runner-up × 1.15` (`FUZZY_MIN_MARGIN`) — the winner must clearly beat the second
  place. `80` vs `79` is an ambiguous path (a word shared by several songs); picking one is a coin
  flip performed on the reader's behalf, so it shows the 404 instead.

Author/tag/reciter rows are **filters** (`/songs?tag=…`), not paths — they share the `/songs`
segment with the library route, so they can never be addressed by segment (Pass 1 skips them) and
take part in fuzzy matching only.

Every `href` returned comes from the index or `STATIC_ROUTES`, so a redirect can never bounce into
another 404.

## The 404 page (`pages/404.tsx`)

- On mount, reads `window.location.pathname` (not `router.asPath` — this file is also served as the
  static `404.html` for addresses the router never routed to), fetches `/search-index.json`, and
  calls `resolvePath`. A hit → `router.replace(href)` (**replace**, not push, so the mistyped URL
  isn't left in the back stack). A miss, or the fetch failing, → the 404 content.
- **`RESOLVE_TIMEOUT_MS = 2500`** — a stalled index request must never leave the reader on a spinner;
  after the timeout the 404 content shows regardless.
- **States:** `resolving` ("Looking for that page…") → `redirecting` ("Found it — taking you
  there…") or `not-found`. The resolving/redirecting copy is deliberately neutral and short-lived —
  for the many URLs that *do* resolve, announcing "missing" and then navigating away would be a lie
  with a flash attached.
- **Not-found content:** a branded logo, "404 — not in the songbook", "This page has wandered off",
  a warm apology that puts the fault on the app, and a grid of **five front-door destinations**
  (Home, Songs, Tracks, Books, Topics) plus a ⌘K search hint. The destinations use **`next/link`**,
  never a bare `<a>` — a real document load would tear down the app-root `PlayerProvider` and cut off
  whatever is playing.
- **`<noscript>`:** without scripting the resolver can't run, so the prerendered "looking…" status
  is hidden by CSS and a plain 404 verdict is shown; the destination links are always mounted.
- Marked `robots: noindex`.

## Per-platform notes

- **Web:** shipped (`pages/404.tsx`, `services/urlResolver.ts` + `urlResolver.test.ts`).
- **iOS / Android:** n/a — native apps navigate by object, not by typed URL, so there is no
  equivalent surface. (If deep links are added later, the same case-fold + scoped-fuzzy rules apply.)

## Verification

- **Behavioral:** `/songs/n9` redirects to `/songs/N9` (case); a bare `/akrodha` finds its song
  globally; `/songs/<near-miss>` resolves inside songs only and never onto a book; an ambiguous or
  too-weak term shows the 404 instead of guessing; the canonical URL of a genuinely missing page
  shows the 404 without looping; with JS disabled the 404 renders its links, not a spinner; a
  redirect never lands on another 404.
- **Unit:** `urlResolver.test.ts` covers the scope split, both thresholds, and the self-loop guard.

## Change log

- **v1** — Initial spec, written after the fact for the shipped web resolver + branded 404:
  case-insensitive uid/route fixing, scope-aware fuzzy matching with the score-60 / 1.15× margin
  guards, and the on-mount resolve-then-fall-back-to-404 flow.
