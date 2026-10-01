import { ICalendarMonth } from '../models/Calendar'
import { ISongListing } from '../services/songListingView'
import { ITrackSong } from '../services/trackListingView'

/** Resolve first, partition in shipped order using actual takes, then apply Web's cap. */
export function homeMonthSongs(
  month: ICalendarMonth,
  listings: Record<string, ISongListing>,
  tracks: Record<string, ITrackSong>,
): ISongListing[] {
  const resolved = month.songs.map(({ uid }) => listings[uid]).filter(Boolean)
  return [
    ...resolved.filter(({ uid }) => tracks[uid]?.tracks.length),
    ...resolved.filter(({ uid }) => !tracks[uid]?.tracks.length),
  ].slice(0, 6)
}

/** Local calendar arithmetic also handles 23/25-hour days at DST boundaries. */
export function millisecondsToLocalMidnight(now: Date): number {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()
}
