// Unit tests for the pure queue-advance logic (src/services/playerQueue.ts).
import { describe, expect, it } from 'vitest'
import { IPlayerQueue, queueNeighbor, queuePosition, resolveTrackEndAction } from './playerQueue'

const bookQueue: IPlayerQueue = {
  context: { kind: 'book', groupUid: 'book-saranagati', title: 'Śaraṇāgati' },
  uids: ['S1', 'S2', 'S3'],
}

describe('queueNeighbor', () => {
  it('returns the next uid, or null past the end', () => {
    expect(queueNeighbor(bookQueue, 'S1', 1)).toBe('S2')
    expect(queueNeighbor(bookQueue, 'S3', 1)).toBeNull()
  })

  it('returns the previous uid, or null before the start', () => {
    expect(queueNeighbor(bookQueue, 'S2', -1)).toBe('S1')
    expect(queueNeighbor(bookQueue, 'S1', -1)).toBeNull()
  })

  it('returns null when there is no armed queue', () => {
    expect(queueNeighbor(null, 'S1', 1)).toBeNull()
  })

  it('returns null when the current song is not in the queue (reader navigated elsewhere)', () => {
    expect(queueNeighbor(bookQueue, 'GH1', 1)).toBeNull()
  })
})

describe('queuePosition', () => {
  it('is 1-based and includes the total', () => {
    expect(queuePosition(bookQueue, 'S2')).toEqual({ index: 2, total: 3 })
  })

  it('is null off-queue or with no queue armed', () => {
    expect(queuePosition(bookQueue, 'GH1')).toBeNull()
    expect(queuePosition(null, 'S1')).toBeNull()
  })
})

describe('resolveTrackEndAction', () => {
  const base = {
    isLooping: false,
    sleepEndOfTrack: false,
    autoContinueNextTrackUid: null,
    queue: bookQueue,
    currentSongUid: 'S1',
  }

  it('a sleep timer armed for "end of track" always wins, even over repeat and a queued next song', () => {
    expect(
      resolveTrackEndAction({
        ...base,
        sleepEndOfTrack: true,
        isLooping: true,
        autoContinueNextTrackUid: 'bvsm-2',
      })
    ).toEqual({ type: 'stop' })
  })

  it('repeat-one wins over both auto-continue and queue-advance', () => {
    expect(
      resolveTrackEndAction({ ...base, isLooping: true, autoContinueNextTrackUid: 'bvsm-2' })
    ).toEqual({ type: 'repeat' })
  })

  it('auto-continue to the next take wins over advancing the queue', () => {
    expect(resolveTrackEndAction({ ...base, autoContinueNextTrackUid: 'bvsm-2' })).toEqual({
      type: 'next-take',
      trackUid: 'bvsm-2',
    })
  })

  it('advances to the next song in the armed queue once takes are exhausted', () => {
    expect(resolveTrackEndAction(base)).toEqual({ type: 'advance', nextSongUid: 'S2' })
  })

  it('stops at the end of the queue with nothing else to do', () => {
    expect(resolveTrackEndAction({ ...base, currentSongUid: 'S3' })).toEqual({ type: 'stop' })
  })

  it('stops with no queue armed at all', () => {
    expect(resolveTrackEndAction({ ...base, queue: null })).toEqual({ type: 'stop' })
  })
})
