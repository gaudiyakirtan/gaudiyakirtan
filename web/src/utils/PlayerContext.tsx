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
import { IAudioTrack, ISong } from '../models/Song'
import { IScriptText, Uid } from '../models/Common'
import { audioUrlFor } from '../config'

// Global audio playback (docs/screens/player.md): a single <audio> element lives inside this
// provider, mounted once at the app root (_app.tsx, alongside Theme/SettingsProvider) so
// playback survives client-side navigation between pages - "a global playback service, not
// per-screen state" per the spec.

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

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

  // The media listeners below are attached once, so anything they read would be frozen at the
  // initial render. End-of-track behaviour depends on live state (which take, which toggles), so
  // route it through a ref that every render refreshes.
  const onEndedRef = useRef<() => void>(() => {})

  // Create the single shared <audio> element once, client-side only (SSR has no Audio()).
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio

    const onLoadedMetadata = () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
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

  // Keep loop + volume synced onto the single shared element (persists across src changes).
  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = isLooping
  }, [isLooping])
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

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
      setStatus('paused')
      setCurrentTime(0)
      // Looping is enforced natively (audio.loop), which means `ended` never fires while it's on —
      // but keep repeat explicitly winning so the two toggles can't ever fight.
      if (isLooping || !autoContinue || !song) return
      const i = song.tracks.findIndex((t) => t.uid === trackUid)
      const next = i >= 0 ? song.tracks[i + 1] : undefined
      if (!next) return // last take of the song - stop, same as auto-continue being off
      setTrackUid(next.uid)
      loadAndPlay(next)
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
