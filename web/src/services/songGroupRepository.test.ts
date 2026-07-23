// Unit tests for the SongGroup repository (docs/data/collections.md) against the REAL bundled
// src/data/song_groups.json (21 groups: 7 books + 14 topics — rebuilt from the Gīti-guccha hierarchy
// with a books-are-works / topics-are-themes taxonomy; see rebuild_song_groups.py).
import { describe, expect, it } from 'vitest'
import { getSongGroupByUid, getSongGroups } from './songGroupRepository'
import { getAllSongUids } from './songRepository'

describe('getSongGroups', () => {
  it('returns the 7 shipped books (named works)', () => {
    const books = getSongGroups('book')
    expect(books).toHaveLength(7)
    expect(books.every((b) => b.kind === 'book')).toBe(true)
  })

  it('returns the 14 shipped topics (themes)', () => {
    const topics = getSongGroups('topic')
    expect(topics).toHaveLength(14)
    expect(topics.every((t) => t.kind === 'topic')).toBe(true)
    // The single-song-topic problem is gone: every topic is a real cluster.
    expect(topics.every((t) => t.songUids.length >= 4)).toBe(true)
  })

  it('returns [] for collection - no collection-kind data ships yet', () => {
    expect(getSongGroups('collection')).toEqual([])
  })

  it('books are ordered=true (song order authoritative); topics are ordered=false', () => {
    expect(getSongGroups('book').every((b) => b.ordered === true)).toBe(true)
    expect(getSongGroups('topic').every((t) => t.ordered === false)).toBe(true)
  })

  it('every group has at least one title and one member song (empty groups are dropped by the pipeline)', () => {
    for (const group of [...getSongGroups('book'), ...getSongGroups('topic')]) {
      expect(group.titles.length).toBeGreaterThan(0)
      expect(group.songUids.length).toBeGreaterThan(0)
    }
  })
})

describe('song-group resolution (docs/data/collections.md invariant)', () => {
  it('the "Śaraṇāgati" book resolves to its member songs', () => {
    const book = getSongGroupByUid('book-saranagati')
    expect(book).not.toBeNull()
    expect(book!.kind).toBe('book')
    // Compare NFC-normalized (the data may ship NFD-composed diacritics).
    expect(book!.titles.some((t) => t.text.normalize('NFC') === 'Śaraṇāgati'.normalize('NFC'))).toBe(true)
    expect(book!.songUids.length).toBeGreaterThan(0)
  })

  it('every song_uids entry, across every group, resolves to an existing shipped song', () => {
    const songUids = new Set(getAllSongUids())
    const allGroups = [...getSongGroups('book'), ...getSongGroups('topic'), ...getSongGroups('collection')]
    const unresolved: string[] = []
    for (const group of allGroups) {
      for (const uid of group.songUids) {
        if (!songUids.has(uid)) unresolved.push(`${group.uid} -> ${uid}`)
      }
    }
    expect(unresolved).toEqual([])
  })

  it('book uids are unique within their kind (docs/data/collections.md invariant)', () => {
    const uids = getSongGroups('book').map((g) => g.uid)
    expect(new Set(uids).size).toBe(uids.length)
  })

  // The earlier truncation-collision data-quality issue was fixed upstream: build_song_groups.py's
  // rewritten uid scheme (`topic-<book key>-<topic key>`, deduped) now yields unique topic uids, so
  // getSongGroupByUid resolves every topic. This asserts the invariant that previously failed.
  it('topic uids are unique within their kind (collections.md invariant)', () => {
    const uids = getSongGroups('topic').map((g) => g.uid)
    const counts = new Map<string, number>()
    for (const uid of uids) counts.set(uid, (counts.get(uid) ?? 0) + 1)
    const duplicates = [...counts.entries()].filter(([, count]) => count > 1)
    expect(duplicates).toEqual([])
  })
})

describe('getSongGroupByUid', () => {
  it('returns null for an unknown uid', () => {
    expect(getSongGroupByUid('not-a-real-group')).toBeNull()
  })
})
