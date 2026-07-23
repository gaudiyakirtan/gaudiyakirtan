# Search Lab

A bench for the two open questions in [`docs/screens/search.md`](../docs/screens/search.md):
**can we search song content**, and **can we search in any script** — measured instead of argued.

Six matching algorithms × three corpora, scored against **231 real search attempts** recorded from
the older app (`search-benchmark/search-database.csv`): genuine misspellings typed by people
looking for a song they had heard, not synthetic queries.

Zero dependencies. Zero network. Everything runs from the corpus already in this worktree.

```bash
node data/build.mjs      # regenerate artifacts from the corpus + recorded attempts
node bench.mjs           # headless: all engines × all corpora
node serve.mjs           # live UI at http://localhost:8710
```

Useful flags:

```bash
node bench.mjs --list                        # available corpus and engine ids
node bench.mjs --corpus titles-latn          # one corpus (repeatable)
node bench.mjs --engine trigram-fielded      # one engine (repeatable)
node bench.mjs --misses trigram              # every query it failed to rank first
node bench.mjs --inspect trigram-fielded     # best / median / worst queries, with what it returned
node bench.mjs --inspect trigram --top 12    # how many rows per band (default 6)
node bench.mjs --json data/gen/results.json  # machine-readable
```

`--inspect` is the one worth reaching for. An aggregate like "76.6% R@1" says nothing about
*shape*: two engines with identical R@1 can fail completely differently, and only one of those is
acceptable. Queries are ordered by reciprocal rank, then by how far the winner cleared the
runner-up — so **best** means *confidently* right rather than merely right, and the **median**
band shows what a typical query actually feels like:

```
inspect trigram-fielded on titles-latn+content
177 ranked first · 50 found but lower · 4 missed entirely

BEST     "Dara putra nija Deho Kutumba Palane"  → rank 1 (4.2× clear)
MEDIAN   "sri guru charna padham"               → rank 1 (1.3× clear)
WORST    "chatinya asktham"                     → MISSED
```

Only **4 of 231** attempts are lost outright, and one of those is a junk row
(`"super obscure song"`). The 50 "found but lower" are dominated by ties between genuinely
near-identical titles.

The live UI mirrors all of this: **Run selected corpus** scopes the sweep, and **clicking any row**
in the results table opens the same best/median/worst inspection for that engine and corpus.

### Pareto frontier

Running a benchmark also draws one **accuracy-vs-latency panel per corpus**. An engine is *on the
frontier* when nothing else in that corpus is both faster **and** more accurate — so the frontier
is the only set worth choosing from, and every point behind it is strictly a worse deal. Latency is
log-scaled (it spans 0.01 ms to 155 ms; on a linear axis every index engine collapses onto the
y-axis), and all panels share one scale so they read against each other.

The frontiers make the headline result visual:

| corpus | on the frontier |
|---|---|
| Titles (Latin only) | bm25, phonetic, **trigram** |
| Titles (all 10 scripts) | bm25, phonetic, trigram, hybrid, current |
| Latin titles + content | bm25, **trigram-fielded** |
| Everything | bm25, trigram, trigram-fielded, current |

`bm25` is always on it — but only because it is the cheapest thing available, at ~26–58% R@1. The
frontier says "not dominated", not "good". Read it with the accuracy axis, not as a ranking.

On the two title-only corpora `trigram-fielded` lands on exactly the same coordinates as `trigram`:
with an empty content field the two are the same algorithm. The chart nudges coincident points
apart rather than hiding one.

## Results

`R@k` = share of the 231 attempts where the intended song ranked in the top *k*.
`p50/p95` = per-query latency across the ground-truth set.

### Titles, Latin only — 702 docs

| engine | R@1 | R@5 | R@10 | MRR | build | p50 | p95 |
|---|---|---|---|---|---|---|---|
| current (linear `scoreText`) | 77.1% | 89.2% | 92.6% | 82.3% | 3 ms | 2.15 ms | 3.45 ms |
| BM25 + prefix | 57.6% | 71.0% | 74.9% | 63.3% | 3 ms | 0.01 ms | 0.04 ms |
| BM25 + prefix + fuzzy | 63.6% | 77.9% | 82.3% | 70.3% | 2 ms | 0.22 ms | 0.64 ms |
| **Trigram index** | **79.7%** | **94.8%** | **98.7%** | **86.0%** | 5 ms | 0.15 ms | 0.23 ms |
| Phonetic key | 59.7% | 80.5% | 84.8% | 67.8% | 5 ms | 0.07 ms | 0.35 ms |
| Hybrid (BM25+trigram+phonetic) | 74.5% | 90.9% | 93.1% | 80.7% | 10 ms | 0.44 ms | 1.13 ms |

### Titles, all 10 scripts + author — 702 docs

| engine | R@1 | R@5 | R@10 | MRR | build | p50 | p95 |
|---|---|---|---|---|---|---|---|
| current (linear `scoreText`) | 75.8% | 87.4% | 90.9% | 80.9% | 17 ms | 9.79 ms | 16.81 ms |
| BM25 + prefix | 52.8% | 68.8% | 72.3% | 59.3% | 27 ms | 0.01 ms | 0.13 ms |
| BM25 + prefix + fuzzy | 60.6% | 76.6% | 80.5% | 67.2% | 25 ms | 0.59 ms | 1.62 ms |
| Trigram index | 64.1% | 88.7% | 95.2% | 75.3% | 49 ms | 0.17 ms | 0.24 ms |
| Phonetic key | 53.2% | 74.0% | 81.4% | 62.4% | 33 ms | 0.12 ms | 1.04 ms |
| Hybrid | 67.1% | 85.3% | 89.6% | 74.9% | 98 ms | 0.92 ms | 2.74 ms |

### Latin titles + 16,620 verse lines + translations — 702 docs

The clean isolation of what *content* costs: same Latin-only titles as the first table, plus the
verse text. Nothing else changes.

| engine | R@1 | R@5 | R@10 | MRR | build | p50 | p95 |
|---|---|---|---|---|---|---|---|
| current (linear `scoreText`) | 65.8% | 78.4% | 83.5% | 71.9% | 43 ms | 155.11 ms | 252.52 ms |
| BM25 + prefix | 26.4% | 46.8% | 54.5% | 34.9% | 72 ms | 0.06 ms | 0.18 ms |
| BM25 + prefix + fuzzy | 31.2% | 52.8% | 60.2% | 39.8% | 59 ms | 4.78 ms | 21.49 ms |
| Trigram index (pooled) | 23.4% | 44.2% | 51.9% | 32.2% | 114 ms | 0.32 ms | 0.49 ms |
| Phonetic key | 16.0% | 33.3% | 39.8% | 22.7% | 116 ms | 0.19 ms | 8.81 ms |
| Hybrid | 39.4% | 61.5% | 70.6% | 48.5% | 265 ms | 5.41 ms | 30.84 ms |
| **Trigram, fielded** | **76.6%** | **95.2%** | **98.3%** | **84.2%** | 102 ms | 0.45 ms | 0.64 ms |

### All 10 scripts + author + verse text + translations — 702 docs

Everything at once; isolates nothing, kept to show the compounded cost.

| engine | R@1 | R@5 | R@10 | MRR | build | p50 | p95 |
|---|---|---|---|---|---|---|---|
| current (linear `scoreText`) | 65.8% | 78.4% | 83.5% | 71.9% | 49 ms | 77.39 ms | 124.38 ms |
| Trigram index (pooled) | 27.7% | 47.2% | 60.2% | 36.4% | 146 ms | 0.29 ms | 0.43 ms |
| Trigram, fielded | 64.9% | 87.4% | 94.4% | 75.1% | 137 ms | 0.50 ms | 1.05 ms |

## What the numbers say

**1. Trigram beats everything on the task that actually matters, and it is not close.**
79.7% R@1 / 98.7% R@10 versus the shipping ranker's 77.1% / 92.6% — while being **14× faster**
(0.15 ms vs 2.15 ms p50). Character n-grams survive the two things these queries do constantly:
transposed letters (`asktam` / `aṣṭakam`) and run-together or split words (`suchi suta` /
`śrīśacīsutāṣṭakam`). Nearly every real attempt lands in the top 10.

**2. BM25 is the wrong tool for fuzzy title lookup.** It scored 57.6% — *worse than the linear
ranker it was supposed to replace*. BM25 needs an exact token to look up, and a misspelled query
has none: `krishna vimostottra` produces no posting-list hit at all against `śrīkṛṣṇera
biṁśottara-śatanāma`. Speed was never the bottleneck; **recall was**. BM25 remains the right
choice for *content* search, where people type real words they can spell.

**3. Indexing all 10 scripts makes search worse, not better.** Every engine drops
(trigram 79.7% → 64.1%; the shipping ranker's p50 goes 2.15 ms → 9.79 ms). Nine extra renderings
of the same title dilute IDF and add near-miss noise for queries that are overwhelmingly Latin.
This is direct evidence for **transliterating the query into Latin** rather than indexing every
script — same coverage, a tenth of the index, and it works in both directions.

**4. Content search is nearly free — but only if you keep the fields apart.** Pooling verse text
into the title index is catastrophic (trigram 79.7% → **23.4%**). The obvious reading is "content
search costs too much." It is wrong. The linear ranker barely moves on the same corpus
(77.1% → 65.8%) because it scores every text *separately and keeps the best*, while the index
engines pour all ~24 lines into one bag of n-grams and let the title drown.

Fixing the document model, not the algorithm, recovers almost all of it —
`trigram-fielded` keeps title and body in separate indexes and combines them per song:

| | R@1 | R@5 | R@10 |
|---|---|---|---|
| titles only | 79.7% | 94.8% | 98.7% |
| + content, pooled | 23.4% | 44.2% | 51.9% |
| **+ content, fielded** | **76.6%** | **95.2%** | **98.3%** |

R@5 actually *improves* and R@10 is within 0.4 pp, for 3.1 pp of R@1. So full-text search over
every verse is affordable — **field separation is the load-bearing decision**, not whether to index
content at all.

**5. R@1 understates real quality.** Inspect with `--misses trigram`: a large share of "failures"
are ties between genuinely near-identical titles — `śocaka (1)/(2)/(3)`,
`śrīguru-paramparā—bāṁlā (ISKCON)/(GVS)/(IPBYS)`, `hari hari! ki mora karama anurata/abhāga`.
The query cannot distinguish them, so rank 2–3 is correct behavior, and **R@5 is the fairer
headline.**

## Layout

```
data/build.mjs       corpus + recorded attempts -> data/gen/*.json
src/normalize.mjs    baseline (shipping) and phonetic normalizers, script detection
src/engines.mjs      the seven engines, one interface: build(docs) / search(state, q, k)
src/corpus-defs.mjs  the four document sets, pure - shared by the CLI and the browser
src/corpora.mjs      Node-side loader over corpus-defs
src/inspect.mjs      best / median / worst ranking of an engine's outcomes
bench.mjs            headless runner
web/                 live UI - imports the same engine modules, no build step
serve.mjs            static server for the UI
```

The corpus definitions are deliberately in one pure module rather than duplicated per loader: the
CLI reads the artifacts off disk and the browser fetches them, and when those two held separate
copies they immediately drifted into benchmarking different document sets.

## Notes on the data

- **Ground truth resolves 231 of 295 attempts.** Matching the recorded `original_title` to a song
  uid requires folding **v→b**: the recorded titles use Sanskrit spellings while the corpus is
  romanized from Bengali, which writes one letter for both (`Viṁśottara`/`biṁśottara`,
  `Varṇa`/`barṇa`). Without that fold, 43 attempts fail against songs plainly present. The
  remaining 16 are songs not in this corpus.
- **Content is indexed from the `Latn` `display_scripts` entry, not `source_text_master`.** The
  master carries a pipeline sentinel — `[FLAG_HYPHEN_ALPHA]`, 8,751 occurrences across 647 of 702
  songs — that marks a hyphen dropped when generating Indic scripts. It is invisible on the site
  (the apps render `display_scripts`) but tokenized naively it makes `flag`, `hyphen` and `alpha`
  three of the most common words in the corpus. The `Latn` rendering is the same text, already
  clean: zero sentinels.
- One ground-truth row is junk (`"super obscure song"`) and is counted as a miss for every engine.
