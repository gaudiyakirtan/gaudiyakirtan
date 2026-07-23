# Search Lab

A bench for the two open questions in [`docs/screens/search.md`](../docs/screens/search.md):
**can we search song content**, and **can we search in any script** — measured instead of argued.

Eight matching algorithms × four corpora, scored against **231 real search attempts** recorded from
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
node bench.mjs --inspect cascade             # best / median / worst queries, with what it returned
node bench.mjs --inspect trigram --top 12    # how many rows per band (default 6)
node bench.mjs --json data/gen/results.json  # machine-readable
```

`--inspect` is the one worth reaching for. An aggregate like "76.6% R@1" says nothing about
*shape*: two engines with identical R@1 can fail completely differently, and only one of those is
acceptable. Queries are ordered by reciprocal rank, then by how far the winner cleared the
runner-up — so **best** means *confidently* right rather than merely right, and the **median**
band shows what a typical query actually feels like:

```
inspect cascade on titles-latn+content
201 ranked first · 29 found but lower · 1 missed entirely

BEST     "Vrajera Nikunja Mane"     → rank 1 (3.5× clear)
MEDIAN   "Sriramacandrastakam"      → rank 1 (1.5× clear)
WORST    "super obscure song"       → MISSED
```

Only **1 of 231** attempts is lost outright — and it is the junk row (`"super obscure song"`).
The 29 "found but lower" are dominated by ties between genuinely near-identical titles.

The live UI mirrors all of this: **Run selected corpus** scopes the sweep, and **clicking any row**
in the results table opens the same best/median/worst inspection for that engine and corpus.

### Pareto frontier

Running a benchmark also draws one **accuracy-vs-latency panel per corpus**. An engine is *on the
frontier* when nothing else in that corpus is both faster **and** more accurate — so the frontier
is the only set worth choosing from, and every point behind it is strictly a worse deal. Latency is
log-scaled (it spans 0.01 ms to ~80 ms; on a linear axis every index engine collapses onto the
y-axis), and all panels share one scale so they read against each other.

The frontiers make the headline result visual:

| corpus | on the frontier |
|---|---|
| Titles (Latin only) | bm25, phonetic, **cascade** |
| Titles (all 10 scripts) | bm25, phonetic, trigram, **cascade** |
| Latin titles + content | bm25, **cascade** |
| Everything | bm25, **cascade** |

`bm25` is always on it — but only because it is the cheapest thing available, at ~26–58% R@1. The
frontier says "not dominated", not "good". Read it with the accuracy axis, not as a ranking.

On the two title-only corpora `trigram-fielded` lands on exactly the same coordinates as `trigram`:
with an empty content field the two are the same algorithm. The chart nudges coincident points
apart rather than hiding one.

## Content ground truth — 500 queries

The recorded attempts are all *titles*. To benchmark content search the lab carries a second
ground-truth set of 500 queries against verse lines, built as two deliberately different
instruments:

```bash
node analyze-queries.mjs --examples          # what real users do to a title, measured
node data/gen-content-queries.mjs --n 250    # regenerate the synthetic half (deterministic)
node data/gen-content-queries.mjs --preview 20
node bench.mjs --truth content --corpus titles-latn+content
```

**250 synthetic** (`data/gen/content-queries-synth.json`, regenerable) — `src/synth.mjs` applies the
transformation distribution *measured* off the 231 real attempts, not invented. From
`analyze-queries.mjs`:

| what users do to a token | rate |
|---|---|
| leave it alone (after diacritics are stripped) | 45.2% |
| split a compound into pieces | 11.5% |
| truncate it | 6.7% |
| two edits | 6.7% · three-or-more 5.7% · one 5.3% |
| v↔b swap | 5.1% |
| vowel quality | 4.5% |
| add or drop aspiration | 2.7% |
| metathesis | 0.5% |

Plus: 58.9% use capitals, only 9.1% keep any diacritic, 40.3% type fewer tokens than the target
has. Seeded with mulberry32, so `--seed N` gives a fresh sample of the same distribution and the
same seed always gives the same file — the set can be regenerated indefinitely without a change in
score being a reroll.

**250 hand-written** (`data/authored-content-queries.json`, committed as source) — the half a
generator structurally cannot produce: 80 *semantic* queries from the verse's meaning
("decorate your body with the dust of radhikas lotus feet"), 153 *recall* fragments in ordinary
devotional romanization, 9 in *native script* (Devanagari), 5 English descriptions, 3 bare
fragments. Character noise never turns `kṛṣṇa` into `krishna` — that is a different transliteration
tradition, not a slip.

### Query styles — text-matching vs meaning-based

The 500 queries are not one thing. Only some of them are answerable by matching text at all:

| style | n | query language | target | answerable without English in the index? |
|---|---|---|---|---|
| `recall` | 153 | Latin | Latin verse | ✅ |
| `synthetic` | 250 | Latin | Latin verse | ✅ |
| `script` | 9 | Devanagari | Devanagari verse | ✅ |
| `fragment` | 3 | Latin | Latin verse | ✅ |
| `semantic` | 80 | **English** | Latin verse | ❌ only via the translation |
| `english` | 5 | **English** | Latin verse | ❌ only via the translation |

```
recall     "radhika charana renu bhushana kariya tanu"
           → R23 v0   rādhikā-caraṇareṇu,  bhūṣaṇa kariyā tanu,

synthetic  "Ya’ra pada visvanatha-asa"
           → GV12 v6  yā̃’ra pada viśvanātha-āśa

script     "छाँड़ि मन हरि विमुखन को संग"
           → B12 v0   छाँड़ि मन, हरि-विमुखन को संग

semantic   "decorate your body with the dust of radhikas lotus feet"
           → R23 v0   rādhikā-caraṇareṇu,  bhūṣaṇa kariyā tanu,     ← same verse, no shared words
```

**415 of 500 are text-matching** (`recall + synthetic + script + fragment`); the other 85 are
meaning-based and share no vocabulary with their target. Filter accordingly:

```bash
node bench.mjs --truth content --corpus titles-latn+source \
  --style recall,fragment,script,synthetic
```

Averaging the English queries into a Latin-only run does not measure a weakness — it measures a
category error. The evidence is unambiguous: on `titles-latn+source` every engine scores **0% on
`semantic` and `english`**, and the shipping ranker scores 94% / 100% / 100% on
recall / fragment / script. Its headline moves from **71.4% → 86.0%** once the unanswerable
queries are excluded.

| engine (Latin-only corpus, text-matching queries) | R@1 | R@5 | R@10 | p50 |
|---|---|---|---|---|
| current (linear `scoreText`) | **86.0%** | 95.2% | 96.1% | 233 ms |
| Hybrid | 68.0% | 85.5% | 91.6% | 2.08 ms |
| BM25 + prefix + fuzzy | 55.4% | 76.1% | 86.5% | 1.49 ms |
| Trigram | 51.8% | 75.4% | 81.9% | 0.42 ms |

### What the two halves show

| engine | overall R@1 | authored | synthetic |
|---|---|---|---|
| current (linear `scoreText`) | **84.8%** | 89.2% | 80.4% |
| Hybrid | 61.6% | 67.6% | 55.6% |
| BM25 + prefix + fuzzy | 52.2% | 60.4% | 44.0% |
| BM25 + prefix | 48.4% | 55.2% | 41.6% |
| Trigram index | 38.4% | 42.4% | 34.4% |
| **Trigram, fielded** | 35.4% | **66.0%** | **4.8%** |

Three results worth the whole exercise:

1. **BM25 and trigram swap places.** On titles, trigram wins 79.7% to BM25's 57.6%. On content,
   BM25 leads trigram 48.4% to 38.4%. Content queries contain words people can actually spell, so
   the exact-token lookup that fails on a misspelled title succeeds here. There is no single best
   matcher — the right one depends on which field is being searched.

2. **`trigram-fielded` is 66.0% on hand-written queries and 4.8% on synthetic ones.** The aggregate
   of 35.4% describes neither. It was tuned for title lookup (content weighted 0.25) and it pools
   every line of a song into one bag, so it can only find content that happens to resemble the
   title. Hand-written queries often paraphrase the opening line, which usually *does* resemble the
   title; a random fragment from verse 14 does not. Had the ground truth been only one of the two
   halves, this would have looked either fine or catastrophic, and both readings would be wrong.

3. **The shipping linear ranker wins on content — and the reason is the document model again.**
   It scores each text *separately and keeps the best*, which is per-line scoring by accident. That
   is what content search actually needs, and it is why it costs 249 ms per query. The implication
   is to index **lines as documents** and aggregate to song, rather than pooling a song's lines
   into one bag.

## Jaigopal — the algorithm from the earlier app

Ported from `gaudiyakirtan-master/ux-app` (`TransliterationUtils.fuzzy`/`getScore`, driven by
`SongListSearch.tsx`) and named after its author. It is architecturally unlike everything else
here, and it solves a case this repo documents as unsolvable.

Rather than measure how *similar* two strings are, it destroys almost all the information in both
and asks whether what survives is a substring. What survives is a **consonant skeleton**:
diacritics folded, then `r→d`, `y→j`, `v/w→b`, `o→a`, aspirates collapsed (`kh→k`), homorganic
nasals dropped (`nd→d`), doubles collapsed, **spaces removed**, and then **every vowel deleted**.

```
govinda      → gbd        krishna     → kds        rādhikā-caraṇareṇu   → dkcdnd
gobinda      → gbd        kṛṣṇa       → kds        radhika charana renu → dkcdnd

vimostottra  → bmstd
biṁśottara   → bmstd
```

That last pair is the exact case `docs/screens/search.md` calls tier 1's known limitation — hard
metathesis that normalize-plus-edit-distance cannot reach. Here it is not a near miss, it is an
**exact match**, because the transposed letters and the vowels around them were thrown away before
comparison. Deleting spaces also makes compound splitting free, which is 11.5% of real queries.

Recall that aggressive needs a precision stage, so the skeleton is only a **candidate sieve**;
survivors are ranked by **Dice coefficient over character bigrams** on a much gentler fold (vowels
intact). Two stages of opposite temperament: a sieve that lets almost anything through, and a judge
that sorts it out. Three channels — uid, title, content — each ranked independently, which in the
original app were three tabs.

### What it is good at, and what it is not

| | R@1 | R@5 | R@10 |
|---|---|---|---|
| titles only (the 231 recorded attempts) | 47.2% | 50.2% | 51.9% |
| content, text-matching queries | 63.9% | 69.6% | 71.1% |
| …of which **hand-written** | **88.5%** | 88.5% | — |
| …of which synthetic | 47.6% | 57.2% | — |
| by style | recall 88% · fragment 100% · script 100% · synthetic 48% | | |

**R@1 ≈ R@5 ≈ R@10 is the whole story.** Every other engine gains 15–20 points between R@1 and
R@10; Jaigopal gains 3–7, and on hand-written queries R@1 and R@5 are *identical*. It does not
produce a ranked list of maybes — it either finds the song immediately or does not find it at all.
That is a precision instrument, and it is exactly the right shape for "jump straight there",
though the wrong shape for "show me candidates".

The ceiling is measurable: for the 231 recorded attempts, the target's skeleton contains the
query's skeleton only **52.4%** of the time (adding the content channel lifts it only to 52.8%).
Against that ceiling its 47.2% is **90% of everything achievable** — the Dice ranker is doing its
job well; substring containment is what caps it. One transposed consonant in the *skeleton*
(`chatinya asktham` → `ctjsktm` vs `sdctjstkm`) breaks containment outright, with no partial credit.

The synthetic/hand-written gap — 88.5% vs 47.6% — is the sharpest result. The skeleton is built for
how *people* mis-hear and re-spell Sanskrit: systematic, phonetically motivated substitution. The
generator's random character edits are not that, and the skeleton has no defence against them. On
real human phrasing it is within 10 points of the best engine here; on synthetic corruption it
loses 30. Which of those you weight is a product decision, not a benchmark one.

**Port fidelity:** `fuzzy()` and `getScore()` are verbatim, including two quirks in `getScore` that
are part of its measured behaviour (`getBigrams` emits a trailing 1-character "bigram", and the
nested loop counts matching *pairs* rather than matched bigrams, so repeated bigrams inflate hits).
Fixing either changes the ranking, so a corrected version would not be this algorithm. One
assumption: the original read a precomputed `titleFuzz`/`contentFuzz` off a server-built bundle
that is not in that repo, so this port applies `fuzzy()` to the title and to each verse line. Per
line rather than one packed string — the original located the matching line by parsing `{verse|line}`
markers back out of the blob, which is the same thing done the long way.

## Results

`R@k` = share of the 231 attempts where the intended song ranked in the top *k*.
`p50/p95` = per-query latency across the ground-truth set.

### Titles, Latin only — 702 docs

| engine | R@1 | R@5 | R@10 | MRR | build | p50 | p95 |
|---|---|---|---|---|---|---|---|
| current (linear `scoreText`) | 77.1% | 89.2% | 92.6% | 82.3% | 3 ms | 2.21 ms | 3.50 ms |
| BM25 + prefix | 57.6% | 71.0% | 74.9% | 63.3% | 3 ms | 0.01 ms | 0.04 ms |
| BM25 + prefix + fuzzy | 63.6% | 77.9% | 82.3% | 70.3% | 2 ms | 0.21 ms | 0.61 ms |
| Trigram index | 79.7% | 94.8% | 98.7% | 86.0% | 4 ms | 0.14 ms | 0.25 ms |
| Phonetic key | 59.7% | 80.5% | 84.8% | 67.8% | 5 ms | 0.07 ms | 0.33 ms |
| Hybrid (BM25+trigram+phonetic) | 74.5% | 90.9% | 93.1% | 80.7% | 11 ms | 0.45 ms | 1.25 ms |
| Trigram, fielded | 79.7% | 94.8% | 98.7% | 86.0% | 5 ms | 0.14 ms | 0.21 ms |
| **Cascade (gated trigram + rerank)** | **86.6%** | **97.4%** | **99.6%** | **91.4%** | 12 ms | 0.10 ms | 0.57 ms |

### Titles, all 10 scripts + author — 702 docs

| engine | R@1 | R@5 | R@10 | MRR | build | p50 | p95 |
|---|---|---|---|---|---|---|---|
| current (linear `scoreText`) | 75.8% | 87.4% | 90.9% | 80.9% | 16 ms | 9.81 ms | 16.73 ms |
| BM25 + prefix | 52.8% | 68.8% | 72.3% | 59.3% | 25 ms | 0.01 ms | 0.12 ms |
| BM25 + prefix + fuzzy | 60.6% | 76.6% | 80.5% | 67.2% | 22 ms | 0.55 ms | 1.64 ms |
| Trigram index | 64.1% | 88.7% | 95.2% | 75.3% | 45 ms | 0.17 ms | 0.24 ms |
| Phonetic key | 53.2% | 74.0% | 81.4% | 62.4% | 32 ms | 0.12 ms | 1.06 ms |
| Hybrid | 67.1% | 85.3% | 89.6% | 74.9% | 99 ms | 0.94 ms | 2.85 ms |
| Trigram, fielded | 64.1% | 88.7% | 95.2% | 75.3% | 41 ms | 0.18 ms | 0.26 ms |
| **Cascade (gated trigram + rerank)** | **81.4%** | **95.2%** | **97.0%** | **87.3%** | 118 ms | 0.18 ms | 1.69 ms |

### Latin titles + 16,620 verse lines + translations — 702 docs

The clean isolation of what *content* costs: same Latin-only titles as the first table, plus the
verse text. Nothing else changes.

| engine | R@1 | R@5 | R@10 | MRR | build | p50 | p95 |
|---|---|---|---|---|---|---|---|
| current (linear `scoreText`) | 65.8% | 78.4% | 83.5% | 71.9% | 35 ms | 69.37 ms | 111.14 ms |
| BM25 + prefix | 26.4% | 46.8% | 54.5% | 34.9% | 68 ms | 0.05 ms | 0.15 ms |
| BM25 + prefix + fuzzy | 31.2% | 52.8% | 60.2% | 39.8% | 61 ms | 2.19 ms | 10.10 ms |
| Trigram index (pooled) | 23.4% | 44.2% | 51.9% | 32.2% | 114 ms | 0.29 ms | 0.41 ms |
| Phonetic key | 16.0% | 33.3% | 39.8% | 22.7% | 113 ms | 0.19 ms | 4.59 ms |
| Hybrid | 39.4% | 61.5% | 70.6% | 48.5% | 284 ms | 2.73 ms | 15.02 ms |
| Trigram, fielded | 76.6% | 95.2% | 98.3% | 84.2% | 102 ms | 0.42 ms | 0.64 ms |
| **Cascade (gated trigram + rerank)** | **87.0%** | **97.8%** | **99.6%** | **91.7%** | 104 ms | 0.10 ms | 0.57 ms |

### All 10 scripts + author + verse text + translations — 702 docs

Everything at once; isolates nothing, kept to show the compounded cost.

| engine | R@1 | R@5 | R@10 | MRR | build | p50 | p95 |
|---|---|---|---|---|---|---|---|
| current (linear `scoreText`) | 65.8% | 78.4% | 83.5% | 71.9% | 51 ms | 78.55 ms | 123.98 ms |
| Trigram index (pooled) | 27.7% | 47.2% | 60.2% | 36.4% | 148 ms | 0.29 ms | 0.44 ms |
| Trigram, fielded | 64.9% | 87.4% | 94.4% | 75.1% | 136 ms | 0.46 ms | 0.66 ms |
| **Cascade (gated trigram + rerank)** | **81.0%** | **95.2%** | **97.0%** | **87.0%** | 208 ms | 0.18 ms | 1.72 ms |

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

**6. A staged cascade beats every single-signal engine on *both* axes at once.** `cascade` starts
from the fielded trigram index and spends extra work only where it pays:

- **Stage 1** ranks by title trigrams alone (typed-array accumulation). If the winner clears the
  runner-up by 1.2× while holding ≥ half the query's matched idf, the query is *decided* — most
  real queries stop here, which is why p50 is 0.10 ms.
- **Stage 2**, only for undecided queries, fuses three more signals: phonetic trigrams (weighted
  *up* when literal trigrams matched almost nothing — that is exactly the sound-alike case,
  `chatinya` / `caitanya`), content trigrams at low weight, and a Levenshtein rerank of the top 16.
- The rerank sees what bag-of-trigrams cannot: word **order** (`kabe habe hena daśā mora` vs
  `kabe hena daśā habe mora`), **prefix intent** (compare against a same-length prefix window, so
  a long title is not punished for its untyped tail), **transpositions** via sorted-character
  similarity (`asktam` / `aṣṭakam`), and **glued tokens** via infix alignment — the edit distance
  of `chatinya` against the best substring of `sricaitanyastakam`.

On the corpus that matters (Latin titles + content) it reaches **87.0% R@1 / 97.8% R@5 /
99.6% R@10** at **0.10 ms p50** — +10.4 pp R@1 over `trigram-fielded` while being 4× faster, and
9 pp *better* R@1 than the shipping ranker manages on titles alone. 230 of 231 recorded attempts
land in the top 10; the one loss is the junk row. Its weights are tuned against these 231
attempts, so treat the exact figures as in-sample; the *structure* (gate + fielded trigram +
targeted rerank) is what transfers.

## Layout

```
data/build.mjs       corpus + recorded attempts -> data/gen/*.json
src/normalize.mjs    baseline (shipping) and phonetic normalizers, script detection
src/engines.mjs      the eight engines, one interface: build(docs) / search(state, q, k)
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
