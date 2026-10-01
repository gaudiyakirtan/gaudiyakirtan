import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { ISongListing } from '../services/songListingView'
import { AuthorNames, ITrackSong } from '../services/trackListingView'
import { SongListItem } from './SongListItem'
import { HomeRecordingPicker } from './HomeRecordingPicker'

interface IMonthSongsProps {
  songs: ISongListing[]
  trackSongsByUid: Record<string, ITrackSong>
  authors: AuthorNames
  obscured: boolean
}

export function MonthSongs({ songs, trackSongsByUid, authors, obscured }: IMonthSongsProps) {
  const [openUid, setOpenUid] = useState<string | null>(null)
  const router = useRouter()
  useEffect(() => {
    const close = () => setOpenUid(null)
    router.events.on('routeChangeStart', close)
    return () => router.events.off('routeChangeStart', close)
  }, [router.events])
  useEffect(() => { if (obscured) setOpenUid(null) }, [obscured])
  return (
    <article className="home-v6-card home-v6-month-songs" aria-labelledby="month-songs-heading">
      <div className="home-v6-list-heading">
        <h2 id="month-songs-heading">Sung this month</h2>
        <span>{songs.length}</span>
      </div>
      {/* Explicit role: WebKit drops list semantics from `list-style: none` lists. */}
      {songs.length ? <ul role="list" className="home-v6-month-list">
        {songs.map((song) => (
          <li key={song.uid} className="home-month-row">
            <SongListItem song={song} href={`/songs/${song.uid}`} surface="offset" />
            {!!trackSongsByUid[song.uid]?.tracks.length && (
              <HomeRecordingPicker song={trackSongsByUid[song.uid]} authors={authors}
                open={openUid === song.uid && !obscured} onOpenChange={(open) => setOpenUid(open ? song.uid : null)} />
            )}
          </li>
        ))}
      </ul> : <p className="text-base/6 text-[var(--secondary)]">No songs are specific to this month.</p>}
    </article>
  )
}
