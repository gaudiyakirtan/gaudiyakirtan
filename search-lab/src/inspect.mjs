// Result inspection: for one engine on one corpus, which queries does it nail, which does it
// scrape through, and which does it lose entirely?
//
// An aggregate like "79.7% R@1" tells you nothing about *shape*. Two engines with the same R@1 can
// fail completely differently - one confidently wrong, one merely undecided between three
// near-identical titles - and only the second is acceptable. Sorting every query by outcome and
// reading the head, the middle and the tail is how you tell those apart.

/**
 * Quality of one outcome, ordered so a sort puts the best first:
 *   rank 1 with a wide margin over the runner-up  >  rank 1 by a hair  >  rank 2..10  >  missing.
 * Reciprocal rank is the primary key; `margin` (winner score / runner-up score) breaks ties among
 * the many rank-1 hits, which is exactly where "best" needs to be discriminating.
 */
function quality(rank, margin) {
  if (rank < 0) return -1
  const rr = 1 / (rank + 1)
  return rr + (rank === 0 ? Math.min(margin - 1, 2) * 0.1 : 0)
}

/**
 * Score every ground-truth query and return them ordered best -> worst, each annotated with the
 * rank the intended song got and the top few results the engine actually returned.
 */
export function inspectEngine(engine, docs, truth, { limit = 10 } = {}) {
  const state = engine.build(docs)
  const rows = truth.map((g) => {
    const res = engine.search(state, g.query, limit)
    const rank = res.findIndex((r) => r.ref === g.uid)
    const margin = res.length > 1 && res[1].score > 0 ? res[0].score / res[1].score : Infinity
    return {
      query: g.query,
      wantUid: g.uid,
      wantTitle: g.title,
      rank,
      margin: Number.isFinite(margin) ? margin : 99,
      got: res.slice(0, 3).map((r) => r.ref),
      q: quality(rank, Number.isFinite(margin) ? margin : 99),
    }
  })
  rows.sort((a, b) => b.q - a.q)
  return rows
}

/** Head / middle / tail slices of an ordered inspection, for a best-median-worst read. */
export function slices(rows, n = 6) {
  const mid = Math.floor(rows.length / 2)
  const half = Math.floor(n / 2)
  return {
    best: rows.slice(0, n),
    median: rows.slice(Math.max(0, mid - half), Math.max(0, mid - half) + n),
    worst: rows.slice(-n).reverse(),
  }
}

/** One-line verdict for a row, e.g. "rank 1 (2.4x clear)" or "MISSED". */
export function verdict(row) {
  if (row.rank < 0) return 'MISSED'
  if (row.rank === 0) return `rank 1 (${row.margin >= 99 ? 'uncontested' : row.margin.toFixed(1) + '× clear'})`
  return `rank ${row.rank + 1}`
}
