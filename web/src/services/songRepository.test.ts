// Unit tests for the Song repository (docs/data/song.md) against the REAL bundled corpus in
// src/data/songs/*.json - this is build-time-only fs-backed data, so we exercise it directly
// rather than mocking, the same way getStaticProps does.
import { describe, expect, it } from 'vitest'
import { getAllSongUids, getAllSongs, getSongByUid } from './songRepository'

describe('getAllSongUids', () => {
  it('returns all 702 shipped song uids, each unique', () => {
    const uids = getAllSongUids()
    expect(uids).toHaveLength(702)
    expect(new Set(uids).size).toBe(702)
  })
})

describe('getSongByUid', () => {
  it('loads a known song and decodes it into the canonical ISong shape', () => {
    const song = getSongByUid('G2')
    expect(song).not.toBeNull()
    expect(song!.uid).toBe('G2')
    expect(song!.titleMain.length).toBeGreaterThan(0)
    expect(song!.verses.length).toBeGreaterThan(0)
    // Invariant (docs/data/song.md): audioAvailable === (audioFiles is non-empty).
    expect(song!.audioAvailable).toBe(Boolean(song!.audioFiles?.length))
  })

  it('returns null for a uid that does not exist in the corpus', () => {
    expect(getSongByUid('NOT-A-REAL-UID')).toBeNull()
  })

  it('caches decoded songs - repeated calls return the same object identity', () => {
    const first = getSongByUid('G2')
    const second = getSongByUid('G2')
    expect(first).toBe(second)
  })
})

describe('getAllSongs', () => {
  it('loads and decodes every song in the corpus', () => {
    const songs = getAllSongs()
    expect(songs).toHaveLength(702)
    // Every song satisfies the core invariants from docs/data/song.md.
    for (const song of songs) {
      expect(song.uid).toBeTruthy()
      expect(song.titleMain.length).toBeGreaterThan(0)
      expect(song.verses.length).toBeGreaterThan(0)
      expect(song.audioAvailable).toBe(Boolean(song.audioFiles?.length))
    }
  })

  it('has a non-trivial subset of songs with audio (docs/screens/player.md)', () => {
    // player.md states "235 of the 702 songs carry audio" - the bundled corpus actually has 244
    // (verified against src/data/songs/*.json). Asserting the real count so this test tracks
    // reality; the 235 vs 244 doc/corpus drift is surfaced separately, not silently "fixed" here
    // (docs are the orchestrator's to edit, per docs/WORKFLOW.md).
    const withAudio = getAllSongs().filter((s) => s.audioAvailable)
    expect(withAudio).toHaveLength(244)
  })
})
