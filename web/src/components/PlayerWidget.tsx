import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, Loader2, Repeat, ListEnd, Download, Share2, Minimize2, Maximize2, Check,
  SkipBack, SkipForward, Moon, X,
} from 'lucide-react'
import { usePlayer } from '../utils/PlayerContext'
import { useSettings } from '../utils/SettingsContext'
import { pickScriptText } from '../services/textDisplay'
import { SLEEP_TIMER_MINUTE_OPTIONS, formatRemaining } from '../services/sleepTimer'
import { artistImageUrlFor, audioUrlFor } from '../config'
import { MusicNote } from './icons/MusicNote'
import { ArtistAvatar, RecordingPickerButton } from './ArtistAvatar'

/**
 * The single, unified player (docs/screens/player.md) — one sticky control in the bottom-right that
 * **morphs** (framer-motion) between a circle and a rounded card, with a spring pop + cross-fade:
 *  • idle (a song page armed its song) → a circular play FAB. Hidden on non-song pages with nothing
 *    playing.
 *  • expanded → a mini-player card: artwork, title (2 lines → marquee), author, scrubber, a
 *    previous/next transport pair when a book/topic queue is armed, and a loop / continue-playing /
 *    sleep-timer / download / share row plus a stacked-avatar **recordings** picker and a
 *    **minimize** button.
 *  • collapsed (while playing) → back to a circle (play/pause + a corner expand button).
 */

const spring = { type: 'spring', stiffness: 560, damping: 32, mass: 0.9 } as const
const fade = { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, transition: { duration: 0.16 } }

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const t = Math.floor(s)
  return `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`
}

const Artwork: React.FC<{ trackUid?: string; playing: boolean }> = ({ trackUid, playing }) => {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [trackUid])
  return (
    <span className="relative flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-xl bg-[var(--highlight)]/15">
      {trackUid && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- external S3 image, best-effort
        <img src={artistImageUrlFor(trackUid)} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <MusicNote size={22} className="text-[var(--highlight)]" />
      )}
      {playing && <span className="absolute inset-0 rounded-xl ring-2 ring-[var(--highlight)] animate-pulse" />}
    </span>
  )
}

const MarqueeTitle: React.FC<{ text: string }> = ({ text }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState(false)
  useLayoutEffect(() => setOverflow(false), [text])
  useLayoutEffect(() => {
    const el = ref.current
    if (el && !overflow) setOverflow(el.scrollHeight > el.clientHeight + 1)
  }, [text, overflow])
  if (overflow) {
    return (
      <div className="overflow-hidden">
        <div className="marquee-track text-sm font-semibold text-[var(--primary)]">
          <span>{text}</span>
          <span aria-hidden="true">{text}</span>
        </div>
      </div>
    )
  }
  return <div ref={ref} className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--primary)]">{text}</div>
}

// The two drop-ups (recordings, sleep timer) share one slot above the card and are
// mutually exclusive, so a single "which one is open" state stands in for three booleans.
type OpenMenu = 'recordings' | 'sleep' | null

export const PlayerWidget: React.FC = () => {
  const {
    song, trackUid, status, armedSong, currentTime, duration,
    isLooping, toggleLoop, autoContinue, toggleAutoContinue,
    hasNextInQueue, canPrevious, canNext, previous, next,
    sleepTimer, sleepRemainingMs, startSleepTimer, startSleepTimerEndOfTrack, cancelSleepTimer,
    playSong, selectTrack, togglePlayPause, seek,
  } = usePlayer()
  const { settings } = useSettings()
  const [copied, setCopied] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (song) setCollapsed(false)
  }, [song?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!openMenu) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [openMenu])

  // Hooks BEFORE any early return (React #310).
  const takeLabels = useMemo(() => {
    const labels = new Map<string, string>()
    if (!song) return labels
    const counts = new Map<string, number>()
    for (const t of song.tracks) counts.set(t.artist ?? t.uid, (counts.get(t.artist ?? t.uid) ?? 0) + 1)
    const seen = new Map<string, number>()
    for (const t of song.tracks) {
      const base = t.artist ?? t.uid
      if ((counts.get(base) ?? 0) > 1) {
        const n = (seen.get(base) ?? 0) + 1
        seen.set(base, n)
        labels.set(t.uid, `${base} (take ${n})`)
      } else labels.set(t.uid, base)
    }
    return labels
  }, [song])

  const loaded = !!song
  if (!loaded && !armedSong) return null

  const track = song?.tracks.find((t) => t.uid === trackUid) ?? song?.tracks[0]
  const hasMultipleTakes = (song?.tracks.length ?? 0) > 1
  const title = song ? pickScriptText(song.titleMain, [settings.listLanguage, 'Latn', 'Beng']) : ''
  const author = song
    ? pickScriptText(song.authorDisplay, [settings.listLanguage, 'Latn', 'Beng']) || song.authorUid
    : ''
  // The singer/reciter of the selected recording (falls back to the composer if a take is untagged).
  const singer = track?.artist || author
  const playing = status === 'playing'
  const showCircle = !loaded || collapsed
  // The transport pair earns its space only when at least one direction can actually move.
  const showTransport = canPrevious || canNext

  const playArmed = () => armedSong && playSong(armedSong)

  // Collision: a song is playing, but the reader has navigated to a DIFFERENT song's page (which
  // armed itself). The mini-player still holds the playing song, so there's no way to start the one
  // being read — surface a "Play this" strip tucked behind the card's top edge that switches to it.
  // Gated on the expanded card (`!showCircle`): collapsing is a deliberate "get out of my way", so
  // the circle stays a bare circle — on a phone the strip would otherwise be pure obstruction.
  const showPlayArmedChip = !!armedSong && !!song && armedSong.uid !== song.uid && !showCircle
  const armedTitle = armedSong
    ? pickScriptText(armedSong.titleMain, [settings.listLanguage, 'Latn', 'Beng'])
    : ''

  const handleShare = async () => {
    if (!song || !track) return
    const url = `${window.location.origin}/songs/${song.uid}?play=${encodeURIComponent(track.uid)}`
    try {
      if (navigator.share) await navigator.share({ title, url })
      else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      }
    } catch {
      /* dismissed */
    }
  }

  const handleDownload = async () => {
    if (!track) return
    const url = audioUrlFor(track.filename)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      const obj = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = obj
      a.download = track.filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(obj)
    } catch {
      window.open(url, '_blank', 'noopener')
    }
  }

  const mainIcon = status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : playing ? <Pause size={18} /> : <Play size={18} />
  const pct = duration ? (Math.min(currentTime, duration) / duration) * 100 : 0
  const ctrlBtn = 'flex h-8 w-8 items-center justify-center rounded-full text-[var(--neutral)] transition-colors hover:bg-[var(--background)] hover:text-[var(--primary)]'
  // Shared "toggle is on" treatment, so loop and continue-playing read as the same kind of switch.
  const ctrlBtnOn = 'flex h-8 w-8 items-center justify-center rounded-full bg-[var(--highlight)]/15 text-[var(--highlight)]'
  const pillBtn = 'flex h-8 items-center gap-1 rounded-full px-2 text-[11px] font-semibold transition-colors'

  // Sleep-timer button label: the remaining mm:ss for a duration timer, "End" for the
  // end-of-track mode (no countdown to show), or nothing when idle.
  const sleepLabel =
    sleepTimer?.kind === 'duration' && sleepRemainingMs != null
      ? formatRemaining(sleepRemainingMs)
      : sleepTimer?.kind === 'end-of-track'
        ? 'End'
        : null

  return (
    <div ref={rootRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* recordings drop-up */}
      <AnimatePresence>
        {openMenu === 'recordings' && song && hasMultipleTakes && !showCircle && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="w-60 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background-offset)] shadow-xl"
          >
            <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--neutral)]">Recordings</p>
            <ul className="max-h-64 overflow-y-auto pb-2">
              {song.tracks.map((t) => {
                const active = t.uid === track?.uid
                return (
                  <li key={t.uid}>
                    <button
                      type="button"
                      onClick={() => { selectTrack(t.uid); setOpenMenu(null) }}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${active ? 'bg-[var(--highlight)]/15 text-[var(--highlight)]' : 'text-[var(--primary)] hover:bg-[var(--background)]'}`}
                    >
                      <ArtistAvatar trackUid={t.uid} size={28} ring={false} />
                      <span className="flex-1 truncate">{takeLabels.get(t.uid)}</span>
                      {active && <Check size={14} />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* sleep-timer drop-up (feature 4) */}
      <AnimatePresence>
        {openMenu === 'sleep' && !showCircle && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="w-52 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background-offset)] shadow-xl"
          >
            <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--neutral)]">Sleep timer</p>
            <ul className="pb-2">
              {/* Presets aren't tracked as "which one is active" - only the resulting deadline is
                  stored, and re-picking the same minute value is a legitimate way to restart the
                  countdown - so unlike Speed/Recordings, no option here shows a checkmark. */}
              {SLEEP_TIMER_MINUTE_OPTIONS.map((minutes) => (
                <li key={minutes}>
                  <button
                    type="button"
                    onClick={() => { startSleepTimer(minutes); setOpenMenu(null) }}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-[var(--primary)] transition-colors hover:bg-[var(--background)]"
                  >
                    <span>{minutes} min</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => { startSleepTimerEndOfTrack(); setOpenMenu(null) }}
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors ${sleepTimer?.kind === 'end-of-track' ? 'bg-[var(--highlight)]/15 text-[var(--highlight)]' : 'text-[var(--primary)] hover:bg-[var(--background)]'}`}
                >
                  <span>End of track</span>
                </button>
              </li>
              {sleepTimer && (
                <li className="mt-1 border-t border-[var(--border)] pt-1">
                  <button
                    type="button"
                    onClick={() => { cancelSleepTimer(); setOpenMenu(null) }}
                    className="flex w-full items-center gap-1.5 px-4 py-2 text-left text-sm text-[var(--neutral)] hover:bg-[var(--background)]"
                  >
                    <X size={14} /> Cancel timer
                  </button>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stacked unit: the "play what I'm reading" strip sits BEHIND the card, inset on both sides
          and peeking above its top edge, so it reads as part of the player instead of a second
          floating control. The card's own border + shadow draws the seam. */}
      <div className="flex flex-col items-stretch">
        <AnimatePresence>
          {showPlayArmedChip && (
            <motion.button
              key="play-armed"
              type="button"
              onClick={() => armedSong && playSong(armedSong)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
              title={`Play “${armedTitle}”`}
              /* pb-6/-mb-4: the strip is 16px taller than it looks and the card is pulled up over
                 that slack, hiding its bottom edge + rounding behind the card. */
              className="relative z-0 mx-3 flex items-center gap-1.5 -mb-4 rounded-t-2xl border border-b-0 border-[var(--border)] bg-[var(--background-offset)] px-3.5 pb-6 pt-2 text-left text-xs text-[var(--neutral)] shadow-lg transition-colors hover:text-[var(--primary)]"
            >
              <Play size={13} className="flex-none text-[var(--highlight)]" />
              <span className="truncate">
                Play “<span className="font-medium text-[var(--primary)]">{armedTitle}</span>”
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        <motion.div
        layout
        transition={spring}
        style={{ borderRadius: showCircle ? 28 : 24 }}
        className={`relative z-10 overflow-hidden border border-[var(--border)] bg-[var(--background-offset)] shadow-2xl ${
          showCircle ? '' : 'w-[21rem] max-w-[calc(100vw-3rem)] p-3'
        }`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {showCircle ? (
            <motion.div key="circle" layout {...fade} className="relative h-14 w-14">
              <button
                type="button"
                onClick={loaded ? togglePlayPause : playArmed}
                aria-label={loaded ? (playing ? 'Pause' : 'Play') : 'Play'}
                title={loaded ? (playing ? 'Pause' : 'Play') : 'Play'}
                className="flex h-full w-full items-center justify-center rounded-full bg-[var(--highlight)] text-[var(--on-highlight)]"
              >
                {mainIcon}
                {playing && <span className="absolute inset-0 rounded-full ring-2 ring-[var(--highlight)]/60 animate-pulse" />}
              </button>
              {loaded && (
                <button
                  type="button"
                  onClick={() => setCollapsed(false)}
                  aria-label="Expand player"
                  title="Expand player"
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background-offset)] text-[var(--neutral)] shadow hover:text-[var(--primary)]"
                >
                  <Maximize2 size={12} />
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div key="card" layout {...fade}>
              <div className="flex items-center gap-3">
                <Artwork trackUid={track?.uid} playing={playing} />
                <div className="min-w-0 flex-1">
                  {status === 'error' ? (
                    <p className="text-sm font-semibold text-[var(--primary)]">Audio unavailable</p>
                  ) : (
                    <MarqueeTitle text={title} />
                  )}
                  {/* The reciter (singer) of the current recording — not the song's composer/author. */}
                  <p className="mt-0.5 truncate text-xs text-[var(--neutral)]">{singer}</p>
                </div>
                {/* Previous/next through the armed book/topic queue (or endless play's shuffle).
                    Rendered off `canPrevious || canNext` — the *playing* song being in the queue —
                    not off `queue`, which is armed by whatever page is open and left a pair of
                    permanently-dead arrows whenever those two disagreed. */}
                {showTransport && (
                  <button type="button" onClick={previous} disabled={!canPrevious} aria-label="Previous song"
                    title={canPrevious ? 'Previous song' : 'No previous song'}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-[var(--neutral)] transition-colors hover:bg-[var(--background)] hover:text-[var(--primary)] disabled:opacity-30 disabled:hover:bg-transparent">
                    <SkipBack size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={togglePlayPause}
                  aria-label={playing ? 'Pause' : 'Play'}
                  title={playing ? 'Pause' : 'Play'}
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[var(--highlight)] text-[var(--on-highlight)] shadow-md transition-colors hover:brightness-95"
                >
                  {mainIcon}
                </button>
                {showTransport && (
                  <button type="button" onClick={next} disabled={!canNext} aria-label="Next song"
                    title={autoContinue && !hasNextInQueue ? 'Skip to another song' : 'Next song'}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-[var(--neutral)] transition-colors hover:bg-[var(--background)] hover:text-[var(--primary)] disabled:opacity-30 disabled:hover:bg-transparent">
                    <SkipForward size={16} />
                  </button>
                )}
              </div>

              {status !== 'error' && (
                <>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="w-9 flex-none text-right text-[10px] tabular-nums text-[var(--neutral)]">{fmt(currentTime)}</span>
                    <div className="relative flex-1">
                      <div className="h-1 rounded-full bg-[var(--neutral)]/25">
                        <div className="h-1 rounded-full bg-[var(--highlight)]" style={{ width: `${pct}%` }} />
                      </div>
                      <input
                        type="range" min={0} max={duration || 0} step={0.1}
                        value={Math.min(currentTime, duration || 0)}
                        onChange={(e) => seek(Number(e.target.value))}
                        disabled={!duration} aria-label="Seek"
                        className="absolute inset-x-0 -top-2 h-5 w-full cursor-pointer opacity-0"
                      />
                    </div>
                    <span className="w-9 flex-none text-[10px] tabular-nums text-[var(--neutral)]">{fmt(duration)}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    <button type="button" onClick={toggleLoop} aria-label="Loop" aria-pressed={isLooping}
                      title={isLooping ? 'Repeat one: on' : 'Repeat one: off'}
                      className={isLooping ? ctrlBtnOn : ctrlBtn}>
                      <Repeat size={16} />
                    </button>
                    {/* Endless play. On, playback never stops on its own: this song's other takes
                        first, then its book/topic in order, then any other song with audio. Always
                        enabled — it is no longer about multi-take songs alone, so a single-take
                        song can still start an endless session. */}
                    <button type="button" onClick={toggleAutoContinue}
                      aria-label="Keep playing" aria-pressed={autoContinue}
                      title={autoContinue
                        ? 'Keep playing: on — other recordings, then this book/topic, then more songs'
                        : 'Keep playing: off — stops at the end'}
                      className={autoContinue ? ctrlBtnOn : ctrlBtn}>
                      <ListEnd size={16} />
                    </button>
                    <button type="button" onClick={() => setOpenMenu(openMenu === 'sleep' ? null : 'sleep')}
                      aria-label="Sleep timer" title="Sleep timer"
                      className={`${pillBtn} ${sleepTimer || openMenu === 'sleep' ? 'bg-[var(--highlight)]/15 text-[var(--highlight)]' : 'text-[var(--neutral)] hover:bg-[var(--background)] hover:text-[var(--primary)]'}`}>
                      <Moon size={14} />
                      {sleepLabel && <span className="tabular-nums">{sleepLabel}</span>}
                    </button>
                    <button type="button" onClick={handleDownload} aria-label="Download MP3" title="Download MP3" className={ctrlBtn}>
                      <Download size={16} />
                    </button>
                    <button type="button" onClick={handleShare} aria-label="Share" title="Copy a link to this recording" className={ctrlBtn}>
                      <Share2 size={16} />
                    </button>
                    {copied && <span className="ml-1 text-[11px] font-medium text-[var(--highlight)]">Copied</span>}

                    <div className="ml-auto flex items-center gap-1">
                      {hasMultipleTakes && (
                        <RecordingPickerButton
                          tracks={song!.tracks}
                          open={openMenu === 'recordings'}
                          onClick={() => setOpenMenu(openMenu === 'recordings' ? null : 'recordings')}
                        />
                      )}
                      <button type="button" onClick={() => { setCollapsed(true); setOpenMenu(null) }} aria-label="Collapse player" title="Collapse player" className={ctrlBtn}>
                        <Minimize2 size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default PlayerWidget
