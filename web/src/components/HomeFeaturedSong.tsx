import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AuthorNames, ITrackSong, pickTrackAuthor, pickTrackTitle, toPlayable } from '../services/trackListingView'
import { usePlayer } from '../utils/PlayerContext'
import { useSettings } from '../utils/SettingsContext'
import { ArrowRightIcon, PauseIcon, PendingIcon, PlayIcon, RetryIcon } from './icons/SidebarIcons'

interface IHomeFeaturedSongProps {
  song?: ITrackSong
  authors: AuthorNames
}

/** The shared vector master is static, offline, decorative, and independent of player state. */
function RhythmField() {
  return <div className="home-rhythm-field" aria-hidden="true">
    <svg viewBox="0 0 360 240" fill="none" focusable="false">
      <path d="M24 76 C116 12 240 16 338 90" stroke="var(--accent)" strokeOpacity=".18" strokeWidth="28" strokeLinecap="round" />
      <path d="M12 112 C124 48 252 64 356 140" stroke="var(--primary)" strokeOpacity=".08" strokeWidth="18" strokeLinecap="round" />
      {[48, 76, 112, 168, 196, 252].map((x) => <rect key={x} x={x} y="180" width="8" height="24" rx="4" fill="var(--accent)" fillOpacity=".55" />)}
    </svg>
  </div>
}

export function HomeFeaturedSong({ song, authors }: IHomeFeaturedSongProps) {
  const { settings } = useSettings()
  const { song: playingSong, trackUid, status, playPlayable, togglePlayPause } = usePlayer()
  // The recommendation never changes just because another song was loaded elsewhere.
  const current = Boolean(song && playingSong?.uid === song.uid)
  const state = current ? status : 'idle'
  const [pending, setPending] = useState(false)
  useEffect(() => {
    setPending(false)
    if (state !== 'loading') return
    const timer = setTimeout(() => setPending(true), 150)
    return () => clearTimeout(timer)
  }, [state, song?.uid, trackUid])

  if (!song) return <article className="home-feature" aria-labelledby="home-feature-heading">
    <RhythmField />
    <p className="home-eyebrow">The singing page</p>
    <h2 id="home-feature-heading" className="home-feature-title">Find your next song</h2>
    <Link href="/songs" className="home-read-action utility-target">Browse songs <ArrowRightIcon className="home-arrow" aria-hidden="true" /></Link>
  </article>

  const title = pickTrackTitle(song, settings.listLanguage)
  const author = pickTrackAuthor(song, authors, settings.listLanguage)
  const track = (current ? playingSong?.tracks.find((take) => take.uid === trackUid) : undefined) ?? song.tracks[0]
  const action = state === 'loading' ? 'Loading recording' : state === 'error' ? 'Retry recording'
    : state === 'playing' ? 'Pause' : state === 'paused' ? 'Resume' : 'Play recording'
  const glyph = state === 'loading' && !pending ? 'idle' : state

  return <article className="home-feature" aria-labelledby="home-feature-heading" data-playing={state === 'playing'}>
    <RhythmField />
    <div className="home-feature-topline">
      <p className="home-eyebrow">A song for today</p>
      <span className="song-row-uid">{song.uid}</span>
    </div>
    <h2 id="home-feature-heading" className="home-feature-title font-display">{title}</h2>
    {author && <p className="home-feature-author">{author}</p>}
    <div className="home-feature-actions">
      <Link href={`/songs/${song.uid}`} className="home-read-action utility-target" aria-label={`Read & sing ${title}`}>
        <span>Read &amp; sing</span><ArrowRightIcon className="home-arrow" aria-hidden="true" />
      </Link>
      <button type="button" className="home-play-action utility-target" aria-label={`${action} — ${title}`}
        aria-disabled={state === 'loading'} onClick={() => {
          if (state === 'loading') return
          if (current && state !== 'error') togglePlayPause()
          else playPlayable(toPlayable(song, authors), track?.uid)
        }}>
        <span className="home-play-icon" data-state={glyph} aria-hidden="true">
          <PlayIcon data-glyph="play" /><PauseIcon data-glyph="pause" />
          <RetryIcon data-glyph="error" /><PendingIcon data-glyph="loading" />
        </span>
        <span>{action}</span>
        <span className="home-playing-mark" aria-hidden="true" />
      </button>
    </div>
    {track?.artist && <p className="home-feature-performer">Recording by <span>{track.artist}</span></p>}
  </article>
}
