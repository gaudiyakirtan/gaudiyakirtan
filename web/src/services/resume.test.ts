// Unit tests for resume-record serialization (src/services/resume.ts).
import { describe, expect, it } from 'vitest'
import { buildResumeRecord, IResumableSong, parseResumeRecord, shouldPersist } from './resume'

const song: IResumableSong = {
  uid: 'A10',
  titleMain: [{ scriptCode: 'Latn', text: 'Test Song' }],
  authorDisplay: [{ scriptCode: 'Latn', text: 'Test Author' }],
  authorUid: 'tama',
  tracks: [
    { uid: 'bvsm-1', filename: 'A10-bvsm-1.mp3' },
    { uid: 'anad-2', filename: 'A10-anad-2.mp3', artist: 'Ananda dasa' },
  ],
}

describe('buildResumeRecord', () => {
  it('captures the song slice, take, position, and save time', () => {
    const record = buildResumeRecord(song, 'anad-2', 42.5, 1_000)
    expect(record).toEqual({ song, trackUid: 'anad-2', position: 42.5, savedAt: 1_000 })
  })

  it('never persists a negative position', () => {
    expect(buildResumeRecord(song, 'bvsm-1', -3, 1_000).position).toBe(0)
  })
})

describe('parseResumeRecord', () => {
  const now = 2_000_000

  it('round-trips a record written by buildResumeRecord', () => {
    const raw = JSON.stringify(buildResumeRecord(song, 'anad-2', 12, now - 1_000))
    expect(parseResumeRecord(raw, now)).toEqual({
      song,
      trackUid: 'anad-2',
      position: 12,
      savedAt: now - 1_000,
    })
  })

  it('returns null for null/empty input', () => {
    expect(parseResumeRecord(null, now)).toBeNull()
    expect(parseResumeRecord('', now)).toBeNull()
  })

  it('returns null for unparsable JSON rather than throwing', () => {
    expect(parseResumeRecord('{not json', now)).toBeNull()
  })

  it('returns null when the saved trackUid is not among the saved tracks', () => {
    const raw = JSON.stringify(buildResumeRecord(song, 'no-such-take', 12, now))
    expect(parseResumeRecord(raw, now)).toBeNull()
  })

  it('returns null for a record older than 30 days (stale sessions are not resurrected)', () => {
    const thirtyOneDaysMs = 1000 * 60 * 60 * 24 * 31
    const raw = JSON.stringify(buildResumeRecord(song, 'bvsm-1', 5, now - thirtyOneDaysMs))
    expect(parseResumeRecord(raw, now)).toBeNull()
  })

  it('returns null for a shape missing required fields', () => {
    expect(parseResumeRecord(JSON.stringify({ song }), now)).toBeNull()
    expect(parseResumeRecord(JSON.stringify({ trackUid: 'x', position: 1, savedAt: now }), now)).toBeNull()
  })
})

describe('shouldPersist', () => {
  it('gates on the elapsed interval, not every call', () => {
    expect(shouldPersist(1_000, 4_000, 5_000)).toBe(false)
    expect(shouldPersist(1_000, 6_000, 5_000)).toBe(true)
  })
})
