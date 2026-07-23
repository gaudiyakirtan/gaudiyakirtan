# Prompt: build a balanced search engine (titles + content, jointly optimized)

> Copy everything below into a fresh agent session started in `search-lab/`.

---

You are working in `search-lab/`, a zero-dependency Node benchmark for song search.
Read `README.md` first — it documents the engines, corpora, flags, and every prior result.

## Goal

Design and implement one engine in `src/engines.mjs` that is **jointly optimal across both
ground-truth sets**, on the `titles-latn+content` corpus:

- **Titles truth** — 231 real recorded title lookups (`--truth titles`, the default).
  Genuine misspellings: transpositions, run-together words, sound-alike spellings.
- **Content truth** — 500 content queries (`--truth content`): 250 hand-written
  (recall fragments, semantic paraphrases, native script, English) + 250 synthetic
  (regenerable, distribution measured from the real attempts).

Optimize **accuracy and latency together**. The objective is the **minimum** of title-R@1 and
content-R@1 — a point on neither axis may be bought by sacrificing the other. Ties broken by
MRR, then p50.

## Baselines to beat (single engine, same state, both truth sets)

| | title R@1 | content R@1 | p50 |
|---|---|---|---|
| current (linear `scoreText`) | 65.8% | **84.8%** | ~70–160 ms — disqualifying |
| trigram-fielded | 76.6% | 35.4% | 0.4 ms |
| cascade | **87.0%** | 31.6% | 0.1 ms |

Beat **max(87.0 title, 84.8 content)** is not required; beating **min** is: your engine must land
**≥ 80% on both** truth sets with p50 well under 1 ms. Nothing existing comes close to both at once.

## Known failure mechanics — do not rediscover these, build on them

1. **Class imbalance is the trap this lab already fell into once.** The cascade engine was tuned
   on the 231 title attempts alone; the sweep happily learned `wContent=0.1` and a title-only
   confidence gate, which scores 4.4% R@1 on synthetic content queries. Every weight you tune must
   be scored against **both** truth sets in the same sweep, never one.
2. **Pooling a song's ~24 lines into one bag of n-grams drowns everything** (trigram 79.7% → 23.4%
   when content was pooled in). Index **lines as separate documents** and aggregate line→song
   (max or noisy-or), the way the linear ranker accidentally does — that is why it wins content
   at 84.8% despite costing 100+ ms.
3. **Titles and content need different matchers.** Title queries are misspelled → character
   trigrams win (BM25 has no exact token to look up). Content queries contain words people can
   spell → BM25/exact tokens win and trigram loses. Field-appropriate matchers, fused per song.
4. **A title-first early-exit gate is structurally biased**: a content query that vaguely
   resembles some title returns "confidently" wrong without content ever being consulted. If you
   keep a gate for latency, it must require the title winner to also beat the **content** signal,
   or only fire on very high absolute title coverage.
5. **Rerank signals that carried title accuracy** (keep them, they are cheap and in
   `src/engines.mjs` already): prefix-window Levenshtein (people type the front of a title and
   stop), sorted-character similarity (`asktam`/`aṣṭakam` transpositions), infix alignment
   (`chatinya` inside `sricaitanyastakam`), word order via whole-string comparison.
6. **~15 of the title attempts are unresolvable ties** (`śrīguru-paramparā` ×5, `śocaka (1)/(2)/(3)`).
   Title R@1 ceiling is roughly 90%; do not burn time past it. R@5 is the fairer headline.

## Method

1. Run both baselines yourself before changing anything:
   `node bench.mjs --corpus titles-latn+content` and the same with `--truth content`.
2. Implement the engine behind the existing interface — `build(docs) → state`,
   `search(state, q, k) → [{ref, score}]` — and add it to `ENGINES`. Docs carry
   `{title[], content[]}` fields; the corpus stays untouched.
3. Expose every tunable in one exported params object. Sweep with a scratch script that scores
   **both truth sets per configuration** and prints `min(R@1)` alongside each; select on that.
4. Diagnose by failure class, not aggregate: `--misses <id>` and `--inspect <id>` on both truth
   sets, and the per-style R@1 breakdown the content bench prints (recall / fragment / script /
   semantic / english / synthetic). A fix should name the failure class it targets.
5. Latency: measure p50/p95 on both sets. Reuse typed-array accumulators; per-line indexes are
   bigger, so cap or skip postings for grams/tokens that occur in most lines (their idf is ~0
   anyway). Keep build under ~500 ms.
6. When finished: run the full `node bench.mjs` (all corpora) and `--truth content`, update both
   results sections of `README.md` from one run, and state plainly that tuned figures are
   in-sample. Note which structural choices (not weights) you expect to transfer.

## Honesty rules

- Never quote a number you did not just reproduce.
- If a change helps one truth set and hurts the other, report both movements — the min objective
  exists precisely so this cannot be hidden.
- Synthetic content queries are regenerable (`node data/gen-content-queries.mjs --seed N`): after
  tuning, re-score once on a fresh seed and report both figures; a large gap means you overfit
  the sample, not the distribution.
