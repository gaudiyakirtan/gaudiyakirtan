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
