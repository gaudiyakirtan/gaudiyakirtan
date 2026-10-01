import { describe, expect, it } from 'vitest'
import { homeMonthSongs, millisecondsToLocalMidnight } from './homeCalendar'
import { getCalendar } from '../services/calendarRepository'
import { getSongListings } from '../services/songListing'
import { getTrackSongs } from '../services/trackListing'

const listings = Object.fromEntries(getSongListings().map((song) => [song.uid, song]))
const tracks = Object.fromEntries(getTrackSongs().map((song) => [song.uid, song]))

describe('Home seasonal selection', () => {
  it('preserves each shipped partition and caps only after moving actual recordings first', () => {
    for (const month of getCalendar().months) {
      const resolved = month.songs.map(({ uid }) => uid).filter((uid) => listings[uid])
      const playable = resolved.filter((uid) => tracks[uid]?.tracks.length)
      const reading = resolved.filter((uid) => !tracks[uid]?.tracks.length)
      expect(homeMonthSongs(month, listings, tracks).map(({ uid }) => uid)).toEqual([...playable, ...reading].slice(0, 6))
    }
  })
  it('drops unresolved references and does not treat an empty take list as playable', () => {
    const month = { ...getCalendar().months[0], songs: ['missing', 'A8', 'K1'].map((uid) => ({ uid, basis: 'thematic' as const })) }
    const emptyTracks = { ...tracks, A8: { ...tracks.A8, tracks: [] } }
    expect(homeMonthSongs(month, listings, emptyTracks).map(({ uid }) => uid)).toEqual(['K1', 'A8'])
  })
})

describe('local midnight refresh', () => {
  it('uses the next local day even across DST and year boundaries', () => {
    const original = process.env.TZ
    process.env.TZ = 'America/New_York'
    try {
      expect(millisecondsToLocalMidnight(new Date(2026, 2, 8))).toBe(23 * 60 * 60 * 1000)
      expect(millisecondsToLocalMidnight(new Date(2026, 10, 1))).toBe(25 * 60 * 60 * 1000)
      expect(millisecondsToLocalMidnight(new Date(2026, 11, 31, 23, 59, 59))).toBe(1000)
    } finally {
      if (original === undefined) delete process.env.TZ
      else process.env.TZ = original
    }
  })
})
