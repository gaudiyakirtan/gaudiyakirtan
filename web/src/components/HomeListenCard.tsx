import Link from 'next/link'
import { Ellipsis, Pause, Play, RotateCcw } from 'lucide-react'
import { AuthorNames, ITrackSong, pickTrackAuthor, pickTrackTitle, toPlayable } from '../services/trackListingView'
import { pickScriptText } from '../services/textDisplay'
import { usePlayer } from '../utils/PlayerContext'
import { useSettings } from '../utils/SettingsContext'
import { ArtistAvatar } from './ArtistAvatar'

interface IHomeListenCardProps {
  song?: ITrackSong
  authors: AuthorNames
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00'
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

export function HomeListenCard({ song, authors }: IHomeListenCardProps) {
  const { settings } = useSettings()
  const {
    song: playingSong,
    trackUid,
    status,
    currentTime,
    duration,
    playPlayable,
    togglePlayPause,
  } = usePlayer()

  const fallback = song ? toPlayable(song, authors) : null
  const displayedSong = playingSong ?? fallback

  if (!displayedSong) {
    return (
      <article className="home-v6-card home-v6-listen-card home-v6-listen-empty">
        <div>
          <h2>Choose a recording</h2>
          <p>Browse performances from across the song library.</p>
        </div>
        <Link href="/tracks" className="home-v6-listen-empty-action">
          Open recordings <span aria-hidden="true">→</span>
        </Link>
      </article>
    )
  }

  const current = Boolean(playingSong)
  const title = current
    ? pickScriptText(displayedSong.titleMain, [settings.listLanguage, 'Latn', 'Beng'])
    : pickTrackTitle(song!, settings.listLanguage)
  const playing = current && status === 'playing'
  const track = current
    ? displayedSong.tracks.find((candidate) => candidate.uid === trackUid) ?? displayedSong.tracks[0]
    : displayedSong.tracks[0]
  const author = track?.artist || (current
    ? pickScriptText(displayedSong.authorDisplay, [settings.listLanguage, 'Latn', 'Beng'])
    : pickTrackAuthor(song!, authors, settings.listLanguage))
  const progress = current && duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  const toggle = () => {
    if (current && status === 'error') playPlayable(displayedSong, track.uid)
    else if (current) togglePlayPause()
    else playPlayable(displayedSong, displayedSong.tracks[0]?.uid)
  }
  const action = status === 'loading' ? 'Loading' : status === 'error' ? 'Retry' : playing ? 'Pause' : 'Play'

  return (
    <article className="home-v6-card home-v6-listen-card">
      <div className="home-v6-listen-main">
        <ArtistAvatar trackUid={track.uid} size={72} ring={false} />
        <div className="home-v6-listen-copy">
          <Link href={`/songs/${displayedSong.uid}`} className="home-v6-title-link">
            {title}
          </Link>
          <p>{author}</p>
        </div>
      </div>

      <div className="home-v6-listen-controls">
        <Link href={`/songs/${displayedSong.uid}`} className="home-v6-round-action" aria-label={`Open ${title}`}>
          <span aria-hidden="true">↗</span>
        </Link>
        <button
          type="button"
          className="home-v6-play"
          onClick={toggle}
          disabled={status === 'loading'}
          aria-label={`${action} ${title}`}
        >
          <span className="home-v6-play-icon" data-state={status} aria-hidden="true">
            <Play className="home-v6-play-glyph" data-glyph="play" />
            <Pause className="home-v6-play-glyph" data-glyph="pause" />
            <RotateCcw className="home-v6-play-glyph" data-glyph="error" />
            <Ellipsis className="home-v6-play-glyph" data-glyph="loading" />
          </span>
        </button>
        <span className="home-v6-take-count" aria-label={`${displayedSong.tracks.length} recordings`}>
          {displayedSong.tracks.length} {displayedSong.tracks.length === 1 ? 'take' : 'takes'}
        </span>
      </div>

      <div className="home-v6-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="home-v6-time" aria-hidden="true">
        <span>{formatTime(currentTime)}</span>
        <span>{duration > 0 ? `-${formatTime(Math.max(0, duration - currentTime))}` : 'ready'}</span>
      </div>
    </article>
  )
}
