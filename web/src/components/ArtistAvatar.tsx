import React, { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { artistImageUrlFor } from '../config'
import { IAudioTrack } from '../models/Song'
import { PRESS_SCALE, PRESS_SPRING, stackSpreadOffset } from '../utils/motion'
import { MusicNote } from './icons/MusicNote'

/**
 * A round, ringed singer photo with a graceful music-note fallback.
 *
 * Lifted verbatim out of PlayerWidget so the home page's month-song recording control can render
 * the same faces: both the mini-player's recordings drop-up and the home picker want a portrait
 * that degrades to a note the instant the best-effort S3 image 404s (most artist codes ship no
 * portrait yet — see config.artistImageUrlFor). Keeping one implementation keeps the fallback,
 * the ring treatment and the theme tint identical across the two surfaces.
 */
export const ArtistAvatar: React.FC<{
  trackUid: string
  size?: number
  ring?: boolean
  className?: string
}> = ({ trackUid, size = 26, ring = true, className = '' }) => {
  const [failed, setFailed] = useState(false)
  // Reset on trackUid change: the same <img> node is reused across takes, so a stale `failed` from
  // a previous portrait would otherwise suppress a sibling take's image that does exist.
  useEffect(() => setFailed(false), [trackUid])
  return (
    <span
      className={`relative flex flex-none items-center justify-center overflow-hidden rounded-full bg-[var(--highlight)]/20 ${ring ? 'ring-2 ring-[var(--background-offset)]' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- external S3 image, best-effort
        <img src={artistImageUrlFor(trackUid)} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <MusicNote size={Math.round(size * 0.5)} className="text-[var(--highlight)]" />
      )}
    </span>
  )
}

// Up to this many distinct-artist faces stack in the cluster; the count badge still reports the
// full take total, so three overlapping portraits + "5" reads as "five recordings, three singers".
const MAX_STACK = 3

/**
 * The distinct-artist tracks to show as stacked faces — deduped by artist (falling back to the
 * take uid when a recording is untagged) and capped at MAX_STACK. Kept here rather than at each
 * call site so the player and the home picker cluster identically.
 */
function distinctArtistTracks(tracks: IAudioTrack[]): IAudioTrack[] {
  const seen = new Set<string>()
  const out: IAudioTrack[] = []
  for (const t of tracks) {
    const key = t.artist ?? t.uid
    if (!seen.has(key)) {
      seen.add(key)
      out.push(t)
    }
    if (out.length >= MAX_STACK) break
  }
  return out
}

interface IRecordingPickerButtonProps {
  /** All takes of the song. Drives the count badge (length) and the deduped face stack. */
  tracks: IAudioTrack[]
  /** Whether the picker this toggles is open — tints the button and the count in accent. */
  open: boolean
  onClick: () => void
  /** Accessible name; defaults to the player's wording so both surfaces read the same. */
  ariaLabel?: string
  /**
   * Reflects picker open/closed to assistive tech. Optional on purpose: the mini-player's button
   * predates this component and shipped without it, so leaving it `undefined` there keeps that DOM
   * byte-identical (React omits the attribute), while the home toggle passes `open` through.
   */
  ariaExpanded?: boolean
  avatarSize?: number
}

/**
 * The stacked-avatars + count toggle that opens a "choose recording" picker. Extracted from the
 * mini-player so the home page's month-song rows can offer the same control; the button is purely
 * presentational — the caller owns the open state and what the picker actually is.
 *
 * Home's one expressive control (docs/screens/home.md v5): the faces **fan apart** on hover /
 * keyboard focus and stay fanned while the picker is open (fanned = open), and a press shrinks the
 * pill and releases it on an under-damped spring. Both are dropped under reduced motion; the open
 * tint and the focus ring are not.
 */
export const RecordingPickerButton: React.FC<IRecordingPickerButtonProps> = ({
  tracks,
  open,
  onClick,
  ariaLabel = 'Choose recording',
  ariaExpanded,
  avatarSize = 20,
}) => {
  const reduceMotion = useReducedMotion()
  const faces = distinctArtistTracks(tracks)
  // Spread is a CSS translate driven by a per-face custom property, so the stack's layout box (and
  // the count beside it) never moves — only the faces' ink does.
  const spread = open
    ? 'motion-safe:translate-x-(--gk-spread)'
    : 'motion-safe:group-hover/picker:translate-x-(--gk-spread) motion-safe:group-focus-visible/picker:translate-x-(--gk-spread)'
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      // Hover tooltip parity with the rest of the player's controls; names the reciter count so it
      // reads as "pick a different singer", not just "a menu".
      title={`${ariaLabel} (${tracks.length})`}
      aria-expanded={ariaExpanded}
      whileTap={reduceMotion ? undefined : { scale: PRESS_SCALE }}
      transition={PRESS_SPRING}
      className={`group/picker flex h-8 items-center gap-1.5 rounded-full px-2 transition-colors duration-200 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--highlight)] ${open ? 'bg-[var(--highlight)]/15' : 'hover:bg-[var(--background)] focus-visible:bg-[var(--background)]'}`}
    >
      <span className="flex items-center">
        {faces.map((t, i) => (
          // Negative margin overlaps the faces; descending z-index so the first sits on top.
          <span
            key={t.uid}
            data-testid="recording-picker-face"
            className={`relative transition-transform duration-300 ease-expressive ${spread} ${i === 0 ? '' : '-ml-2'}`}
            style={{
              zIndex: faces.length - i,
              ['--gk-spread' as string]: `${stackSpreadOffset(i, faces.length)}px`,
            } as React.CSSProperties}
          >
            <ArtistAvatar trackUid={t.uid} size={avatarSize} />
          </span>
        ))}
      </span>
      <span className={`text-[11px] font-semibold ${open ? 'text-[var(--highlight)]' : 'text-[var(--neutral)]'}`}>{tracks.length}</span>
    </motion.button>
  )
}

export default ArtistAvatar
