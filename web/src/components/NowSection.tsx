import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, Pause, Loader2 } from 'lucide-react'
// Leaf import, not the '../services' barrel: the barrel pulls in fs-backed repositories that must
// never reach the client bundle, and this component resolves the *viewer's* date after mount.
import { getSongsForDate } from '../services/calendarRepository'
import { ICalendarMonth, ILunarWindow } from '../models/Calendar'
import { ISongListing } from '../services/songListingView'
import { IAudioTrack } from '../models/Song'
import {
  AuthorNames,
  ITrackSong,
  pickTrackTitle,
  pickTrackAuthor,
  toPlayable,
} from '../services/trackListingView'
import { SongListItem } from './SongListItem'
import { ArtistAvatar, RecordingPickerButton } from './ArtistAvatar'
import { HeroBanner } from './HeroBanner'
import { monthImageUrlFor } from '../config'
import { useTheme } from '../utils/ThemeContext'
import { useSettings } from '../utils/SettingsContext'
import { usePlayer } from '../utils/PlayerContext'

interface NowSectionProps {
  /** uid -> listing, for resolving calendar song refs to titles. */
  listingsByUid: Record<string, ISongListing>
  /**
   * uid -> player slice, for the month songs that have recordings. Presence in this map is the
   * source of truth for "this row has audio" — it is what the picker actually renders — so both the
   * ordering and the picker gate off it, and they can never disagree.
   */
  trackSongsByUid: Record<string, ITrackSong>
  /** Shared authorUid -> renderings table, rejoined by `toPlayable` for the player's credit line. */
  authors: AuthorNames
  onSongClick?: (song: ISongListing) => void
}

/**
 * Disambiguated per-take labels: the singer's name, or "Name (take N)" when one singer has more
 * than one recording of the song. Mirrors the mini-player's `takeLabels` so the same song reads the
 * same way in both pickers; untagged takes fall back to the composing author rather than a raw uid,
 * which is what a reader on the home row expects to see.
 */
function takeLabelsFor(tracks: IAudioTrack[], fallback: string): Map<string, string> {
  const counts = new Map<string, number>()
  for (const t of tracks) {
    const base = t.artist ?? fallback
    counts.set(base, (counts.get(base) ?? 0) + 1)
  }
  const seen = new Map<string, number>()
  const labels = new Map<string, string>()
  for (const t of tracks) {
    const base = t.artist ?? fallback
    if ((counts.get(base) ?? 0) > 1) {
      const n = (seen.get(base) ?? 0) + 1
      seen.set(base, n)
      labels.set(t.uid, `${base} (take ${n})`)
    } else labels.set(t.uid, base)
  }
  return labels
}

/**
 * Home's lead region (docs/screens/home.md §1) — a welcome heading, then the banner on the left
 * and the month's songs on the right.
 *
 * The only region that changes on its own, and the one carrying the seasonal recommendations:
 * in Āṣāḍha the Jagannātha/Ratha-yātrā and Guru-pūrṇimā songs, in Kārtika the Dāmodarāṣṭakam set.
 *
 * The month name, its Gaudiya name and its observances all sit ON the banner, so the right-hand
 * column is nothing but the song list. Song rows delegate to SongListItem, the shared
 * song-display component; a row that has recordings also carries a stacked-avatar picker on the
 * right that plays any take straight into the mini-player (no navigation).
 */
export const NowSection: React.FC<NowSectionProps> = ({
  listingsByUid,
  trackSongsByUid,
  authors,
  onSongClick,
}) => {
  const { theme } = useTheme()
  const { settings } = useSettings()
  const { song: playingSong, trackUid, status, playPlayable, togglePlayPause } = usePlayer()
  // Home is statically generated. Resolving the date during render would bake the BUILD's clock
  // into the HTML and serve it forever, so this must happen after mount on the client.
  const [now, setNow] = useState<{ window: ILunarWindow; month: ICalendarMonth } | null>(null)
  const [hydrated, setHydrated] = useState(false)
  // Only one row's picker is open at a time, so a single "which uid" stands in for a boolean per
  // row — the same shape the mini-player uses for its mutually-exclusive drop-ups.
  const [openPickerUid, setOpenPickerUid] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const today = getSongsForDate() // device-local date
    setNow(today ? { window: today.window, month: today.month } : null)
    setHydrated(true)
  }, [])

  // Dismiss the open picker on an outside click or Escape — a floating panel that only closes by
  // re-tapping its own toggle would feel stuck. Clicks on another row's toggle stay inside the list,
  // so they switch pickers rather than closing (mousedown fires before that button's click).
  useEffect(() => {
    if (!openPickerUid) return
    const onDown = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) setOpenPickerUid(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenPickerUid(null)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openPickerUid])

  if (!hydrated) return <div className="mb-8 h-52" aria-hidden="true" />
  if (!now) return null

  // Songs with recordings first, the rest after, each partition keeping its calendar order. A stable
  // partition (not a comparator) is deliberate: a sort keyed on a boolean is not guaranteed stable
  // across engines and would reshuffle same-audio songs, losing the curated month sequence.
  const resolved = now.month.songs
    .map((ref) => listingsByUid[ref.uid])
    .filter((l): l is ISongListing => Boolean(l))
  const withAudio = resolved.filter((l) => trackSongsByUid[l.uid])
  const withoutAudio = resolved.filter((l) => !trackSongsByUid[l.uid])
  const monthSongs = [...withAudio, ...withoutAudio].slice(0, 6)

  return (
    <section className="mb-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        {/* The lead is the brand wordmark itself, set in the 5th Avenue display face (matching the
            sidebar) rather than a "Welcome to …" greeting that mixed the system bold with the serif.
            `font-normal` is load-bearing: the face ships Regular only, so a bold class would make the
            browser synthesize a fake bold and smear the high-contrast serif. */}
        <h2 className="font-display text-3xl font-normal leading-none text-[var(--primary)] sm:text-4xl">
          Śrī Gaudiya Kirtan
        </h2>
        {/* Two artworks, one per theme: the warm orange/gold mridanga reads on Gaura's light
            paper, the blue-cover one on Shyam's dark surface. Decorative either way — the
            heading already carries the meaning, so it is hidden from assistive tech rather
            than announced twice.
            `block` + `self-center` keep it optically centred against the heading: an inline
            <img> would otherwise sit on the text baseline and ride low. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            theme === 'dark'
              ? '/assets/Mridangam-BlueCover-01.svg'
              : '/assets/Mridanga-01.svg'
          }
          alt=""
          aria-hidden="true"
          className="block h-9 w-auto flex-none self-center object-contain sm:h-10"
        />
      </div>

      <div className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--background-offset)] p-4 shadow-sm sm:grid-cols-2">
        <HeroBanner
          title={now.window.lunarMonth}
          imageSrc={monthImageUrlFor(now.window.gaudiyaMonth)}
          subtitle={now.window.gaudiyaMonth}
          caption={now.month.observances.join(' · ') || undefined}
          badge={now.window.adhika ? 'adhika-māsa' : undefined}
        />

        <div className="min-w-0">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--neutral)]/70">
            Sung this month
          </h4>

          {monthSongs.length > 0 ? (
            <div ref={listRef}>
              {monthSongs.map((listing) => {
                const trackSong = trackSongsByUid[listing.uid]
                if (!trackSong) {
                  return (
                    <SongListItem
                      key={listing.uid}
                      song={listing}
                      surface="offset"
                      onClick={() => onSongClick?.(listing)}
                    />
                  )
                }

                const open = openPickerUid === listing.uid
                const title = pickTrackTitle(trackSong, settings.listLanguage)
                const author = pickTrackAuthor(trackSong, authors, settings.listLanguage)
                const labels = takeLabelsFor(trackSong.tracks, author)

                return (
                  // `relative` anchors the picker panel; the row and its toggle are siblings, so
                  // tapping the toggle never fires the row's navigate-to-song handler.
                  <div key={listing.uid} className="relative flex items-center gap-1">
                    <div className="min-w-0 flex-1">
                      <SongListItem
                        song={listing}
                        surface="offset"
                        onClick={() => onSongClick?.(listing)}
                      />
                    </div>

                    <RecordingPickerButton
                      tracks={trackSong.tracks}
                      open={open}
                      ariaExpanded={open}
                      ariaLabel={`Choose recording of ${title}`}
                      onClick={() => setOpenPickerUid(open ? null : listing.uid)}
                    />

                    <AnimatePresence>
                      {open && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                          transition={{ duration: 0.14 }}
                          // Anchored to the toggle and floated above sibling rows. `--background`
                          // (not the card's `--background-offset`) so the panel reads as a layer
                          // above the offset month card, the same contrast SongListItem's hover uses.
                          className="absolute right-0 top-full z-30 mt-1 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-xl"
                        >
                          <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--neutral)]">
                            Recordings
                          </p>
                          <ul className="max-h-64 overflow-y-auto pb-2">
                            {trackSong.tracks.map((t) => {
                              const isCurrent =
                                playingSong?.uid === listing.uid && trackUid === t.uid
                              const isPlaying = isCurrent && status === 'playing'
                              const isLoading = isCurrent && status === 'loading'
                              const label = labels.get(t.uid) ?? author
                              return (
                                <li key={t.uid}>
                                  <button
                                    type="button"
                                    // Re-tapping the loaded take toggles it; any other take starts
                                    // in place through the player context — never a navigation, so
                                    // the mini-player picks it up without a document load.
                                    onClick={() => {
                                      if (isCurrent) togglePlayPause()
                                      else playPlayable(toPlayable(trackSong, authors), t.uid)
                                      setOpenPickerUid(null)
                                    }}
                                    aria-label={
                                      isPlaying ? `Pause ${label}` : `Play ${label} — ${title}`
                                    }
                                    className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                                      isCurrent
                                        ? 'bg-[var(--highlight)]/15 text-[var(--highlight)]'
                                        : 'text-[var(--primary)] hover:bg-[var(--background-offset)]'
                                    }`}
                                  >
                                    <ArtistAvatar trackUid={t.uid} size={28} ring={false} />
                                    <span className="flex-1 truncate">{label}</span>
                                    {isLoading ? (
                                      <Loader2 size={15} className="flex-none animate-spin" />
                                    ) : isPlaying ? (
                                      <Pause size={15} className="flex-none" />
                                    ) : (
                                      <Play size={15} className="ml-0.5 flex-none" />
                                    )}
                                  </button>
                                </li>
                              )
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          ) : (
            // A month may legitimately ship no songs (Pauṣa). Say so; never fabricate rows.
            <p className="px-2.5 py-2 text-sm text-[var(--neutral)]">
              No songs are specific to this month.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
