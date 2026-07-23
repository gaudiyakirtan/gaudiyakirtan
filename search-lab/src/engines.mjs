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

export const ENGINES = [current, bm25, bm25Fuzzy, trigram, phoneticEngine, hybrid]
