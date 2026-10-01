import { useEffect, useMemo, useState } from 'react'
// Direct import: the services barrel pulls server-only fs code into client components.
import { getSongsForDate } from '../services/calendarRepository'
import { ICalendarToday } from '../models/Calendar'
import { ISongListing } from '../services/songListingView'
import { AuthorNames, ITrackSong } from '../services/trackListingView'
import { homeMonthSongs, millisecondsToLocalMidnight } from '../utils/homeCalendar'
import { MonthContext } from './MonthContext'
import { MonthSongs } from './MonthSongs'
import { HomeFeaturedSong } from './HomeFeaturedSong'

interface INowSectionProps {
  listingsByUid: Record<string, ISongListing>
  trackSongsByUid: Record<string, ITrackSong>
  authors: AuthorNames
  obscured: boolean
}

export function NowSection({ listingsByUid, trackSongsByUid, authors, obscured }: INowSectionProps) {
  const [now, setNow] = useState<ICalendarToday | null>(null)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    let midnight: ReturnType<typeof setTimeout>
    let lastClock = ''
    const refresh = () => {
      const date = new Date()
      // Detect timezone changes while foregrounded without resetting an open picker every minute.
      const clock = `${date.toDateString()}/${date.getTimezoneOffset()}/${Intl.DateTimeFormat().resolvedOptions().timeZone}`
      if (clock !== lastClock) {
        lastClock = clock
        setNow(getSongsForDate(date))
      }
      setHydrated(true)
      clearTimeout(midnight)
      midnight = setTimeout(refresh, millisecondsToLocalMidnight(date) + 20)
    }
    refresh()
    const zoneCheck = setInterval(refresh, 60_000)
    window.addEventListener('focus', refresh)
    window.addEventListener('pageshow', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearTimeout(midnight)
      clearInterval(zoneCheck)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('pageshow', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  const songs = useMemo(() => now ? homeMonthSongs(now.month, listingsByUid, trackSongsByUid) : [], [now, listingsByUid, trackSongsByUid])
  const listenSong = useMemo(
    () => songs.map((song) => trackSongsByUid[song.uid]).find((song) => song?.tracks.length)
      ?? Object.values(trackSongsByUid).find((song) => song.tracks.length),
    [songs, trackSongsByUid],
  )
  if (!hydrated) return (
    <div className="home-opening home-opening-placeholder" aria-hidden="true" data-testid="seasonal-placeholder">
      <div className="home-feature-placeholder" />
      <div className="home-repertoire-placeholder" />
    </div>
  )
  return (
    <div className="home-opening" data-testid="seasonal-composition" data-season={Boolean(now)}>
      <HomeFeaturedSong song={listenSong} authors={authors} />
      {now && <div className="home-season">
        <MonthContext window={now.window} month={now.month} />
        <MonthSongs
          key={now.window.start}
          songs={songs}
          trackSongsByUid={trackSongsByUid}
          authors={authors}
          obscured={obscured}
        />
      </div>}
    </div>
  )
}
