import React, { useEffect, useMemo, useState } from 'react'
import { GetStaticProps } from 'next'
import { Seo } from '../../components/Seo'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ISongListing, sectionLetterFor } from '../../services/songListingView'
import { getSongListings } from '../../services/songListing'
import { SongListItem } from '../../components/SongListItem'
import { SongCard } from '../../components/SongCard'
import { AlphabeticalScrollBar } from '../../components/AlphabeticalScrollBar'

interface SongsPageProps {
  songs: ISongListing[]
}

type ViewMode = 'list' | 'grid'

const ALPHABET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const SongsPage: React.FC<SongsPageProps> = ({ songs }) => {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  // Author-filtered variant: /songs?author=<uid> (the target of song-detail's author-tap).
  const authorFilter = typeof router.query.author === 'string' ? router.query.author : undefined
  // Tag- / reciter-filtered variants: /songs?tag=<tag> and /songs?artist=<reciter> (targets of tag /
  // reciter hits in the search palette). Each entity→uids map is fetched once from its build-time
  // index (tag-index.json / artist-index.json).
  const tagFilter = typeof router.query.tag === 'string' ? router.query.tag : undefined
  const artistFilter = typeof router.query.artist === 'string' ? router.query.artist : undefined
  const [filterUids, setFilterUids] = useState<Set<string> | null>(null)
  useEffect(() => {
    const key = tagFilter ?? artistFilter
    const file = tagFilter ? '/tag-index.json' : artistFilter ? '/artist-index.json' : null
    if (!key || !file) return
    setFilterUids(null)
    fetch(file)
      .then((r) => r.json())
      .then((m: Record<string, string[]>) => setFilterUids(new Set(m[key] ?? [])))
      .catch(() => setFilterUids(new Set()))
  }, [tagFilter, artistFilter])

  const filtered = useMemo(() => {
    if (authorFilter) return songs.filter((s) => s.authorUid === authorFilter)
    if (tagFilter || artistFilter) return filterUids ? songs.filter((s) => filterUids.has(s.uid)) : []
    return songs
  }, [songs, authorFilter, tagFilter, artistFilter, filterUids])

  const authorName = authorFilter ? (filtered[0]?.authorName ?? authorFilter) : undefined
  const heading = authorName ?? tagFilter ?? artistFilter ?? 'Songs'
  const isFiltered = !!(authorFilter || tagFilter || artistFilter)

  // Group by A–Z section, sorted by the stable Latin primary_title so switching listLanguage
  // never reshuffles the index (docs/screens/songs-list.md).
  const sections = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => a.title.localeCompare(b.title))
    const byLetter = new Map<string, ISongListing[]>()
    for (const listing of sorted) {
      const letter = sectionLetterFor(listing)
      const bucket = byLetter.get(letter)
      if (bucket) bucket.push(listing)
      else byLetter.set(letter, [listing])
    }
    return [...byLetter.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  const activeLetters = useMemo(() => new Set(sections.map(([letter]) => letter)), [sections])

  const handleSongClick = (song: ISongListing) => {
    router.push(`/songs/${song.uid}`)
  }

  const jumpToLetter = (letter: string) => {
    document
      .getElementById(`section-${letter}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Seo
        title={isFiltered ? `${heading} — Gaudiya Kirtan` : 'Songs — Gaudiya Kirtan'}
        description="Browse the full collection of 700+ Gauḍīya Vaiṣṇava songs — bhajans, kīrtans and prayers with lyrics, transliteration and translation."
        // Filtered views (?author=/?tag=/?artist=) canonicalize to the base list, not separate pages.
        path="/songs"
      />

      <div className="w-full max-w-screen-lg pb-12 pr-6 mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between px-4 py-4 mb-2 gap-y-2">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold text-[var(--primary)]">{heading}</h1>
            <span className="text-sm text-[var(--neutral)]">{filtered.length} songs</span>
            {isFiltered && (
              <Link href="/songs" className="text-sm text-[var(--highlight)] hover:underline">
                All songs
              </Link>
            )}
          </div>

          {/* Presentation toggle: flat list (default) / card grid */}
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--highlight)] text-[var(--on-highlight)]'
                  : 'bg-[var(--background-offset)] text-[var(--neutral)] hover:text-[var(--primary)]'
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[var(--highlight)] text-[var(--on-highlight)]'
                  : 'bg-[var(--background-offset)] text-[var(--neutral)] hover:text-[var(--primary)]'
              }`}
            >
              Grid
            </button>
          </div>
        </div>

        {/* Empty state (only reachable via a filter with no matches) */}
        {filtered.length === 0 ? (
          <div className="px-4 py-16 text-center text-[var(--neutral)]">
            {(tagFilter || artistFilter) && !filterUids ? 'Loading…' : 'No songs found.'}
          </div>
        ) : (
          <div className="px-4">
            {sections.map(([letter, listings]) => (
              <section key={letter} id={`section-${letter}`} className="mb-6 scroll-mt-16">
                <h2 className="text-sm font-bold text-[var(--highlight)] mb-2 sticky top-12 bg-[var(--background)] py-1">
                  {letter}
                </h2>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {listings.map((song) => (
                      <SongCard key={song.uid} song={song} onClick={() => handleSongClick(song)} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {listings.map((song) => (
                      <SongListItem key={song.uid} song={song} onClick={() => handleSongClick(song)} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>

      {/* A–Z index scrubber (hidden while filtered - too few songs to index) */}
      {!isFiltered && filtered.length > 0 && (
        <AlphabeticalScrollBar letters={ALPHABET} active={activeLetters} onJump={jumpToLetter} />
      )}
    </>
  )
}

export const getStaticProps: GetStaticProps<SongsPageProps> = async () => {
  return {
    props: {
      songs: getSongListings(),
    },
  }
}

export default SongsPage
