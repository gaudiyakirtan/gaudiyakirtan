// Repository for the full Song aggregate (docs/data/song.md). Build-time only - reads the
// bundled canonical JSON from src/data/songs/*.json via Node fs. No runtime backend, no
// network calls: this is the offline-first, static data source for getStaticProps/getStaticPaths.
import fs from 'fs'
import path from 'path'
import { ISong } from '../models/Song'
import { decodeSong } from './decode'

const SONGS_DIR = path.join(process.cwd(), 'src', 'data', 'songs')

let cachedUids: string[] | null = null
let songCache: Map<string, ISong> | null = null

/** All song uids in the shipped corpus, derived from the bundled JSON filenames. */
export function getAllSongUids(): string[] {
  if (cachedUids) return cachedUids
  cachedUids = fs
    .readdirSync(SONGS_DIR)
    .filter((filename) => filename.endsWith('.json'))
    .map((filename) => filename.replace(/\.json$/, ''))
  return cachedUids
}

/** Loads and decodes one full Song by uid. Returns null when the uid doesn't exist. */
export function getSongByUid(uid: string): ISong | null {
  if (songCache?.has(uid)) return songCache.get(uid) ?? null

  const filePath = path.join(SONGS_DIR, `${uid}.json`)
  if (!fs.existsSync(filePath)) return null

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  const song = decodeSong(raw)

  if (!songCache) songCache = new Map()
  songCache.set(uid, song)
  return song
}

/** Loads every song in the corpus. Build-time only - used by repositories that must scan
 * the full song set (e.g. deriving authors); never call this from a per-page hot path. */
export function getAllSongs(): ISong[] {
  return getAllSongUids()
    .map((uid) => getSongByUid(uid))
    .filter((song): song is ISong => song !== null)
}
