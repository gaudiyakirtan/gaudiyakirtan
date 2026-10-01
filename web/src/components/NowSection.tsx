import { useEffect, useMemo, useState } from 'react'
// Direct import: the services barrel pulls server-only fs code into client components.
import { getSongsForDate } from '../services/calendarRepository'
import { ICalendarToday } from '../models/Calendar'
import { ISongListing } from '../services/songListingView'
import { AuthorNames, ITrackSong } from '../services/trackListingView'
import { homeMonthSongs, millisecondsToLocalMidnight } from '../utils/homeCalendar'
import { MonthContext } from './MonthContext'
import { MonthSongs } from './MonthSongs'

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
  if (!hydrated) return (
    <div className="home-seasonal" aria-hidden="true" data-testid="seasonal-placeholder">
      <div className="home-seasonal-card home-month-context"><div className="home-placeholder-label" /></div>
      <div className="home-seasonal-card">
        <div className="home-placeholder-label mb-4" />
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="home-placeholder-row" />)}
      </div>
    </div>
  )
  if (!now) return null
  return (
    <div className="home-seasonal" data-testid="seasonal-composition">
      <MonthContext window={now.window} month={now.month} />
      <MonthSongs key={now.window.start} songs={songs} trackSongsByUid={trackSongsByUid} authors={authors} obscured={obscured} />
    </div>
  )
}
