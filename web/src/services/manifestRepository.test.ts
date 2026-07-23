// Unit tests for the Manifest repository (docs/data/manifest.md) against the REAL bundled
// src/data/manifest.json - the lightweight catalog index every list/search/browse screen reads.
import { describe, expect, it } from 'vitest'
import { getManifest, getManifestEntry } from './manifestRepository'
import { getAllSongUids } from './songRepository'

describe('getManifest', () => {
  it('has one entry per song, all unique, covering the full shipped set', () => {
    const manifest = getManifest()
    expect(manifest).toHaveLength(702)
    const uids = manifest.map((e) => e.uid)
    expect(new Set(uids).size).toBe(702)
  })

  it('every entry has the required fields decoded (docs/data/manifest.md)', () => {
    for (const entry of getManifest()) {
      expect(entry.uid).toBeTruthy()
      expect(entry.primaryTitle.text).toBeTruthy()
      expect(entry.authorUid).toBeTruthy()
      expect(entry.languageOfOrigin).toBeTruthy()
      expect(typeof entry.audioAvailable).toBe('boolean')
      expect(entry.md5).toMatch(/^[0-9a-f]{32}$/)
    }
  })

  it('every manifest uid resolves to an actual bundled song file', () => {
    const songUids = new Set(getAllSongUids())
    for (const entry of getManifest()) {
      expect(songUids.has(entry.uid)).toBe(true)
    }
  })

  it('caches the decoded manifest across calls (same array identity)', () => {
    expect(getManifest()).toBe(getManifest())
  })
})

describe('getManifestEntry', () => {
  it('finds a known entry by uid', () => {
    const entry = getManifestEntry('G2')
    expect(entry).not.toBeNull()
    expect(entry!.uid).toBe('G2')
  })

  it('returns null for an unknown uid', () => {
    expect(getManifestEntry('NOT-A-REAL-UID')).toBeNull()
  })
})
