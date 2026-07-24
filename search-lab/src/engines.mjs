// The candidates. Every engine implements the same tiny interface so the harness can swap them:
//
//   build(docs)            -> opaque state          (timed; sized via measure())
//   search(state, q, k)    -> [{ ref, score }]      (timed, ranked, truncated)
//
// A `doc` is { ref, texts[] } - ref is what we score against ground truth (a song uid), texts are
// every string that should match it (title in 10 scripts, author, verse lines...). Keeping the doc
// shape identical across engines is what makes the comparison honest: any difference in the
// results is the algorithm, not the input.
import { baseline, phonetic, tokenize, similarity, ngrams } from './normalize.mjs'

// ---------------------------------------------------------------------------
// 1. current - a faithful port of web/src/services/search.ts scoreText().
//    This is the shipping baseline; every other engine has to beat it to matter.
// ---------------------------------------------------------------------------
function tokenScore(queryToken, targetTokens) {
  let best = 0
  for (const tt of targetTokens) {
    let m
    if (tt === queryToken) m = 1
    else {
      const shorter = queryToken.length <= tt.length ? queryToken : tt
      const longer = shorter === queryToken ? tt : queryToken
      const lenScore = Math.min(0.92, 0.45 + 0.07 * shorter.length)
      m = similarity(queryToken, tt)
      if (longer.startsWith(shorter)) m = Math.max(m, lenScore)
      else if (shorter.length >= 3 && longer.includes(shorter)) m = Math.max(m, lenScore - 0.05)
    }
    if (m > best) { best = m; if (best === 1) break }
  }
  return best
}

function scoreTarget(qNorm, qTokens, tNorm, tTokens) {
  if (!qNorm || !tNorm) return 0
  let whole = 0
  if (tNorm === qNorm) whole = 100
  else if (tNorm.startsWith(qNorm)) whole = 80
  else if (qNorm.length >= 2 && tNorm.includes(qNorm)) whole = 60
  let sum = 0, matched = 0
  for (const qt of qTokens) {
    const s = tokenScore(qt, tTokens)
    sum += s
    if (s >= 0.7) matched += 1
  }
  const coverage = qTokens.length ? matched / qTokens.length : 0
  return Math.max(whole, sum * 12 + coverage * 20)
}

export const current = {
  id: 'current',
  name: 'current (linear scoreText)',
  blurb: 'What ships today. Scores every target with tiered whole-string + per-token Levenshtein.',
  build(docs) {
    return docs.map((d) => ({
      ref: d.ref,
      t: d.texts.map((x) => { const n = baseline(x); return { n, tk: tokenize(n) } }),
    }))
  },
  search(state, query, limit = 20) {
    const qn = baseline(query), qt = tokenize(qn)
    const out = []
    for (const d of state) {
      let best = 0
      for (const t of d.t) {
        const s = scoreTarget(qn, qt, t.n, t.tk)
        if (s > best) best = s
      }
      if (best >= 5) out.push({ ref: d.ref, score: best })
    }
    out.sort((a, b) => b.score - a.score)
    return out.slice(0, limit)
  },
}

// ---------------------------------------------------------------------------
// Shared inverted-index construction, used by bm25 / bm25-fuzzy / hybrid.
// ---------------------------------------------------------------------------
const K1 = 1.2, B = 0.75

function buildInverted(docs, normalizer) {
  const postings = new Map()   // token -> [docIdx, tf, docIdx, tf, ...]
  const refs = [], lens = []
  let total = 0
  docs.forEach((d, i) => {
    refs.push(d.ref)
    const tf = new Map()
    for (const text of d.texts) for (const w of tokenize(normalizer(text))) tf.set(w, (tf.get(w) ?? 0) + 1)
    let len = 0
    for (const [w, f] of tf) {
      let p = postings.get(w)
      if (!p) postings.set(w, p = [])
      p.push(i, f)
      len += f
    }
    lens.push(len)
    total += len
  })
  return { postings, refs, lens, avgdl: total / (docs.length || 1), n: docs.length,
           vocab: [...postings.keys()].sort() }
}

/** Vocabulary terms starting with `p`, capped so a one-letter query can't expand to everything. */
function prefixTerms(vocab, p, cap = 64) {
  let lo = 0, hi = vocab.length
  while (lo < hi) { const m = (lo + hi) >> 1; if (vocab[m] < p) lo = m + 1; else hi = m }
  const out = []
  for (let i = lo; i < vocab.length && vocab[i].startsWith(p); i++) {
    out.push(vocab[i])
    if (out.length >= cap) break
  }
  return out
}

function bm25Accumulate(state, terms, acc, weight = 1) {
  const { postings, lens, avgdl, n } = state
  for (const { term, w } of terms) {
    const p = postings.get(term)
    if (!p) continue
    const df = p.length / 2
    const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5))
    for (let j = 0; j < p.length; j += 2) {
      const i = p[j], f = p[j + 1]
      const s = idf * (f * (K1 + 1)) / (f + K1 * (1 - B + B * lens[i] / avgdl))
      acc.set(i, (acc.get(i) ?? 0) + s * w * weight)
    }
  }
}

function topFrom(acc, refs, limit) {
  const arr = [...acc.entries()]
  arr.sort((a, b) => b[1] - a[1])
  return arr.slice(0, limit).map(([i, score]) => ({ ref: refs[i], score }))
}

export const bm25 = {
  id: 'bm25',
  name: 'BM25 + prefix',
  blurb: 'Inverted index, IDF-weighted, length-normalized. Prefix-expands the last token as you type.',
  build(docs) { return buildInverted(docs, baseline) },
  search(state, query, limit = 20) {
    const qt = tokenize(baseline(query))
    const acc = new Map()
    for (const w of qt) {
      const terms = state.postings.has(w) ? [{ term: w, w: 1 }] : []
      for (const p of prefixTerms(state.vocab, w)) if (p !== w) terms.push({ term: p, w: 0.6 })
      bm25Accumulate(state, terms, acc)
    }
    return topFrom(acc, state.refs, limit)
  },
}

export const bm25Fuzzy = {
  id: 'bm25-fuzzy',
  name: 'BM25 + prefix + fuzzy',
  blurb: 'Adds a vocabulary-level edit-distance fallback when a token matches nothing exactly.',
  build(docs) { return buildInverted(docs, baseline) },
  search(state, query, limit = 20) {
    const qt = tokenize(baseline(query))
    const acc = new Map()
    for (const w of qt) {
      const terms = state.postings.has(w) ? [{ term: w, w: 1 }] : []
      for (const p of prefixTerms(state.vocab, w)) if (p !== w) terms.push({ term: p, w: 0.6 })
      if (terms.length === 0) {
        const th = w.length <= 4 ? 0.72 : 0.78
        for (const v of state.vocab) {
          if (Math.abs(v.length - w.length) > 2) continue
          const s = similarity(w, v)
          if (s >= th) terms.push({ term: v, w: s * 0.9 })
        }
      }
      bm25Accumulate(state, terms, acc)
    }
    return topFrom(acc, state.refs, limit)
  },
}

// ---------------------------------------------------------------------------
// trigram - character n-grams. The one structure that survives *metathesis*
// (letters transposed inside a token: vimostottra / viṁśottara), which token
// edit-distance handles badly. docs/screens/search.md calls this out as the
// known tier-1 limitation.
// ---------------------------------------------------------------------------
export const trigram = {
  id: 'trigram',
  name: 'Trigram index',
  blurb: 'Character 3-grams with IDF weighting. Robust to transposed letters and run-together words.',
  build(docs) {
    const postings = new Map()
    const refs = [], sizes = []
    docs.forEach((d, i) => {
      refs.push(d.ref)
      const set = new Set()
      for (const text of d.texts) for (const g of ngrams(baseline(text).replace(/\s+/g, ' '))) set.add(g)
      for (const g of set) {
        let p = postings.get(g)
        if (!p) postings.set(g, p = [])
        p.push(i)
      }
      sizes.push(set.size || 1)
    })
    return { postings, refs, sizes, n: docs.length }
  },
  search(state, query, limit = 20) {
    const q = [...new Set(ngrams(baseline(query)))]
    const acc = new Map()
    for (const g of q) {
      const p = state.postings.get(g)
      if (!p) continue
      const idf = Math.log(1 + state.n / p.length)
      for (const i of p) acc.set(i, (acc.get(i) ?? 0) + idf)
    }
    // Normalize by doc size so a long song title cannot win on volume alone.
    const arr = [...acc.entries()].map(([i, s]) => [i, s / Math.sqrt(state.sizes[i])])
    arr.sort((a, b) => b[1] - a[1])
    return arr.slice(0, limit).map(([i, score]) => ({ ref: state.refs[i], score }))
  },
}

// ---------------------------------------------------------------------------
// phonetic - index the sound, not the spelling. Readers type what they hear;
// this collapses aspiration, voicing, sibilants, nasals and vowel quality so
// "padha"/"pada" and "charna"/"caraṇa" become the same key.
// ---------------------------------------------------------------------------
export const phoneticEngine = {
  id: 'phonetic',
  name: 'Phonetic key',
  blurb: 'BM25 over a Gauḍīya-romanization phonetic key (aspiration, voicing, sibilants, vowels folded).',
  build(docs) { return buildInverted(docs, phonetic) },
  search(state, query, limit = 20) {
    const qt = tokenize(phonetic(query))
    const acc = new Map()
    for (const w of qt) {
      const terms = state.postings.has(w) ? [{ term: w, w: 1 }] : []
      for (const p of prefixTerms(state.vocab, w)) if (p !== w) terms.push({ term: p, w: 0.6 })
      if (terms.length === 0) {
        for (const v of state.vocab) {
          if (Math.abs(v.length - w.length) > 2) continue
          const s = similarity(w, v)
          if (s >= 0.75) terms.push({ term: v, w: s * 0.9 })
        }
      }
      bm25Accumulate(state, terms, acc)
    }
    return topFrom(acc, state.refs, limit)
  },
}

// ---------------------------------------------------------------------------
// hybrid - fuse the three. They fail differently: BM25 needs a real token
// match, trigram survives transposition, phonetic survives mis-hearing. Summing
// normalized scores lets any one of them rescue a query the others miss.
// ---------------------------------------------------------------------------
export const hybrid = {
  id: 'hybrid',
  name: 'Hybrid (BM25 + trigram + phonetic)',
  blurb: 'Rank fusion of the three. Each covers a different failure mode; the sum covers more than any alone.',
  build(docs) {
    return { b: bm25Fuzzy.build(docs), t: trigram.build(docs), p: phoneticEngine.build(docs) }
  },
  search(state, query, limit = 20) {
    const WEIGHTS = { b: 1.0, t: 0.7, p: 0.8 }
    const fused = new Map()
    for (const [key, engine, st] of [['b', bm25Fuzzy, state.b], ['t', trigram, state.t], ['p', phoneticEngine, state.p]]) {
      const res = engine.search(st, query, 50)
      const top = res[0]?.score || 1
      for (const [rank, r] of res.entries()) {
        // Normalized score plus a reciprocal-rank term, so a confident #1 from any engine carries.
        const v = (r.score / top) * WEIGHTS[key] + WEIGHTS[key] / (10 + rank)
        fused.set(r.ref, (fused.get(r.ref) ?? 0) + v)
      }
    }
    return [...fused.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([ref, score]) => ({ ref, score }))
  },
}

// ---------------------------------------------------------------------------
// trigram-fielded - the same trigram matcher, but title and content are kept in
// SEPARATE indexes and combined per song, instead of being poured into one bag
// of n-grams.
//
// This exists because of a result the lab produced: adding verse text collapses
// plain trigram from 79.7% to 23.4% R@1, while the linear ranker barely moves
// (77.1% -> 65.8%). The difference is not the algorithm, it is the document
// model. The linear ranker scores every text separately and keeps the best;
// pooling instead lets ~24 lines of verse drown the one line that is the title.
// A doc may supply {title:[], content:[]}; it falls back to `texts` if not.
// ---------------------------------------------------------------------------
export const trigramFielded = {
  id: 'trigram-fielded',
  name: 'Trigram, fielded (title | content)',
  blurb: 'Separate trigram indexes for title and body, combined per song. Title dominates; content only adds.',
  build(docs) {
    const titleDocs = docs.map((d) => ({ ref: d.ref, texts: d.title ?? d.texts }))
    const bodyDocs = docs.map((d) => ({ ref: d.ref, texts: d.content ?? [] }))
    return { t: trigram.build(titleDocs), c: trigram.build(bodyDocs) }
  },
  search(state, query, limit = 20) {
    // Title is the authority; a body hit can promote a song but never outrank a good title match.
    const CONTENT_WEIGHT = 0.25
    const fused = new Map()
    const tr = trigram.search(state.t, query, limit * 3)
    const top = tr[0]?.score || 1
    for (const r of tr) fused.set(r.ref, r.score / top)
    const cr = trigram.search(state.c, query, limit * 3)
    const ctop = cr[0]?.score || 1
    for (const r of cr) fused.set(r.ref, (fused.get(r.ref) ?? 0) + (r.score / ctop) * CONTENT_WEIGHT)
    return [...fused.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
      .map(([ref, score]) => ({ ref, score }))
  },
}

// ---------------------------------------------------------------------------
// cascade - purpose-built for the title+content corpus. Three signals, spent
// in order of cost, each consulted only when the previous one has not already
// decided the query:
//
//   1. fielded trigram over titles, accumulated into a typed array (fast path)
//   2. phonetic trigram over titles - rescues sound-alike misspellings that
//      share almost no literal trigrams ("chatinya" / "caitanya")
//   3. content trigrams + a whole-string / per-token rerank of the leaders -
//      restores word ORDER, which bag-of-trigrams cannot see ("kabe habe hena
//      dasa mora" vs "kabe hena dasa habe mora")
//
// Most real queries are decided by stage 1 alone, so the median query pays
// only for the title index; the expensive precision machinery runs exactly on
// the queries that need it.
// ---------------------------------------------------------------------------
export const CASCADE_PARAMS = {
  gateMargin: 1.2,   // top1/top2 score ratio that counts as "decided"
  gateCover: 0.5,    // share of the query's gram idf the winner must hold
  wPhon: 0.35,       // stage-2 fusion weights (title signal is 1.0)
  wPhonRescue: 0.6,  // phonetic weight when literal trigrams barely matched at all
  rescueCover: 0.3,  // literal coverage below which the query counts as "sound-alike only"
  wContent: 0.1,
  wRerank: 3.0,
  rerankK: 16,       // leaders re-scored with Levenshtein in stage 2
}

const sortChars = (s) => [...s].sort().join('')

/**
 * Semi-global alignment: edit distance of `needle` against the best-matching SUBSTRING of `hay`
 * (deletions at both ends of hay are free). Titles glue śrī + name + aṣṭakam into one long token
 * ("sricaitanyastakam") while people type the parts ("chatinya"); plain Levenshtein early-outs on
 * the length gap, but the infix alignment finds the "caitanya" inside.
 */
const DP_A = new Float64Array(640), DP_B = new Float64Array(640) // scratch rows; covers the longest translation line
function infixSimilarity(needle, hay) {
  const n = needle.length, m = hay.length
  if (!n || !m || m >= DP_A.length) return 0
  let prev = DP_A, curr = DP_B
  for (let j = 0; j <= m; j++) prev[j] = 0 // free start anywhere in hay
  for (let i = 1; i <= n; i++) {
    curr[0] = i
    for (let j = 1; j <= m; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (needle[i - 1] === hay[j - 1] ? 0 : 1))
    }
    ;[prev, curr] = [curr, prev]
  }
  let best = prev[0]
  for (let j = 1; j <= m; j++) if (prev[j] < best) best = prev[j]
  return 1 - best / n
}

/**
 * tokenScore plus two fallbacks it cannot see: sorted-character similarity for transpositions
 * ("asktam" / "astakam" share almost no trigrams and sit 3 edits apart, but their sorted
 * characters nearly coincide), and infix alignment for part-of-glued-token matches.
 */
function fuzzyTokenScore(qt, qtSorted, targetTokens, targetSorted) {
  let m = tokenScore(qt, targetTokens)
  if (m >= 0.9) return m
  for (let i = 0; i < targetTokens.length; i++) {
    const tt = targetTokens[i]
    if (Math.abs(tt.length - qt.length) <= 2) {
      const s = 0.85 * similarity(qtSorted, targetSorted[i])
      if (s > m) m = s
    } else if (qt.length >= 4 && tt.length > qt.length + 2) {
      const s = 0.9 * infixSimilarity(qt, tt)
      if (s > m) m = s
    }
  }
  return m
}

function gramField(docs, pick, normalizer) {
  const n = docs.length
  const postings = new Map()
  const norm = new Float64Array(n)
  docs.forEach((d, i) => {
    const set = new Set()
    for (const text of pick(d)) for (const g of ngrams(normalizer(text))) set.add(g)
    for (const g of set) {
      let p = postings.get(g)
      if (!p) postings.set(g, p = [])
      p.push(i)
    }
    norm[i] = 1 / Math.sqrt(set.size || 1)
  })
  return { postings, norm, n }
}

/** Accumulate idf per doc into `out`; returns the total idf the query could have earned. */
function gramAccumulate(idx, grams, out) {
  out.fill(0)
  let total = 0
  for (const g of grams) {
    const p = idx.postings.get(g)
    if (!p) continue
    const idf = Math.log(1 + idx.n / p.length)
    total += idf
    for (const i of p) out[i] += idf
  }
  return total
}

/**
 * One query-token vs one target-token, all signals fused: exact / prefix / include tiers,
 * plain Levenshtein, sorted-character transposition fallback, infix alignment for glued tokens.
 * Factored out of fuzzyTokenScore so the result can be memoized per (query token, target token) —
 * candidate lines repeat the same vocabulary, and the Levenshtein work dominates search latency.
 */
/** Multiset character overlap of two sorted strings — an upper bound on any edit similarity. */
function commonChars(aSorted, bSorted) {
  let i = 0, j = 0, c = 0
  while (i < aSorted.length && j < bSorted.length) {
    if (aSorted[i] === bSorted[j]) { c++; i++; j++ }
    else if (aSorted[i] < bSorted[j]) i++
    else j++
  }
  return c
}

function pairScore(qt, qtSorted, tt, ttSorted, cheap = false) {
  if (tt === qt) return 1
  const shorter = qt.length <= tt.length ? qt : tt
  const longer = shorter === qt ? tt : qt
  const lenScore = Math.min(0.92, 0.45 + 0.07 * shorter.length)
  let m = 0
  if (longer.startsWith(shorter)) m = lenScore
  else if (shorter.length >= 3 && longer.includes(shorter)) m = lenScore - 0.05
  // Stop-word tokens carry almost no idf weight; the exact/prefix tiers are all they earn.
  if (cheap) return m
  // similarity ≤ shared chars / max length: skip any DP that provably cannot beat `m`,
  // and band the ones that run to the caller's current best (exact above it).
  const bound = commonChars(qtSorted, ttSorted) / longer.length
  if (bound > m) m = Math.max(m, similarity(qt, tt, m))
  if (m >= 0.9) return m
  if (Math.abs(tt.length - qt.length) <= 2) {
    if (0.85 * bound > m) m = Math.max(m, 0.85 * similarity(qtSorted, ttSorted, m / 0.85))
  } else if (qt.length >= 4 && tt.length > qt.length + 2) {
    const infixBound = commonChars(qtSorted, ttSorted) / qt.length
    if (0.9 * infixBound > m) m = Math.max(m, 0.9 * infixSimilarity(qt, tt))
  }
  return m
}

/** fuzzyTokenScore with a per-query-token memo over target tokens. */
function memoTokenScore(qt, qtSorted, tk, tkSorted, memo, cheap = false, tkSet = null) {
  if (tkSet && tkSet.has(qt)) return 1 // exact hit: skip the token walk entirely
  let best = 0
  for (let i = 0; i < tk.length; i++) {
    const tt = tk[i]
    let s = memo.get(tt)
    if (s === undefined) {
      s = pairScore(qt, qtSorted, tt, tkSorted[i], cheap)
      memo.set(tt, s)
    }
    if (s > best) { best = s; if (best === 1) break }
  }
  return best
}

/**
 * Precision score for one candidate: best whole-string + token agreement over its title texts.
 * `qIdf` (optional, parallel to qTokens) idf-weights the coverage term so stop-word-heavy
 * queries cannot buy coverage with "the"/"of"; omitted, every token counts equally.
 * `memos` (optional, parallel to qTokens) memoizes token-pair scores across candidates.
 */
function rerankScore(qn, qTokens, qSorted, entries, qIdf = null, memos = null) {
  let best = 0
  for (const t of entries) {
    let s = similarity(qn, t.n)
    // People type the *front* of a title and stop. Compare against a same-length
    // prefix window too, so a long title is not punished for its untyped tail.
    if (t.n.length > qn.length + 2) {
      s = Math.max(s, 0.95 * similarity(qn, t.n.slice(0, qn.length + 2), s / 0.95))
    }
    if (t.n === qn) s = 1
    else if (t.n.startsWith(qn) || qn.startsWith(t.n)) s = Math.max(s, 0.85)
    else if (qn.length >= 4 && t.n.includes(qn)) s = Math.max(s, 0.75)
    let cov = 0, denom = 0
    for (let qi = 0; qi < qTokens.length; qi++) {
      const w = qIdf ? qIdf[qi] : 1
      cov += w * (memos
        ? memoTokenScore(qTokens[qi], qSorted[qi], t.tk, t.tkSorted, memos[qi], false, t.tkSet)
        : fuzzyTokenScore(qTokens[qi], qSorted[qi], t.tk, t.tkSorted))
      denom += w
    }
    cov = denom ? cov / denom : 0
    const combined = 0.6 * s + 0.4 * cov
    if (combined > best) best = combined
  }
  return best
}

export const cascade = {
  id: 'cascade',
  name: 'Cascade (gated trigram + rerank)',
  blurb: 'Fielded trigram fast path; phonetic + content + Levenshtein rerank only when the title index is undecided.',
  build(docs) {
    const P = CASCADE_PARAMS
    const title = gramField(docs, (d) => d.title ?? d.texts, baseline)
    const phon = gramField(docs, (d) => d.title ?? d.texts, phonetic)
    const content = gramField(docs, (d) => d.content ?? [], baseline)
    const titles = docs.map((d) =>
      (d.title ?? d.texts).map((x) => {
        const n = baseline(x), tk = tokenize(n)
        return { n, tk, tkSorted: tk.map(sortChars) }
      }))
    return {
      P, title, phon, content, titles,
      refs: docs.map((d) => d.ref),
      bufT: new Float64Array(docs.length),
      bufP: new Float64Array(docs.length),
      bufC: new Float64Array(docs.length),
    }
  },
  search(state, query, limit = 20) {
    const { P, title, phon, content, titles, refs, bufT, bufP, bufC } = state
    const qn = baseline(query)
    const grams = [...new Set(ngrams(qn))]
    if (!grams.length) return []

    // Stage 1: fielded title trigrams.
    const totalIdf = gramAccumulate(title, grams, bufT)
    const cand = []
    for (let i = 0; i < title.n; i++) {
      if (bufT[i] > 0) cand.push({ i, raw: bufT[i], score: bufT[i] * title.norm[i] })
    }
    cand.sort((a, b) => b.score - a.score)
    const top1 = cand[0], top2 = cand[1]
    if (top1 && totalIdf > 0 &&
        top1.raw / totalIdf >= P.gateCover &&
        (!top2 || top1.score >= top2.score * P.gateMargin)) {
      return cand.slice(0, limit).map((c) => ({ ref: refs[c.i], score: c.score }))
    }

    // Stage 2: the title index is undecided - bring in the other signals.
    gramAccumulate(phon, [...new Set(ngrams(phonetic(query)))], bufP)
    gramAccumulate(content, grams, bufC)
    // When the literal trigrams matched almost nothing, the query is a sound-alike
    // ("chatinya" / "caitanya") and the phonetic signal is the only one worth trusting.
    const literalCover = totalIdf > 0 && top1 ? top1.raw / totalIdf : 0
    const wPhon = literalCover < P.rescueCover ? P.wPhonRescue : P.wPhon
    let maxT = top1?.score || 1, maxP = 0, maxC = 0
    for (let i = 0; i < title.n; i++) {
      const p = bufP[i] * phon.norm[i]
      if (p > maxP) maxP = p
      const c = bufC[i] * content.norm[i]
      if (c > maxC) maxC = c
    }
    const fused = []
    for (let i = 0; i < title.n; i++) {
      const t = bufT[i] * title.norm[i]
      const p = bufP[i] * phon.norm[i]
      const c = bufC[i] * content.norm[i]
      if (t === 0 && p === 0 && c === 0) continue
      fused.push({
        i,
        score: t / maxT + (maxP ? (p / maxP) * wPhon : 0) + (maxC ? (c / maxC) * P.wContent : 0),
      })
    }
    fused.sort((a, b) => b.score - a.score)

    // Rerank the leaders with the precision scorer; order and near-exactness win here.
    const qTokens = tokenize(qn)
    const qSorted = qTokens.map(sortChars)
    const k = Math.min(P.rerankK, fused.length)
    for (let r = 0; r < k; r++) {
      const f = fused[r]
      f.score += P.wRerank * rerankScore(qn, qTokens, qSorted, titles[f.i])
    }
    fused.sort((a, b) => b.score - a.score)
    return fused.slice(0, limit).map((f) => ({ ref: refs[f.i], score: f.score }))
  },
}

// ---------------------------------------------------------------------------
// duet - one engine for BOTH truth sets on the title+content corpus. Two
// retrieval paths, each with the matcher its field needs, fused by max:
//
//   title path    fielded title trigrams + phonetic + the cascade rerank
//                 (misspelled queries: character grams + edit distance win)
//   content path  every verse LINE is its own document; trigram retrieval
//                 over lines, then a Levenshtein rerank of the leading lines,
//                 aggregated line -> song by max (never pooled - pooling is
//                 the documented 79.7% -> 23.4% failure)
//
// Both paths produce a score on the same [0,1]-anchored scale, so max-fusion
// is honest: a song wins by whichever field actually matched, and neither
// truth set can be bought by muting the other.
// ---------------------------------------------------------------------------
export const DUET_PARAMS = {
  dfCapFrac: 0.1,     // line-grams present in more than this share of lines are skipped (idf ~ 0)
  candTitles: 8,      // songs reranked on the title path
  candLines: 16,      // lines reranked on the content path (cheap coverage pass)
  strLines: 4,        // leaders that also get the whole-string alignment pass
  gateCover: 0.75,    // absolute share of query gram idf the title winner must hold to early-exit.
                      // High on purpose: a title-first gate is structurally biased against content
                      // queries (the documented cascade failure), so it may fire only when the
                      // query text is essentially fully explained by one title.
  gateMargin: 1.5,    // and it must clear the runner-up by this ratio
  skipLiteral: 0.15,  // skip phonetic + title rerank when literal AND phonetic title coverage
  skipPhon: 0.3,      //   both sit below these floors (sound-alike queries are low-literal but
                      //   HIGH-phonetic, which is what keeps them safe from the skip)
  stopIdf: 2.5,       // query tokens below this line-idf are matched with the cheap tiers only
  walkBudget: 4500,   // max content-posting entries walked per query; grams are consumed in
                      // ascending-df order, so what the budget drops is the near-zero-idf tail
  wPhon: 0.35,        // phonetic fusion weight (title path)
  wPhonRescue: 0.6,   // phonetic weight when literal trigrams matched almost nothing
  rescueCover: 0.3,   // literal coverage below which the query counts as sound-alike only
  wTitleGram: 1.0,    // retrieval-score weights inside each path's final score
  wLineGram: 1.0,
  wTitleRerank: 3.0,  // precision-score weights (dominant, as in cascade)
  wLineRerank: 2.5,
  wContent: 1.05,     // whole content path relative to the title path
}

/**
 * Per-line rerank, split in two so the expensive half can run on fewer lines.
 * Coverage is idf-weighted — an English semantic query is mostly stop words ("the dust of the
 * lotus feet"), and unweighted coverage lets any line full of "the"s tie the real target.
 */
function lineCovScore(qTokens, qSorted, qIdf, qCheap, line, memos) {
  let cov = 0, denom = 0
  for (let qi = 0; qi < qTokens.length; qi++) {
    cov += qIdf[qi] * memoTokenScore(qTokens[qi], qSorted[qi], line.tk, line.tkSorted, memos[qi], qCheap[qi], line.tkSet)
    denom += qIdf[qi]
  }
  return denom ? cov / denom : 0
}

/** Whole-string half: the query is a fragment from ANYWHERE in the line, so infix alignment leads. */
function lineStrScore(qn, line) {
  let s = similarity(qn, line.n)
  if (line.n.length > qn.length + 2) s = Math.max(s, 0.95 * infixSimilarity(qn, line.n))
  return s
}

export const duet = {
  id: 'duet',
  name: 'Duet (fielded title + per-line content)',
  blurb: 'Cascade title machinery fused with per-line content retrieval + rerank. Built to be ≥80% on both truth sets at once.',
  build(docs) {
    const P = DUET_PARAMS
    const title = gramField(docs, (d) => d.title ?? d.texts, baseline)
    const phon = gramField(docs, (d) => d.title ?? d.texts, phonetic)
    const titles = docs.map((d) =>
      (d.title ?? d.texts).map((x) => {
        const n = baseline(x), tk = tokenize(n)
        return { n, tk, tkSorted: tk.map(sortChars), tkSet: new Set(tk) }
      }))

    // Content: one document per LINE. lineSong maps a line back to its song.
    const lines = []
    const lineSong = []
    docs.forEach((d, si) => {
      for (const text of d.content ?? []) {
        const n = baseline(text)
        if (!n) continue
        const tk = tokenize(n)
        lines.push({ n, tk, tkSorted: tk.map(sortChars), tkSet: new Set(tk) })
        lineSong.push(si)
      }
    })
    const nLines = lines.length
    const postings = new Map()
    const lineNorm = new Float64Array(nLines)
    lines.forEach((l, i) => {
      const set = new Set(ngrams(l.n))
      for (const g of set) {
        let p = postings.get(g)
        if (!p) postings.set(g, p = [])
        p.push(i)
      }
      lineNorm[i] = 1 / Math.sqrt(set.size || 1)
    })
    // Drop postings that cover most lines: their idf is ~0 but their walk cost is the whole corpus.
    const dfCap = Math.max(2, Math.floor(nLines * P.dfCapFrac))
    for (const [g, p] of postings) if (p.length > dfCap) postings.delete(g)

    // Token document frequency across lines, for idf-weighting the rerank's coverage term.
    const tokenDf = new Map()
    for (const l of lines) for (const t of new Set(l.tk)) tokenDf.set(t, (tokenDf.get(t) ?? 0) + 1)

    return {
      tokenDf,
      P, title, phon, titles, refs: docs.map((d) => d.ref),
      line: { postings, n: nLines, norm: lineNorm, lines, song: Int32Array.from(lineSong) },
      bufT: new Float64Array(docs.length),
      bufP: new Float64Array(docs.length),
      bufL: new Float64Array(nLines),
      touched: new Int32Array(nLines), // lines hit by the current query; bufL is reset via this list
    }
  },
  search(state, query, limit = 20) {
    const { P, title, phon, titles, refs, line, bufT, bufP, bufL, tokenDf } = state
    const qn = baseline(query)
    const grams = [...new Set(ngrams(qn))]
    if (!grams.length) return []
    const qTokens = tokenize(qn)
    const qSorted = qTokens.map(sortChars)
    // Unseen tokens keep full idf: a rare word the corpus lacks can still fuzzy-match a rare one.
    const qIdf = qTokens.map((t) => Math.log(1 + line.n / (tokenDf.get(t) ?? 1)))
    const qCheap = qIdf.map((w) => w < P.stopIdf)
    const memos = qTokens.map(() => new Map())

    // --- title path: literal trigrams first; the other signals wait behind the gate.
    const totalIdf = gramAccumulate(title, grams, bufT)

    // Early exit — only when one title essentially explains the whole query AND clears the
    // runner-up. A looser title-first gate is the documented class-imbalance failure (a content
    // query that vaguely resembles some title would return "confidently" wrong), so the coverage
    // bar is deliberately high; typical content fragments hold well under half their gram idf
    // in any title.
    if (totalIdf > 0 && P.gateCover > 0) {
      let b1 = 0, b1i = -1, b2 = 0, rawBest = 0
      for (let i = 0; i < title.n; i++) {
        if (bufT[i] === 0) continue
        const s = bufT[i] * title.norm[i]
        if (s > b1) { b2 = b1; b1 = s; b1i = i; rawBest = bufT[i] }
        else if (s > b2) b2 = s
      }
      if (b1i >= 0 && rawBest / totalIdf >= P.gateCover && (b2 === 0 || b1 >= b2 * P.gateMargin)) {
        const out = []
        for (let i = 0; i < title.n; i++) {
          if (bufT[i] > 0) out.push({ ref: refs[i], score: bufT[i] * title.norm[i] })
        }
        out.sort((a, b) => b.score - a.score)
        return out.slice(0, limit)
      }
    }

    const totalPhonIdf = gramAccumulate(phon, [...new Set(ngrams(phonetic(query)))], bufP)
    const tCand = []
    for (let i = 0; i < title.n; i++) {
      const t = bufT[i] * title.norm[i], p = bufP[i] * phon.norm[i]
      if (t > 0 || p > 0) tCand.push({ i, t, p })
    }
    let maxT = 0, maxP = 0
    for (const c of tCand) { if (c.t > maxT) maxT = c.t; if (c.p > maxP) maxP = c.p }
    const top1 = tCand.reduce((a, c) => (c.t > (a?.t ?? 0) ? c : a), null)
    const literalCover = totalIdf > 0 && top1 ? bufT[top1.i] / totalIdf : 0
    const wPhon = literalCover < P.rescueCover ? P.wPhonRescue : P.wPhon
    for (const c of tCand) {
      c.score = (maxT ? (c.t / maxT) * P.wTitleGram : 0) + (maxP ? (c.p / maxP) * wPhon : 0)
    }
    tCand.sort((a, b) => b.score - a.score)
    // A query whose literal AND phonetic gram coverage are both tiny is not a title lookup in
    // any spelling; the precision rerank cannot promote it honestly, so skip the Levenshtein.
    let maxPRaw = 0
    for (const c of tCand) if (bufP[c.i] > maxPRaw) maxPRaw = bufP[c.i]
    const phonCover = totalPhonIdf > 0 ? maxPRaw / totalPhonIdf : 0
    const titleHopeless = literalCover < P.skipLiteral && phonCover < P.skipPhon
    const kT = titleHopeless ? 0 : Math.min(P.candTitles, tCand.length)
    for (let r = 0; r < kT; r++) {
      const c = tCand[r]
      c.score += P.wTitleRerank * rerankScore(qn, qTokens, qSorted, titles[c.i], qIdf, memos)
    }

    // --- content path: per-line trigram retrieval, rerank the leading lines.
    // The accumulator records which lines it touched, so selection walks only those
    // (typically a few thousand) instead of all 16k — and bufL is reset via the same list.
    const touched = state.touched
    let nTouched = 0
    const lps = []
    for (const g of grams) {
      const p = line.postings.get(g)
      if (p) lps.push(p)
    }
    lps.sort((a, b) => a.length - b.length) // rarest (highest idf) first
    let budget = P.walkBudget
    for (const p of lps) {
      if (budget <= 0) break
      budget -= p.length
      const idf = Math.log(1 + line.n / p.length)
      for (const i of p) {
        if (bufL[i] === 0) touched[nTouched++] = i
        bufL[i] += idf
      }
    }
    // Only the top candLines lines are ever consulted, so select them with a bounded
    // min-heap instead of materializing and sorting every touched line.
    const K = P.candLines
    const heapI = new Int32Array(K), heapS = new Float64Array(K)
    let heapN = 0
    for (let ti = 0; ti < nTouched; ti++) {
      const i = touched[ti]
      const s = bufL[i] * line.norm[i]
      if (heapN < K) {
        let j = heapN++
        heapI[j] = i; heapS[j] = s
        while (j > 0) { const par = (j - 1) >> 1; if (heapS[par] <= heapS[j]) break
          const ti = heapI[par]; heapI[par] = heapI[j]; heapI[j] = ti
          const ts = heapS[par]; heapS[par] = heapS[j]; heapS[j] = ts; j = par }
      } else if (s > heapS[0]) {
        heapI[0] = i; heapS[0] = s
        let j = 0
        for (;;) { const l = 2 * j + 1, r = l + 1; let m = j
          if (l < heapN && heapS[l] < heapS[m]) m = l
          if (r < heapN && heapS[r] < heapS[m]) m = r
          if (m === j) break
          const ti = heapI[m]; heapI[m] = heapI[j]; heapI[j] = ti
          const ts = heapS[m]; heapS[m] = heapS[j]; heapS[j] = ts; j = m }
      }
    }
    for (let ti = 0; ti < nTouched; ti++) bufL[touched[ti]] = 0 // reset for the next query
    let maxL = 0
    for (let j = 0; j < heapN; j++) if (heapS[j] > maxL) maxL = heapS[j]
    // Phase A (cheap, all candidates): gram + memoized token coverage.
    const lCand = []
    for (let j = 0; j < heapN; j++) {
      const i = heapI[j], g = heapS[j]
      const cov = lineCovScore(qTokens, qSorted, qIdf, qCheap, line.lines[i], memos)
      lCand.push({
        i, cov,
        score: (maxL ? (g / maxL) * P.wLineGram : 0) + P.wLineRerank * 0.4 * cov,
      })
    }
    // Phase B (whole-string alignment, the CPU hog): only the strLines leaders can be
    // promoted by it, so only they pay for it.
    lCand.sort((a, b) => b.score - a.score)
    const kB = Math.min(P.strLines, lCand.length)
    for (let r = 0; r < kB; r++) {
      const c = lCand[r]
      c.score += P.wLineRerank * 0.6 * lineStrScore(qn, line.lines[c.i])
    }
    const kL = lCand.length

    // --- fuse: a song scores by its best path.
    const fused = new Map()
    for (const c of tCand) {
      const prev = fused.get(c.i)
      if (prev === undefined || c.score > prev) fused.set(c.i, c.score)
    }
    for (let r = 0; r < kL; r++) {
      const c = lCand[r]
      const si = line.song[c.i]
      const s = c.score * P.wContent
      const prev = fused.get(si)
      if (prev === undefined || s > prev) fused.set(si, s)
    }
    return [...fused.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
      .map(([i, score]) => ({ ref: refs[i], score }))
  },
}

// ---------------------------------------------------------------------------
// jaigopal - ported from the earlier Gaudiya Kirtan app
// (gaudiyakirtan-master/ux-app: TransliterationUtils.fuzzy/getScore, driven by
// SongListSearch.tsx). Named here after its author.
//
// It is architecturally unlike everything else in this lab. Rather than measure
// how *similar* two strings are, it destroys almost all of the information in
// both and asks whether what survives is a substring. What survives is a
// consonant skeleton: diacritics folded, then r→d, y→j, v/w→b, o→a, aspirates
// collapsed (kh→k), homorganic nasals dropped (nd→d), doubles collapsed, spaces
// removed, and then EVERY VOWEL DELETED.
//
//   govinda / gobinda      → gbd
//   krishna / kṛṣṇa        → kds
//   vimostottra/biṁśottara → bmstd
//
// That last pair is the case docs/screens/search.md documents as tier 1's known
// limitation - hard metathesis that normalize+edit-distance cannot reach. Here
// it is not a near miss, it is an exact match, because transposed letters and
// the vowels around them were thrown away before comparison. Deleting the
// spaces also makes compound splitting free, which is 11.5% of real queries.
//
// Recall that aggressive needs a precision stage, so the skeleton is only a
// candidate filter; surviving candidates are ranked by Dice coefficient over
// character bigrams, computed on a much gentler fold (vowels intact). Two
// stages, opposite temperaments: a sieve that lets almost anything through and
// a judge that sorts it out.
//
// Faithful port, quirks included - see getScore.
// ---------------------------------------------------------------------------
function unDiac(s) {
  return s
    .replace(/ã|ā̃|ā/g, 'a').replace(/ĩ|ī̃|ī/g, 'i').replace(/ũ|ū̃|ū/g, 'u')
    .replace(/ẽ/g, 'e').replace(/õ/g, 'o')
    .replace(/ṛ|ṝ/g, 'r').replace(/ḷ|ḹ/g, 'l')
    .replace(/ḍ|ḓ|ɽ/g, 'd').replace(/ṅ|ṇ|ñ/g, 'n')
    .replace(/ś|ṣ/g, 's').replace(/ṁ/g, 'm').replace(/ḥ/g, 'h')
    .replace(/ṭ/g, 't').replace(/ẏ/g, 'y').replace(/·/g, '')
}

/** The consonant skeleton. Lossy on purpose: this is the recall stage. */
export function jgFuzzy(s) {
  return unDiac(s.replace(/(ḥ|h\W|h$)/g, ''))
    .replace(/\/|\\|-|!|,|\.|\(|\)|’|~|\?|‘/g, '')
    .replace(/(.)\1/g, '$1')
    .replace(/[0-9]/g, '')
    .replace(/ia/g, 'ya').replace(/f/g, 'ph').replace(/w/g, 'b').replace(/v/g, 'b')
    .replace(/r/g, 'd').replace(/y/g, 'j').replace(/o/g, 'a')
    .replace(/(s|c|k|g|j|d|t|c|b|p)h/g, '$1')   // de-aspirate
    .replace(/n(k|g|c|j|t|d)/g, '$1')           // de-nasalise
    .replace(/\s/g, '')                         // spaces last: de-nasal needed them
    .replace(/a|e|i|o|u/g, '')                  // de-vowel
    .replace(/(.)\1/g, '$1')
    .replace(/n$/, '')
}

/**
 * Dice coefficient over character bigrams, on a gentler fold than the skeleton.
 *
 * Ported verbatim, including two quirks that are part of its measured behaviour: getBigrams emits
 * a trailing 1-character "bigram", and the nested loop counts every matching pair rather than
 * every matched bigram, so repeated bigrams inflate the hit count. Fixing either changes the
 * ranking, so a "corrected" version would not be this algorithm.
 */
export function jgScore(a, b) {
  const str1 = unDiac(a).replace(/(\s|\W)/g, '')
    .replace(/v/g, 'b').replace(/r/g, 'd').replace(/y/g, 'j').replace(/o/g, 'a').toLowerCase()
  const str2 = unDiac(b).replace(/(\s|\W)/g, '')
    .replace(/f/g, 'ph').replace(/w/g, 'b').replace(/v/g, 'b')
    .replace(/r/g, 'd').replace(/y/g, 'j').replace(/o/g, 'a').toLowerCase()
  if (!str1.length || !str2.length) return 0
  const bg = (s) => { const v = s.split(''); for (let i = 0; i < v.length; i++) v[i] = s.slice(i, i + 2); return v }
  const p1 = bg(str1), p2 = bg(str2)
  let hits = 0
  for (let x = 0; x < p1.length; x++) for (let y = 0; y < p2.length; y++) if (p1[x] === p2[y]) hits++
  if (!hits) return 0
  return Math.min(1, (2 * hits) / (p1.length + p2.length))
}

/** Title matches must clear this; below it the skeleton hit is treated as coincidence. */
const JG_TITLE_FLOOR = 0.1
/** Channel offsets, replacing the original's lexicographic "0001…"/"1001…"/"2001…" sort keys. */
const JG_CH = { uidExact: 3000, uidPartial: 2000, title: 1000, content: 0 }

export const jaigopal = {
  id: 'jaigopal',
  name: 'Jaigopal (skeleton sieve + Dice)',
  blurb: 'Consonant-skeleton containment for recall, Dice bigram similarity for rank. Three channels: uid, title, content.',
  build(docs) {
    return docs.map((d) => {
      const title = (d.title ?? d.texts).join(' ')
      const lines = d.content ?? []
      return {
        ref: d.ref,
        title,
        fuzzyTitle: jgFuzzy(title.toLowerCase()),
        lines,
        // Per-line skeletons. The original packed {verse|line} markers into one big string and
        // parsed the offset back out; keeping the lines apart does the same job directly, and
        // means the snippet that gets scored is the line that actually matched.
        fuzzyLines: lines.map((l) => jgFuzzy(String(l).toLowerCase())),
        fuzzyContent: jgFuzzy(lines.join(' ').toLowerCase()),
      }
    })
  },
  search(state, query, limit = 20) {
    const q = String(query)
    const fq = jgFuzzy(q.toLowerCase())
    const uq = q.toUpperCase()
    const best = new Map()
    const offer = (ref, score) => {
      const prev = best.get(ref)
      if (prev === undefined || score > prev) best.set(ref, score)
    }

    for (const d of state) {
      // channel 1 - uid. Exact outranks partial, and both outrank any fuzzy match.
      if (d.ref.toUpperCase() === uq) offer(d.ref, JG_CH.uidExact + 1)
      else if (d.ref.toUpperCase().includes(uq)) offer(d.ref, JG_CH.uidPartial + 1)

      // channel 2 - title.
      if (fq.length > 0 && d.fuzzyTitle.includes(fq)) {
        const s = jgScore(d.title, q)
        if (s > JG_TITLE_FLOOR) offer(d.ref, JG_CH.title + s)
      }

      // channel 3 - content. Needs a longer skeleton: a 1-2 character skeleton is a substring of
      // half the corpus, which is why the original gated it at length > 2.
      if (fq.length > 2 && d.fuzzyContent.includes(fq)) {
        let sBest = 0
        for (let i = 0; i < d.fuzzyLines.length; i++) {
          if (!d.fuzzyLines[i].includes(fq)) continue
          const s = jgScore(d.lines[i], q)
          if (s > sBest) sBest = s
        }
        // Skeleton hit spanning a line break: score the whole song rather than drop it.
        if (sBest === 0) sBest = jgScore(d.lines.join(' '), q)
        offer(d.ref, JG_CH.content + sBest)
      }
    }

    return [...best.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
      .map(([ref, score]) => ({ ref, score }))
  },
}

export const ENGINES = [current, bm25, bm25Fuzzy, trigram, phoneticEngine, hybrid, trigramFielded, cascade, duet, jaigopal]
