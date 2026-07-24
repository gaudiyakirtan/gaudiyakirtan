# Search Lab

A bench for the two open questions in [`docs/screens/search.md`](../docs/screens/search.md):
**can we search song content**, and **can we search in any script** — measured instead of argued.

Ten matching algorithms × five corpora, scored against **231 real search attempts** recorded from
the older app (`search-benchmark/search-database.csv`): genuine misspellings typed by people
looking for a song they had heard, not synthetic queries — plus a **500-query content ground
truth** for verse-text search.

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

| engine | overall R@1 | authored | synthetic | p50 |
|---|---|---|---|---|
| **Duet (fielded title + per-line content)** | **87.2%** | **94.4%** | 80.0% | 0.63 ms |
| current (linear `scoreText`) | 84.8% | 89.2% | **80.4%** | 192 ms |
| Hybrid | 61.6% | 67.6% | 55.6% | 1.04 ms |
| Jaigopal (skeleton sieve + Dice) | 54.0% | 60.4% | 47.6% | 0.38 ms |
| BM25 + prefix + fuzzy | 52.2% | 60.4% | 44.0% | 0.20 ms |
| BM25 + prefix | 48.4% | 55.2% | 41.6% | 0.06 ms |
| Trigram index | 38.4% | 42.4% | 34.4% | 0.34 ms |
| Trigram, fielded | 35.4% | 66.0% | 4.8% | 0.47 ms |
| Cascade (gated trigram + rerank) | 31.6% | 58.8% | 4.4% | 0.58 ms |

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

## Joint objective — good at both jobs at once

A real search box has to do title lookup *and* content search. So the honest score is the **worse**
of the two: `min( R@1 on the 231 recorded title attempts , R@1 on the 500 content queries )`. A
title champion that can't find a verse and a content engine that fumbles a misspelled title are
both disqualified. Scored on `titles-latn+content`, the only corpus that can answer all three query
datasets (titles, verse lines, and — for the English queries — translations):

```bash
node joint.mjs
```

| engine | **joint** | titles | content | authored / synthetic | bound by |
|---|---|---|---|---|---|
| **Duet** (fielded title + per-line content) | **86.6%** | 86.6% | 87.2% | 94.4% / 80.0% | titles |
| current (linear `scoreText`) | 65.8% | 65.8% | 84.8% | 89.2% / 80.4% | titles |
| Jaigopal (skeleton + Dice) | 47.2% | 47.2% | 54.0% | 60.4% / 47.6% | titles |
| Hybrid | 39.4% | 39.4% | 61.6% | 67.6% / 55.6% | titles |
| Trigram, fielded | 34.0% | 76.6% | 34.0% | 64.4% / 3.6% | content |
| Cascade (gated trigram + rerank) | 31.6% | **87.0%** | 31.6% | 58.8% / 4.4% | content |
| BM25 + prefix + fuzzy | 31.2% | 31.2% | 52.2% | 60.4% / 44.0% | titles |
| BM25 + prefix | 26.4% | 26.4% | 48.4% | 55.2% / 41.6% | titles |
| Trigram | 23.4% | 23.4% | 38.4% | 42.4% / 34.4% | titles |
| Phonetic key | 16.0% | 16.0% | 22.4% | 27.2% / 17.6% | titles |

**Duet wins, and the objective is what earns it.** Cascade is the single best *title* engine at
87.0% — but it pools a song's content into one bag and collapses to 31.6% on verse search, so the
minimum guts it. The min penalises exactly the lopsidedness that a per-dataset table hides: the two
title champions (Cascade, Trigram-fielded) are both **content-bound**, every other engine is
**titles-bound**, and only Duet clears ~86% on both sides at once.

One consequence worth stating plainly: **today's shipping ranker is bottlenecked by title lookup,
not content.** Its content R@1 is a strong 84.8%, but titles hold it to 65.8% — the opposite of the
intuition that verse search would be the hard part.

## Results

`R@k` = share of the 231 attempts where the intended song ranked in the top *k*.
`p50/p95` = per-query latency across the ground-truth set.

### Titles, Latin only — 702 docs

| engine | R@1 | R@5 | R@10 | MRR | build | p50 | p95 |
|---|---|---|---|---|---|---|---|
| current (linear `scoreText`) | 77.1% | 89.2% | 92.6% | 82.3% | 3 ms | 2.57 ms | 4.19 ms |
| BM25 + prefix | 57.6% | 71.0% | 74.9% | 63.3% | 2 ms | 0.01 ms | 0.04 ms |
| BM25 + prefix + fuzzy | 63.6% | 77.9% | 82.3% | 70.3% | 2 ms | 0.26 ms | 0.72 ms |
| Trigram index | 79.7% | 94.8% | 98.7% | 86.0% | 5 ms | 0.14 ms | 0.27 ms |
| Phonetic key | 59.7% | 80.5% | 84.8% | 67.8% | 5 ms | 0.09 ms | 0.47 ms |
| Hybrid (BM25+trigram+phonetic) | 74.5% | 90.9% | 93.1% | 80.7% | 12 ms | 0.48 ms | 1.34 ms |
| Trigram, fielded | 79.7% | 94.8% | 98.7% | 86.0% | 5 ms | 0.14 ms | 0.21 ms |
| **Cascade (gated trigram + rerank)** | **86.6%** | **97.4%** | **99.6%** | **91.4%** | 12 ms | 0.11 ms | 0.82 ms |
| Duet (fielded title + per-line content) | 85.7% | 96.1% | 98.7% | 90.2% | 12 ms | 0.42 ms | 0.60 ms |
| Jaigopal (skeleton sieve + Dice) | 47.2% | 50.2% | 51.9% | 48.7% | 6 ms | 0.06 ms | 0.10 ms |

### Titles, all 10 scripts + author — 702 docs

| engine | R@1 | R@5 | R@10 | MRR | build | p50 | p95 |
|---|---|---|---|---|---|---|---|
| current (linear `scoreText`) | 75.8% | 87.4% | 90.9% | 80.9% | 16 ms | 27.05 ms | 45.29 ms |
| BM25 + prefix | 52.8% | 68.8% | 72.3% | 59.3% | 26 ms | 0.01 ms | 0.13 ms |
| BM25 + prefix + fuzzy | 60.6% | 76.6% | 80.5% | 67.2% | 25 ms | 1.27 ms | 3.90 ms |
| Trigram index | 64.1% | 88.7% | 95.2% | 75.3% | 43 ms | 0.17 ms | 0.24 ms |
| Phonetic key | 53.2% | 74.0% | 81.4% | 62.4% | 32 ms | 0.12 ms | 2.46 ms |
| Hybrid | 67.1% | 85.3% | 89.6% | 74.9% | 95 ms | 1.76 ms | 5.88 ms |
| Trigram, fielded | 64.1% | 88.7% | 95.2% | 75.3% | 40 ms | 0.18 ms | 0.26 ms |
| **Cascade (gated trigram + rerank)** | **81.4%** | **95.2%** | **97.0%** | **87.3%** | 123 ms | 0.15 ms | 3.42 ms |
| Duet (fielded title + per-line content) | 81.0% | 90.9% | 94.4% | 84.9% | 117 ms | 0.93 ms | 1.86 ms |
| Jaigopal (skeleton sieve + Dice) | 47.2% | 50.2% | 51.5% | 48.5% | 9 ms | 0.07 ms | 0.12 ms |

### Latin titles + 16,620 verse lines + translations — 702 docs

The clean isolation of what *content* costs: same Latin-only titles as the first table, plus the
verse text. Nothing else changes.

| engine | R@1 | R@5 | R@10 | MRR | build | p50 | p95 |
|---|---|---|---|---|---|---|---|
| current (linear `scoreText`) | 65.8% | 78.4% | 83.5% | 71.9% | 35 ms | 146.22 ms | 237.57 ms |
| BM25 + prefix | 26.4% | 46.8% | 54.5% | 34.9% | 67 ms | 0.05 ms | 0.14 ms |
| BM25 + prefix + fuzzy | 31.2% | 52.8% | 60.2% | 39.8% | 57 ms | 4.23 ms | 19.57 ms |
| Trigram index (pooled) | 23.4% | 44.2% | 51.9% | 32.2% | 106 ms | 0.29 ms | 0.42 ms |
| Phonetic key | 16.0% | 33.3% | 39.8% | 22.7% | 111 ms | 0.18 ms | 8.43 ms |
| Hybrid | 39.4% | 61.5% | 70.6% | 48.5% | 266 ms | 5.08 ms | 27.88 ms |
| Trigram, fielded | 76.6% | 95.2% | 98.3% | 84.2% | 98 ms | 0.42 ms | 0.60 ms |
| **Cascade (gated trigram + rerank)** | **87.0%** | **97.8%** | **99.6%** | **91.7%** | 104 ms | 0.10 ms | 0.81 ms |
| **Duet (fielded title + per-line content)** | 86.6% | 95.7% | 97.4% | 90.6% | 179 ms | 0.48 ms | 0.80 ms |
| Jaigopal (skeleton sieve + Dice) | 47.2% | 51.1% | 52.8% | 48.9% | 108 ms | 0.37 ms | 0.74 ms |

### All 10 scripts + author + verse text + translations — 702 docs

Everything at once; isolates nothing, kept to show the compounded cost.

| engine | R@1 | R@5 | R@10 | MRR | build | p50 | p95 |
|---|---|---|---|---|---|---|---|
| current (linear `scoreText`) | 65.8% | 78.4% | 83.5% | 71.9% | 52 ms | 167.10 ms | 272.03 ms |
| Trigram index (pooled) | 27.7% | 47.2% | 60.2% | 36.4% | 156 ms | 0.29 ms | 0.42 ms |
| Trigram, fielded | 64.9% | 87.4% | 94.4% | 75.1% | 143 ms | 0.45 ms | 0.65 ms |
| **Cascade (gated trigram + rerank)** | 81.0% | **95.2%** | **97.0%** | **87.0%** | 213 ms | 0.16 ms | 3.31 ms |
| **Duet (fielded title + per-line content)** | **81.8%** | 89.6% | 92.2% | 85.7% | 306 ms | 1.00 ms | 1.82 ms |
| Jaigopal (skeleton sieve + Dice) | 47.2% | 51.1% | 52.4% | 48.8% | 114 ms | 0.43 ms | 0.79 ms |

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

**7. `duet` is the first engine ≥ 80% on *both* truth sets at once — because each field gets the
matcher it needs.** Cascade owns titles (87.0%) and collapses on content (31.6%); the shipping
ranker owns content (84.8%) at a disqualifying 146 ms. Duet holds **86.6% on the 231 title
attempts and 87.2% on the 500 content queries** (per style: recall 99% · fragment 100% ·
script 100% · semantic 89% · english 40% · synthetic 80%) at **0.48 / 0.63 ms p50**. Two retrieval
paths, fused by max on one score scale:

- **Title path** — cascade's machinery intact: fielded title trigrams, phonetic trigrams
  (weighted up in the sound-alike case), and the Levenshtein rerank. An early exit fires only
  when one title holds ≥ 75% of the query's gram idf *and* clears the runner-up 1.5× — high on
  purpose, because a looser title-first gate is exactly the class-imbalance failure cascade
  demonstrates (it answers content queries "confidently" wrong without ever consulting content).
- **Content path** — every verse line is its own document (16,620 line-docs), never pooled:
  trigram retrieval selects candidate lines, an idf-weighted token-coverage rerank scores them
  (stop words cannot buy coverage — that alone moved English semantic queries from 45% to 90%),
  the few leaders get a whole-string infix alignment, and lines aggregate to their song by max.
- Both paths were tuned in **one sweep scored against both truth sets, selecting on
  min(title R@1, content R@1)** — never on one set alone, which is the trap that produced
  cascade's 4.4% synthetic score.

All duet figures are **in-sample** for its weights. Re-scoring the regenerable synthetic half on
a fresh seed (`--seed 1337`) gives **78.0%** vs the tuned sample's 80.0% (content overall
86.2% vs 87.2%) — a ~2 pp gap, so the tuning tracks the measured distribution rather than the
particular sample. What should transfer is the structure, not the weights: lines-as-documents
with max aggregation, field-appropriate matchers (character grams + edit distance for misspelled
titles, idf-weighted tokens for spellable content words), one comparable score scale so neither
field can drown the other, and a title early-exit gated on *absolute* coverage.

## Layout

```
data/build.mjs       corpus + recorded attempts -> data/gen/*.json
src/normalize.mjs    baseline (shipping) and phonetic normalizers, script detection
src/engines.mjs      the ten engines, one interface: build(docs) / search(state, q, k)
src/corpus-defs.mjs  the five document sets, pure - shared by the CLI and the browser
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
