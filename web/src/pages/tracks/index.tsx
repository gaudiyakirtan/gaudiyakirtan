import React, { useMemo } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getTrackSongs, getTrackAuthors } from '../../services/trackListing'
import {
  AuthorNames,
  ITrackSong,
  ITrackRow,
  flattenTracks,
  trackRowKey,
  sectionLetterForTrack,
  artistsOf,
} from '../../services/trackListingView'
import { TrackListItem } from '../../components/TrackListItem'
import { AlphabeticalScrollBar } from '../../components/AlphabeticalScrollBar'

interface TracksPageProps {
  songs: ITrackSong[]
  /** Shared author-name table, keyed by authorUid (see trackListing.getTrackAuthors). */
  authors: AuthorNames
}

const ALPHABET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/**
 * The Tracks library screen: every *recording* in the corpus, as opposed to /songs which lists
 * every *work*. The distinction matters because 144 songs have more than one take (different
 * reciters), so 244 songs with audio expand to 753 rows here.
 *
 * Rows play in place through the PlayerProvider — nothing on this screen navigates in order to
 * start audio, and every link out of it is a next/link `<Link>`, so playback survives the trip.
 */
const TracksPage: React.FC<TracksPageProps> = ({ songs, authors }) => {
  const router = useRouter()
  const artistFilter = typeof router.query.artist === 'string' ? router.query.artist : undefined

  const allRows = useMemo(() => flattenTracks(songs), [songs])
  const artists = useMemo(() => artistsOf(allRows), [allRows])

  const rows = useMemo(
    () => (artistFilter ? allRows.filter((r) => r.track.artist === artistFilter) : allRows),
    [allRows, artistFilter]
  )

  // Group by the A–Z letter of the fixed Latin song title, so the index is stable across
  // listLanguage changes (sectionLetterForTrack).
  const sections = useMemo(() => {
    const byLetter = new Map<string, ITrackRow[]>()
    for (const row of rows) {
      const letter = sectionLetterForTrack(row)
      const bucket = byLetter.get(letter)
      if (bucket) bucket.push(row)
      else byLetter.set(letter, [row])
    }
    return [...byLetter.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [rows])

  const activeLetters = useMemo(() => new Set(sections.map(([letter]) => letter)), [sections])

  const jumpToLetter = (letter: string) => {
    document
      .getElementById(`section-${letter}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Shallow client-side nav: keeps the page (and the playing track) mounted while the filter changes.
  const setArtist = (artist: string) => {
    router.push(artist ? { pathname: '/tracks', query: { artist } } : '/tracks', undefined, {
      shallow: true,
    })
  }

  const heading = artistFilter ?? 'Tracks'

  return (
    <>
      <Head>
        <title>{artistFilter ? `${artistFilter} - Gaudiya Kirtan` : 'Tracks - Gaudiya Kirtan'}</title>
        <meta
          name="description"
          content="Browse every recording in the Gaudiya Kirtan collection by song and reciter."
        />
      </Head>

      <div className="mx-auto w-full max-w-screen-lg pb-12 pr-6">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-y-2 px-4 py-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold text-[var(--primary)]">{heading}</h1>
            <span className="text-sm text-[var(--neutral)]">
              {rows.length} {rows.length === 1 ? 'recording' : 'recordings'}
            </span>
            {artistFilter && (
              <Link href="/tracks" className="text-sm text-[var(--highlight)] hover:underline">
                All tracks
              </Link>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs text-[var(--neutral)]">
            <span>Reciter</span>
            <select
              value={artistFilter ?? ''}
              onChange={(e) => setArtist(e.target.value)}
              className="rounded-full bg-[var(--background-offset)] px-3 py-1 text-xs text-[var(--primary)] outline-none"
            >
              <option value="">All reciters</option>
              {artists.map(({ artist, count }) => (
                <option key={artist} value={artist}>
                  {artist} ({count})
                </option>
              ))}
            </select>
          </label>
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-16 text-center text-[var(--neutral)]">No recordings found.</div>
        ) : (
          <div className="px-4">
            {sections.map(([letter, letterRows]) => (
              <section key={letter} id={`section-${letter}`} className="mb-6 scroll-mt-16">
                <h2 className="sticky top-12 mb-2 bg-[var(--background)] py-1 text-sm font-bold text-[var(--highlight)]">
                  {letter}
                </h2>
                <div className="space-y-1">
                  {letterRows.map((row) => (
                    <TrackListItem key={trackRowKey(row)} row={row} authors={authors} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {!artistFilter && rows.length > 0 && (
        <AlphabeticalScrollBar letters={ALPHABET} active={activeLetters} onJump={jumpToLetter} />
      )}
    </>
  )
}

export const getStaticProps: GetStaticProps<TracksPageProps> = async () => {
  return {
    props: {
      songs: getTrackSongs(),
      authors: getTrackAuthors(),
    },
  }
}

export default TracksPage
