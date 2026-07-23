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
node bench.mjs --corpus titles-latn          # one corpus
node bench.mjs --misses trigram              # what that engine still gets wrong, and what it returned
node bench.mjs --json data/gen/results.json  # machine-readable
```

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

### Titles + 16,620 verse lines + translations — 702 docs

| engine | R@1 | R@5 | R@10 | MRR | build | p50 | p95 |
|---|---|---|---|---|---|---|---|
| current (linear `scoreText`) | 65.8% | 78.4% | 83.5% | 71.9% | 56 ms | 80.55 ms | 128.70 ms |
| BM25 + prefix | 27.3% | 45.9% | 54.1% | 34.3% | 93 ms | 0.06 ms | 0.16 ms |
| BM25 + prefix + fuzzy | 30.3% | 49.8% | 60.2% | 37.9% | 83 ms | 2.45 ms | 10.55 ms |
| Trigram index | 27.7% | 47.2% | 60.2% | 36.4% | 150 ms | 0.30 ms | 0.42 ms |
| Phonetic key | 15.6% | 30.3% | 36.8% | 21.2% | 145 ms | 0.19 ms | 4.77 ms |
| Hybrid | 37.7% | 57.6% | 70.1% | 46.8% | 362 ms | 3.24 ms | 15.80 ms |

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

**4. Merging content into the title index destroys title lookup.** Trigram falls 79.7% → 27.7%;
the linear ranker's p50 goes to 80 ms. Content search has to be a **separate index and a separate
result section**, never one merged pool — 16,620 lines will bury 702 titles every time.

**5. R@1 understates real quality.** Inspect with `--misses trigram`: a large share of "failures"
are ties between genuinely near-identical titles — `śocaka (1)/(2)/(3)`,
`śrīguru-paramparā—bāṁlā (ISKCON)/(GVS)/(IPBYS)`, `hari hari! ki mora karama anurata/abhāga`.
The query cannot distinguish them, so rank 2–3 is correct behavior, and **R@5 is the fairer
headline.**

## Layout

```
data/build.mjs      corpus + recorded attempts -> data/gen/*.json
src/normalize.mjs   baseline (shipping) and phonetic normalizers, script detection
src/engines.mjs     the six engines, one interface: build(docs) / search(state, q, k)
src/corpora.mjs     the three document sets
bench.mjs           headless runner
web/                live UI - imports the same engine modules, no build step
serve.mjs           static server for the UI
```

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
