import React, { useEffect, useState } from 'react'
// Leaf import, not the '../services' barrel: the barrel pulls in fs-backed repositories that must
// never reach the client bundle, and this component resolves the *viewer's* date after mount.
import { getSongsForDate } from '../services/calendarRepository'
import { ICalendarMonth, ILunarWindow } from '../models/Calendar'
import { ISongListing } from '../services/songListingView'
import { SongListItem } from './SongListItem'
import { HeroBanner } from './HeroBanner'
import { monthImageUrlFor } from '../config'
import { useTheme } from '../utils/ThemeContext'

interface NowSectionProps {
  /** uid -> listing, for resolving calendar song refs to titles. */
  listingsByUid: Record<string, ISongListing>
  onSongClick?: (song: ISongListing) => void
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
 * song-display component.
 */
export const NowSection: React.FC<NowSectionProps> = ({ listingsByUid, onSongClick }) => {
  const { theme } = useTheme()
  // Home is statically generated. Resolving the date during render would bake the BUILD's clock
  // into the HTML and serve it forever, so this must happen after mount on the client.
  const [now, setNow] = useState<{ window: ILunarWindow; month: ICalendarMonth } | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const today = getSongsForDate() // device-local date
    setNow(today ? { window: today.window, month: today.month } : null)
    setHydrated(true)
  }, [])

  if (!hydrated) return <div className="mb-8 h-52" aria-hidden="true" />
  if (!now) return null

  const monthSongs = now.month.songs
    .map((ref) => listingsByUid[ref.uid])
    .filter((l): l is ISongListing => Boolean(l))
    .slice(0, 6)

  return (
    <section className="mb-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-2xl font-bold leading-none text-[var(--primary)] sm:text-3xl">
          Welcome to Gaudiya Kirtan!
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
            <div>
              {monthSongs.map((listing) => (
                <SongListItem
                  key={listing.uid}
                  song={listing}
                  surface="offset"
                  onClick={() => onSongClick?.(listing)}
                />
              ))}
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
