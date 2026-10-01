import { ComponentProps, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'framer-motion'
import { AuthorNames, ITrackSong, pickTrackAuthor, pickTrackTitle, toPlayable } from '../services/trackListingView'
import { IAudioTrack } from '../models/Song'
import { useSettings } from '../utils/SettingsContext'
import { usePlayer } from '../utils/PlayerContext'
import { homeVisibleBounds } from '../utils/useHomeLayout'
import { utilityMotion } from '../utils/utilityMotion'
import { LAYER } from '../utils/layers'
import { ArtistAvatar, RecordingPickerButton } from './ArtistAvatar'
import { LoadingIcon, PauseIcon, PlayIcon } from './icons/SidebarIcons'

function takeLabelsFor(tracks: IAudioTrack[], fallback: string) {
  const counts = new Map<string, number>()
  const seen = new Map<string, number>()
  for (const track of tracks) {
    const base = track.artist ?? fallback
    counts.set(base, (counts.get(base) ?? 0) + 1)
  }
  return tracks.map((track) => {
    const base = track.artist ?? fallback
    const number = (seen.get(base) ?? 0) + 1
    seen.set(base, number)
    return (counts.get(base) ?? 0) > 1 ? `${base} (take ${number})` : base
  })
}

interface IHomeRecordingPickerProps {
  song: ITrackSong
  authors: AuthorNames
  open: boolean
  onOpenChange: (open: boolean) => void
}

function PickerPanel(props: ComponentProps<typeof motion.div>) {
  const present = useIsPresent()
  return <motion.div {...props} inert={!present} aria-hidden={!present || undefined} />
}

export function HomeRecordingPicker({ song, authors, open, onOpenChange }: IHomeRecordingPickerProps) {
  const id = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const { settings } = useSettings()
  const { song: playingSong, trackUid, status, playPlayable, togglePlayPause } = usePlayer()
  const reducedMotion = useReducedMotion()
  const title = pickTrackTitle(song, settings.listLanguage)
  const labels = takeLabelsFor(song.tracks, pickTrackAuthor(song, authors, settings.listLanguage))
  const currentSong = playingSong?.uid === song.uid
  const [loadingUid, setLoadingUid] = useState<string | null>(null)
  // Commands are never delayed; only the visual loading glyph waits out short loads.
  useEffect(() => {
    setLoadingUid(null)
    if (!open || !currentSong || status !== 'loading') return
    const timer = setTimeout(() => setLoadingUid(trackUid), 250)
    return () => clearTimeout(timer)
  }, [open, currentSong, trackUid, status])

  const close = useCallback((restore: boolean) => {
    onOpenChange(false)
    if (restore) trigger.current?.focus({ preventScroll: true })
  }, [onOpenChange])
  // Keep listeners stable while the player emits position/status updates.
  const closeRef = useRef(close)
  closeRef.current = close

  useLayoutEffect(() => {
    if (!open || !panel.current || !trigger.current) return
    const node = panel.current
    const button = trigger.current
    const row = button.closest('li')!
    const frame = button.closest('.home-v6-frame')!
    const list = node.querySelector('ul')!
    let positioning = false
    // Reveal only on open; later scroll/resize repositions must never fight the reader's scrolling.
    const position = (reveal: boolean) => {
      if (positioning) return
      positioning = true
      const frameBox = frame.getBoundingClientRect()
      const width = Math.min(320, frameBox.width - 8)
      node.style.width = `${width}px`
      let anchor = button.getBoundingClientRect()
      const left = Math.max(frameBox.left + 4, Math.min(anchor.right - width, frameBox.right - width - 4))
      const bounds = homeVisibleBounds(left, left + width)
      const headerHeight = node.querySelector('p')!.getBoundingClientRect().height + 32
      const targetHeight = list.querySelector('button')?.getBoundingClientRect().height ?? 44
      const minimum = headerHeight + targetHeight + 4
      // Expose one full take even when a loaded player or short viewport obstructs the anchor.
      if (reveal && (Math.max(bounds.bottom - anchor.bottom, anchor.top - bounds.top) < minimum || anchor.bottom > bounds.bottom || anchor.top < bounds.top)) {
        const desiredTop = bounds.top + minimum + 4
        window.scrollBy({ top: anchor.top - desiredTop, behavior: 'instant' })
        anchor = button.getBoundingClientRect()
      }
      const below = bounds.bottom - anchor.bottom - 4
      const above = anchor.top - bounds.top - 4
      const desired = Math.min(256, list.scrollHeight) + headerHeight
      const flip = below < desired && above > below
      const available = Math.max(0, flip ? above : below)
      list.style.maxHeight = `${Math.max(0, Math.min(256, available - headerHeight))}px`
      const height = node.offsetHeight
      const rowBox = row.getBoundingClientRect()
      node.style.left = `${left - rowBox.left}px`
      node.style.top = `${(flip ? anchor.top - height - 4 : anchor.bottom + 4) - rowBox.top}px`
      node.dataset.placement = flip ? 'above' : 'below'
      positioning = false
    }
    position(true)
    const current = node.querySelector<HTMLButtonElement>('[aria-current="true"]') ?? node.querySelector<HTMLButtonElement>('button')
    current?.focus({ preventScroll: true })
    if (current) list.scrollTop = Math.max(0, current.offsetTop - list.offsetTop - list.clientHeight / 2)
    const reposition = () => position(false)
    const resize = new ResizeObserver(reposition)
    resize.observe(frame)
    const player = document.querySelector('[data-testid="player-widget"]')
    if (player) resize.observe(player)
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, { passive: true })
    window.visualViewport?.addEventListener('resize', reposition)
    return () => {
      resize.disconnect()
      window.removeEventListener('resize', reposition)
      window.removeEventListener('scroll', reposition)
      window.visualViewport?.removeEventListener('resize', reposition)
    }
  // Focus is acquired on open only; another surface changing the current take must not steal it.
  }, [open])

  useEffect(() => {
    if (!open) return
    let tabbing = false
    const pointer = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) closeRef.current(false)
    }
    const focus = (event: FocusEvent) => {
      if (!panel.current?.contains(event.target as Node) && (event.target !== trigger.current || tabbing)) closeRef.current(false)
      tabbing = false
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Tab') tabbing = true
      if (event.key === 'Escape') {
        event.preventDefault()
        closeRef.current(true)
      }
    }
    document.addEventListener('pointerdown', pointer)
    document.addEventListener('focusin', focus)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', pointer)
      document.removeEventListener('focusin', focus)
      document.removeEventListener('keydown', key)
    }
  }, [open])

  return <>
    <RecordingPickerButton tracks={song.tracks} open={open} home current={currentSong}
      buttonRef={trigger} ariaExpanded={open} ariaControls={open ? id : undefined}
      ariaLabel={`Choose recording of ${title}, ${song.tracks.length} recordings${currentSong ? ', current recording' : ''}`}
      onClick={() => open ? close(true) : onOpenChange(true)} />
    <AnimatePresence>
      {open && <PickerPanel ref={panel} id={id} role="region" aria-label={`Recordings of ${title}`}
        className="home-recording-panel" style={{ zIndex: LAYER.content }}
        initial={reducedMotion ? false : { opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0, transition: { duration: reducedMotion ? 0 : utilityMotion.panelEnter, ease: utilityMotion.standard } }}
        exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : utilityMotion.panelExit, ease: utilityMotion.exit } }}>
        <p className="mb-2 text-sm/5 font-medium text-[var(--tertiary)]">Recordings</p>
        <ul role="list" aria-label={`Recordings of ${title}`}>
          {song.tracks.map((track, index) => {
            const current = currentSong && trackUid === track.uid
            const playing = current && status === 'playing'
            const loading = current && status === 'loading'
            const showLoading = loading && loadingUid === track.uid
            return <li key={track.uid}>
              <button type="button" className="home-take utility-target" aria-current={current || undefined}
                aria-label={`${playing ? 'Pause' : 'Play'} ${labels[index]} — ${title}${current ? `, current recording, ${status}` : ''}`}
                onClick={() => {
                  if (current) togglePlayPause()
                  else playPlayable(toPlayable(song, authors), track.uid)
                  close(true)
                }}>
                <span aria-hidden="true"><ArtistAvatar trackUid={track.uid} size={28} ring={false} /></span>
                <span className="min-w-0 flex-1">{labels[index]}{current && <span className="block text-sm/5 text-[var(--tertiary)]">Current recording</span>}</span>
                <span className="home-take-icon" aria-hidden="true" data-loading={showLoading} data-playing={playing}>
                  <LoadingIcon size={16} className="home-loading-icon" />
                  <PauseIcon size={16} className="home-pause-icon" />
                  <PlayIcon size={16} className="home-play-icon" />
                </span>
              </button>
            </li>
          })}
        </ul>
      </PickerPanel>}
    </AnimatePresence>
  </>
}
