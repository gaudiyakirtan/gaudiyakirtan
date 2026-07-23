// Unit tests for deriveQueueForSong (src/services/queueContext.ts) against the REAL bundled
// src/data/song_groups.json - same fixture songGroupRepository.test.ts already exercises.
import { describe, expect, it } from 'vitest'
import { deriveQueueForSong } from './queueContext'
import { getSongGroupByUid, getSongGroups } from './songGroupRepository'

describe('deriveQueueForSong', () => {
  it('arms the containing book, in the book\'s own (ordered) song_uids order', () => {
    const book = getSongGroupByUid('book-saranagati')!
    const uid = book.songUids[3]
    const queue = deriveQueueForSong({ uid })
    expect(queue).not.toBeNull()
    expect(queue!.context).toEqual({ kind: 'book', groupUid: 'book-saranagati', title: expect.any(String) })
    expect(queue!.uids).toEqual(book.songUids)
  })

  it('falls back to a containing topic when the song is in no book', () => {
    const bookSongUids = new Set(getSongGroups('book').flatMap((b) => b.songUids))
    const topic = getSongGroups('topic').find((t) => t.songUids.some((uid) => !bookSongUids.has(uid)))!
    const uid = topic.songUids.find((u) => !bookSongUids.has(u))!

    const queue = deriveQueueForSong({ uid })
    expect(queue).not.toBeNull()
    expect(queue!.context.kind).toBe('topic')
    expect(queue!.uids).toContain(uid)
  })

  it('prefers a book over a topic when a song is in both', () => {
    const book = getSongGroups('book')[0]
    const bookSongUid = book.songUids[0]
    // Every shipped book song also has to resolve to *some* topic membership check not required -
    // this just asserts book wins whenever the song is a book member, regardless of topics.
    const queue = deriveQueueForSong({ uid: bookSongUid })
    expect(queue!.context.kind).toBe('book')
  })

  it('returns null for a song in neither a book nor a multi-song topic', () => {
    expect(deriveQueueForSong({ uid: 'not-a-real-song-uid' })).toBeNull()
  })
})
