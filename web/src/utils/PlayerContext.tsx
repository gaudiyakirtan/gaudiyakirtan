import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react'
import { useRouter } from 'next/router'
import { IAudioTrack, ISong } from '../models/Song'
import { IScriptText, Uid } from '../models/Common'
import { audioUrlFor, artistImageUrlFor } from '../config'
import { pickScriptText } from '../services/textDisplay'
import {
  IPlayerQueue,
  queueNeighbor,
  queuePosition as computeQueuePosition,
  resolveTrackEndAction,
} from '../services/playerQueue'
import {
  computeEndsAt,
  fadeVolumeStep,
  remainingMs,
  SleepTimerMode,
} from '../services/sleepTimer'
import { buildResumeRecord, parseResumeRecord, shouldPersist } from '../services/resume'

// Global audio playback (docs/screens/player.md): a single <audio> element lives inside this
// provider, mounted once at the app root (_app.tsx, alongside Theme/SettingsProvider) so
// playback survives client-side navigation between pages - "a global playback service, not
// per-screen state" per the spec.

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

const RESUME_STORAGE_KEY = 'gk-player-resume'
// "Every few seconds", not every `timeupdate` tick (docs/screens/player.md feature 3) - timeupdate
// fires several times a second, and localStorage writes aren't worth doing that often.
const RESUME_SAVE_INTERVAL_MS = 5_000
// The duration-timer fade (feature 4): ~3s of gradual volume ramp-down feels like a fade rather
// than a cut, driven by a tick every 250ms.
const SLEEP_FADE_TICK_MS = 250
const SLEEP_FADE_STEP = SLEEP_FADE_TICK_MS / 3_000

/**
 * The slice of a Song the player needs to render Now-Playing/mini-player credits. Trimmed from
 * the full ISong so the mini-player doesn't keep a song's whole verses/notes tree in memory while
 * the reader navigates elsewhere.
 */
export interface IPlayableSong {
  uid: Uid
  titleMain: IScriptText[]
  authorDisplay: IScriptText[]
  authorUid: Uid
  /** All recordings for this song (docs/data/song.md `audio_files`). */
  tracks: IAudioTrack[]
}

interface PlayerContextType {
  /** The loaded song, or null when nothing has been played this session. */
  song: IPlayableSong | null
  /** The currently selected take's uid (matches one entry in `song.tracks`). */
  trackUid: string | null
  status: PlaybackStatus
  currentTime: number
  duration: number
  /** Whether the full Now-Playing panel is raised (vs. just the mini-player bar). */
  isExpanded: boolean
  /** The song the current page has "armed" for the corner widget to start when idle (the open
   *  song-detail page, if it has audio). Null on pages with nothing playable. */
  armedSong: ISong | null
  /** A page registers/clears the song the idle corner widget should play. */
  arm: (song: ISong | null) => void
  /** Repeat the current track when it ends. */
  isLooping: boolean
  toggleLoop: () => void
  /** When a take ends, roll on to the next recording of the same song (the other singers'
   *  versions) instead of stopping. On by default — a song's takes read as one listening session. */
  autoContinue: boolean
  toggleAutoContinue: () => void
  /** Output volume, 0..1. */
  volume: number
  setVolume: (v: number) => void
  /** The armed book/topic queue (feature 2, see services/queueContext.ts) a song page registers
   *  via `armQueue`, so finishing a song's takes can roll on to the *next song* in that
   *  collection. Null when the open song isn't in one (or a page never arms one). */
  queue: IPlayerQueue | null
  armQueue: (queue: IPlayerQueue | null) => void
  /** Whether `previous`/`next` would move the *playing* song within the armed queue. */
  hasPreviousInQueue: boolean
  hasNextInQueue: boolean
  /** 1-based "3 of 12" position of the playing song within the armed queue, or null off-queue. */
  queuePosition: { index: number; total: number } | null
  previous: () => void
  next: () => void
  /** A song page calls this on mount with its own uid to ask "was I navigated to as a
   *  queue-advance (or resume) continuation, rather than a plain visit?" - true (once, then
   *  cleared) means the page should start playback itself; false means don't autoplay. */
  consumeAutoplay: (uid: string) => boolean
  /** Sleep timer (feature 4) - null when none is armed. */
  sleepTimer: SleepTimerMode | null
  /** Milliseconds left on a *duration* timer, ticking once a second for the UI countdown. Null
   *  when no duration timer is armed (including while an "end of track" timer is armed instead -
   *  that mode has no countdown, just a pending stop). */
  sleepRemainingMs: number | null
  startSleepTimer: (minutes: number) => void
  startSleepTimerEndOfTrack: () => void
  cancelSleepTimer: () => void
  /** Loads a song's audio and starts playback, raising the player. Defaults to the first take. */
  playSong: (song: ISong, trackUid?: string) => void
  /** As `playSong`, but from the player's trimmed slice — for list screens (/tracks) that never
   *  load the full ISong. Defaults to the first take. */
  playPlayable: (playable: IPlayableSong, trackUid?: string) => void
  /** Switches to a different take of the current song (e.g. a different artist's recording). */
  selectTrack: (trackUid: string) => void
  togglePlayPause: () => void
  seek: (time: number) => void
  expand: () => void
  collapse: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

function toPlayableSong(song: ISong): IPlayableSong {
  return {
    uid: song.uid,
    titleMain: song.titleMain,
    authorDisplay: song.authorDisplay,
    authorUid: song.authorUid,
    tracks: song.audioFiles ?? [],
  }
}

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const router = useRouter()
  const [song, setSong] = useState<IPlayableSong | null>(null)
  const [trackUid, setTrackUid] = useState<string | null>(null)
  const [status, setStatus] = useState<PlaybackStatus>('idle')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [armedSong, setArmedSong] = useState<ISong | null>(null)
  const [isLooping, setIsLooping] = useState(false)
  const [autoContinue, setAutoContinue] = useState(true)
  const [volume, setVolumeState] = useState(1)
  const [queue, setQueue] = useState<IPlayerQueue | null>(null)
  const [sleepTimer, setSleepTimerState] = useState<SleepTimerMode | null>(null)
  const [sleepRemainingMs, setSleepRemainingMs] = useState<number | null>(null)

  // The media listeners below are attached once, so anything they read would be frozen at the
  // initial render. End-of-track behaviour depends on live state (which take, which toggles), so
  // route it through a ref that every render refreshes.
  const onEndedRef = useRef<() => void>(() => {})
  // Set just before router.push'ing to a queue neighbor (next/previous, or an auto-advance at
  // track-end); consumed once by the destination song page to decide "should I start playback
  // myself" without needing a `?play=` deep-link query param for every hop.
  const pendingAutoplayRef = useRef<string | null>(null)
  // A resume snapshot's saved position, consumed once by `onLoadedMetadata` below (setting
  // `currentTime` before metadata has loaded doesn't reliably stick across browsers).
  const resumePositionRef = useRef<number | null>(null)

  // Create the single shared <audio> element once, client-side only (SSR has no Audio()).
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio

    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
      // Resume-where-you-left-off (feature 3): seek to the saved position once, now that the
      // element actually has something loaded to seek within.
      if (resumePositionRef.current != null) {
        const pos = resumePositionRef.current
        resumePositionRef.current = null
        if (Number.isFinite(pos) && pos > 0) {
          audio.currentTime = pos
          setCurrentTime(pos)
        }
      }
    }
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onPlaying = () => setStatus('playing')
    const onPause = () => setStatus((s) => (s === 'error' ? s : 'paused'))
    const onWaiting = () => setStatus('loading')
    const onEnded = () => onEndedRef.current()
    // Native <audio> error - bad URL, 404, network down, unsupported format. This is the
    // "graceful error state" path (docs/screens/player.md): never hang/crash, surface it.
    const onError = () => setStatus('error')

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.pause()
      audio.src = ''
    }
  }, [])

  // Resume-where-you-left-off (feature 3): reconstruct the last session from its OWN persisted
  // snapshot (title/author/tracks were captured at save time - see the persist effect below),
  // rather than re-fetching the song. This is a fully static, backend-less app, so on a fresh load
  // there's nothing to fetch a uid's title/tracks *from* besides the current page's own bundled
  // data - persisting the small slice alongside the position is what lets this restore from ANY
  // page, not only when the reader happens to reopen that exact song's detail page. Restores
  // PAUSED and cued at the saved position; never autoplays (a surprise autoplay would startle the
  // reader, and browsers block it without a gesture anyway).
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    let raw: string | null = null
    try {
      raw = window.localStorage.getItem(RESUME_STORAGE_KEY)
    } catch {
      return // storage unavailable (private mode, disabled) - nothing to restore
    }
    const record = parseResumeRecord(raw, Date.now())
    if (!record) return
    const track = record.song.tracks.find((t) => t.uid === record.trackUid) ?? record.song.tracks[0]
    if (!track) return
    resumePositionRef.current = record.position
    setSong(record.song)
    setTrackUid(track.uid)
    setStatus('paused')
    audio.src = audioUrlFor(track.filename)
  }, [])

  // Keep loop + volume synced onto the single shared element (persists across src changes).
  // Loop is forced OFF while an "end of track" sleep timer is armed - native `audio.loop` never
  // fires the `ended` event, which is exactly the signal that timer mode waits for.
  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = isLooping && sleepTimer?.kind !== 'end-of-track'
  }, [isLooping, sleepTimer])
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  // Throttled position autosave for feature 3, plus an immediate save on pause/backgrounding so a
  // reader who closes the tab right after pausing doesn't lose the last few seconds.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !song) return
    const activeTrackUid = trackUid ?? song.tracks[0]?.uid
    if (!activeTrackUid) return

    let lastSavedAt = 0
    const persist = () => {
      const now = Date.now()
      lastSavedAt = now
      try {
        const record = buildResumeRecord(song, activeTrackUid, audio.currentTime, now)
        window.localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(record))
      } catch {
        // Storage full/unavailable - resume is a convenience, never worth throwing over.
      }
    }
    const onTimeUpdateThrottled = () => {
      if (shouldPersist(lastSavedAt, Date.now(), RESUME_SAVE_INTERVAL_MS)) persist()
    }
    audio.addEventListener('timeupdate', onTimeUpdateThrottled)
    audio.addEventListener('pause', persist)
    document.addEventListener('visibilitychange', persist)
    window.addEventListener('pagehide', persist)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdateThrottled)
      audio.removeEventListener('pause', persist)
      document.removeEventListener('visibilitychange', persist)
      window.removeEventListener('pagehide', persist)
    }
  }, [song, trackUid])

  // Sleep timer (feature 4) - the countdown + fade-out for "duration" mode. "End of track" mode
  // has no ticking countdown; it's handled entirely by resolveTrackEndAction at `ended` below.
  useEffect(() => {
    if (!sleepTimer || sleepTimer.kind !== 'duration') {
      setSleepRemainingMs(null)
      return
    }
    const endsAt = sleepTimer.endsAt
    const tick = () => {
      const audio = audioRef.current
      const remaining = remainingMs(endsAt, Date.now())
      setSleepRemainingMs(remaining)
      if (remaining > 0 || !audio || audio.paused) return
      const nextVolume = fadeVolumeStep(audio.volume, SLEEP_FADE_STEP)
      audio.volume = nextVolume
      if (nextVolume <= 0) {
        audio.pause()
        audio.volume = volume // restore the reader's normal level for the next play
        setSleepTimerState(null)
      }
    }
    tick()
    const id = window.setInterval(tick, SLEEP_FADE_TICK_MS)
    return () => window.clearInterval(id)
  }, [sleepTimer, volume])

  const loadAndPlay = useCallback((track: IAudioTrack) => {
    const audio = audioRef.current
    if (!audio) return
    setStatus('loading')
    setCurrentTime(0)
    setDuration(0)
    audio.src = audioUrlFor(track.filename)
    audio.currentTime = 0
    // .play() rejects on network/format errors OR NotAllowedError (autoplay blocked - e.g. a shared
    // deep link that opens the page without a prior gesture). Autoplay-block is NOT an error: the
    // track is cued and ready, so fall back to 'paused' and let the user tap play. Everything else
    // is a real load failure -> the graceful 'error' state (never throw/hang).
    audio.play().catch((err: unknown) => {
      const name = err instanceof DOMException ? err.name : ''
      setStatus(name === 'NotAllowedError' ? 'paused' : 'error')
    })
  }, [])

  // Re-point the `ended` handler after every render so it always sees the current take/toggles.
  // No dep array: the values it closes over change on nearly every render anyway.
  useEffect(() => {
    onEndedRef.current = () => {
      if (!song) {
        setStatus('paused')
        setCurrentTime(0)
        return
      }
      const currentIndex = song.tracks.findIndex((t) => t.uid === trackUid)
      const nextTakeUid = autoContinue ? song.tracks[currentIndex + 1]?.uid ?? null : null
      const action = resolveTrackEndAction({
        isLooping,
        sleepEndOfTrack: sleepTimer?.kind === 'end-of-track',
        autoContinueNextTrackUid: nextTakeUid,
        queue,
        currentSongUid: song.uid,
      })

      if (action.type === 'repeat') return // native `audio.loop` already restarted it

      if (action.type === 'next-take') {
        const track = song.tracks.find((t) => t.uid === action.trackUid)
        if (track) {
          setTrackUid(track.uid)
          loadAndPlay(track)
        }
        return
      }

      if (action.type === 'advance') {
        // Continuous play through the armed book/topic (feature 2): this static site has no
        // backend to fetch the next song's tracks from, so advancing means navigating to its own
        // page - `consumeAutoplay` there is what actually starts it, keeping this provider
        // decoupled from any one page's data.
        pendingAutoplayRef.current = action.nextSongUid
        setCurrentTime(0)
        router.push(`/songs/${action.nextSongUid}`)
        return
      }

      // 'stop'
      setStatus('paused')
      setCurrentTime(0)
      if (sleepTimer?.kind === 'end-of-track') setSleepTimerState(null) // it has done its job
    }
  })

  /**
   * Starts playback from an already-trimmed [IPlayableSong]. This is the entry point for list
   * screens (e.g. /tracks) that ship only the player's slice of each song rather than the whole
   * ISong tree — 753 recordings' verses would dwarf the page payload for data the player never
   * reads. `playSong` is the ISong-shaped convenience wrapper over this.
   */
  const playPlayable = useCallback(
    (next: IPlayableSong, wantTrackUid?: string) => {
      const tracks = next.tracks ?? []
      if (!tracks.length) return // no audio - callers gate the play affordance on audioAvailable

      const track = (wantTrackUid && tracks.find((t) => t.uid === wantTrackUid)) || tracks[0]
      setSong(next)
      setTrackUid(track.uid)
      setIsExpanded(true)
      loadAndPlay(track)
    },
    [loadAndPlay]
  )

  const playSong = useCallback(
    (nextSong: ISong, wantTrackUid?: string) => playPlayable(toPlayableSong(nextSong), wantTrackUid),
    [playPlayable]
  )

  const selectTrack = useCallback(
    (nextTrackUid: string) => {
      if (!song) return
      const track = song.tracks.find((t) => t.uid === nextTrackUid)
      if (!track) return
      setTrackUid(track.uid)
      loadAndPlay(track)
    },
    [song, loadAndPlay]
  )

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !song) return
    if (status === 'error') {
      // Retry the current take from scratch.
      const track = song.tracks.find((t) => t.uid === trackUid) ?? song.tracks[0]
      if (track) loadAndPlay(track)
      return
    }
    if (audio.paused) {
      audio.play().catch(() => setStatus('error'))
    } else {
      audio.pause()
    }
  }, [song, status, trackUid, loadAndPlay])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(time)) return
    audio.currentTime = time
    setCurrentTime(time)
  }, [])

  const expand = useCallback(() => setIsExpanded(true), [])
  const collapse = useCallback(() => setIsExpanded(false), [])
  const arm = useCallback((s: ISong | null) => setArmedSong(s), [])
  const toggleLoop = useCallback(() => setIsLooping((v) => !v), [])
  const toggleAutoContinue = useCallback(() => setAutoContinue((v) => !v), [])
  const setVolume = useCallback((v: number) => setVolumeState(Math.min(1, Math.max(0, v))), [])

  const armQueue = useCallback((next: IPlayerQueue | null) => setQueue(next), [])

  const queuePositionValue = useMemo(
    () => (song ? computeQueuePosition(queue, song.uid) : null),
    [queue, song]
  )
  const hasNextInQueue = useMemo(
    () => !!song && queueNeighbor(queue, song.uid, 1) !== null,
    [queue, song]
  )
  const hasPreviousInQueue = useMemo(
    () => !!song && queueNeighbor(queue, song.uid, -1) !== null,
    [queue, song]
  )

  const goToQueueNeighbor = useCallback(
    (direction: 1 | -1) => {
      if (!song) return
      const neighborUid = queueNeighbor(queue, song.uid, direction)
      if (!neighborUid) return
      pendingAutoplayRef.current = neighborUid
      router.push(`/songs/${neighborUid}`)
    },
    [song, queue, router]
  )
  const next = useCallback(() => goToQueueNeighbor(1), [goToQueueNeighbor])
  const previous = useCallback(() => goToQueueNeighbor(-1), [goToQueueNeighbor])

  const consumeAutoplay = useCallback((uid: string) => {
    if (pendingAutoplayRef.current !== uid) return false
    pendingAutoplayRef.current = null
    return true
  }, [])

  const startSleepTimer = useCallback((minutes: number) => {
    setSleepTimerState({ kind: 'duration', endsAt: computeEndsAt(minutes, Date.now()) })
  }, [])
  const startSleepTimerEndOfTrack = useCallback(() => {
    setSleepTimerState({ kind: 'end-of-track' })
  }, [])
  const cancelSleepTimer = useCallback(() => {
    setSleepTimerState(null)
    setSleepRemainingMs(null)
    if (audioRef.current) audioRef.current.volume = volume // undo an in-progress fade, if any
  }, [volume])

  // Media Session API (feature 1) - feature-detected throughout, so this is a safe no-op on
  // browsers without it (Firefox desktop, older Safari). Metadata: title/artist mirror the
  // mini-player's own fixed fallback order (Latn -> Beng) rather than the reader's `listLanguage`
  // setting, since this renders in OS chrome (lock screen, notification) the reader doesn't
  // otherwise control from here - keeps PlayerContext decoupled from SettingsContext.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaSession) return
    if (!song) {
      navigator.mediaSession.metadata = null
      return
    }
    const track = song.tracks.find((t) => t.uid === trackUid) ?? song.tracks[0]
    const title = pickScriptText(song.titleMain, ['Latn', 'Beng'])
    const artist =
      track?.artist || pickScriptText(song.authorDisplay, ['Latn', 'Beng']) || song.authorUid
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: 'Gaudiya Kirtan',
      artwork: track ? [{ src: artistImageUrlFor(track.uid), sizes: '512x512', type: 'image/jpeg' }] : [],
    })
  }, [song, trackUid])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaSession) return
    navigator.mediaSession.playbackState =
      status === 'playing' ? 'playing' : status === 'paused' || status === 'error' ? 'paused' : 'none'
  }, [status])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaSession) return
    const mediaSession = navigator.mediaSession
    const audio = audioRef.current
    const handlers: [MediaSessionAction, MediaSessionActionHandler | null][] = [
      ['play', () => audio?.play().catch(() => setStatus('error'))],
      ['pause', () => audio?.pause()],
      ['previoustrack', hasPreviousInQueue ? () => previous() : null],
      ['nexttrack', hasNextInQueue ? () => next() : null],
      [
        'seekbackward',
        (details) => {
          if (!audio) return
          audio.currentTime = Math.max(0, audio.currentTime - (details.seekOffset ?? 10))
        },
      ],
      [
        'seekforward',
        (details) => {
          if (!audio) return
          const max = Number.isFinite(audio.duration) ? audio.duration : Infinity
          audio.currentTime = Math.min(max, audio.currentTime + (details.seekOffset ?? 10))
        },
      ],
      [
        'seekto',
        (details) => {
          if (!audio || details.seekTime == null) return
          audio.currentTime = details.seekTime
        },
      ],
    ]
    for (const [action, handler] of handlers) {
      try {
        mediaSession.setActionHandler(action, handler)
      } catch {
        // Action unsupported in this browser (e.g. `seekto` on older Chrome) - feature-detected
        // no-op, exactly as the brief asks.
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          mediaSession.setActionHandler(action, null)
        } catch {
          // ignore
        }
      }
    }
  }, [hasNextInQueue, hasPreviousInQueue, next, previous])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaSession?.setPositionState) return
    if (!Number.isFinite(duration) || duration <= 0) return
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: 1,
        position: Math.min(Math.max(currentTime, 0), duration),
      })
    } catch {
      // Some browsers throw on a transient/invalid combo (e.g. mid-seek) - degrade silently.
    }
  }, [duration, currentTime])

  const value = useMemo<PlayerContextType>(
    () => ({
      song,
      trackUid,
      status,
      currentTime,
      duration,
      isExpanded,
      armedSong,
      arm,
      isLooping,
      toggleLoop,
      autoContinue,
      toggleAutoContinue,
      volume,
      setVolume,
      queue,
      armQueue,
      hasPreviousInQueue,
      hasNextInQueue,
      queuePosition: queuePositionValue,
      previous,
      next,
      consumeAutoplay,
      sleepTimer,
      sleepRemainingMs,
      startSleepTimer,
      startSleepTimerEndOfTrack,
      cancelSleepTimer,
      playSong,
      playPlayable,
      selectTrack,
      togglePlayPause,
      seek,
      expand,
      collapse,
    }),
    [
      song,
      trackUid,
      status,
      currentTime,
      duration,
      isExpanded,
      armedSong,
      arm,
      isLooping,
      toggleLoop,
      autoContinue,
      toggleAutoContinue,
      volume,
      setVolume,
      queue,
      armQueue,
      hasPreviousInQueue,
      hasNextInQueue,
      queuePositionValue,
      previous,
      next,
      consumeAutoplay,
      sleepTimer,
      sleepRemainingMs,
      startSleepTimer,
      startSleepTimerEndOfTrack,
      cancelSleepTimer,
      playSong,
      playPlayable,
      selectTrack,
      togglePlayPause,
      seek,
      expand,
      collapse,
    ]
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}
