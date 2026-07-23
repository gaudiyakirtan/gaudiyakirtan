// Node-side loader. The corpus *shapes* live in corpus-defs.mjs so the browser UI builds the
// identical document sets from the identical definitions.
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import { buildCorpora, titleIndex } from './corpus-defs.mjs'

const GEN = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '../data/gen')
const read = (f) => JSON.parse(fs.readFileSync(path.join(GEN, f), 'utf8'))

export function loadCorpora() { return buildCorpora(read('titles.json'), read('content.json')) }
export function loadGroundTruth() { return read('groundtruth.json') }
export function loadEntities() { return read('entities.json') }
export function byUidTitle() { return titleIndex(read('titles.json')) }

/**
 * Content ground truth: 250 hand-written queries + 250 generated ones.
 *
 * The two halves are deliberately different instruments and should be read separately. The
 * generated half applies the transformation distribution measured off the real title attempts
 * (see analyze-queries.mjs) to a random verse line - it is reproducible, unlimited, and tests
 * robustness to *spelling* noise. The hand-written half is the part a generator cannot produce:
 * queries from the meaning of the verse, devotional English phrasing, half-remembered phrases,
 * and native-script input. An engine can score well on one and badly on the other, which is
 * exactly the signal we want.
 */
export function loadContentTruth() {
  const authored = JSON.parse(
    fs.readFileSync(path.join(path.dirname(GEN), 'authored-content-queries.json'), 'utf8'))
  let synth = []
  const p = path.join(GEN, 'content-queries-synth.json')
  if (fs.existsSync(p)) synth = JSON.parse(fs.readFileSync(p, 'utf8'))
  return [...authored, ...synth]
}
