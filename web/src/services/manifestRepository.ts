// Repository for the Manifest (docs/data/manifest.md) - the lightweight catalog index every
// list/search/browse screen should read instead of loading full Song objects. Build-time only.
import fs from 'fs'
import path from 'path'
import { IManifestEntry } from '../models/Manifest'
import { decodeManifestEntry } from './decode'

const MANIFEST_PATH = path.join(process.cwd(), 'src', 'data', 'manifest.json')

let cachedManifest: IManifestEntry[] | null = null

/** The full catalog index, decoded from the bundled manifest.json (703 entries). */
export function getManifest(): IManifestEntry[] {
  if (cachedManifest) return cachedManifest
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any[] = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'))
  const entries = raw.map(decodeManifestEntry)
  cachedManifest = entries
  return entries
}

/** A single manifest entry by uid, or null when not found. */
export function getManifestEntry(uid: string): IManifestEntry | null {
  return getManifest().find((entry) => entry.uid === uid) ?? null
}
