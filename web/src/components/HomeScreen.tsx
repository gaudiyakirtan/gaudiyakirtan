import React, { useMemo, useRef } from 'react'
import { ISongGroup } from '../models/Collections'
import { UNKNOWN_AUTHOR_UID } from '../models/Common'
import { IAuthorListing } from '../services/authorRepository'
import { ISongListing } from '../services/songListingView'
import { AuthorNames, ITrackSong } from '../services/trackListingView'
import { useTheme } from '../utils/ThemeContext'
import { useHomeLayout } from '../utils/useHomeLayout'
import { NowSection } from './NowSection'
import { RecentlyPlayedSection } from './RecentlyPlayedSection'
import { TopicsSection } from './TopicsSection'
import { BooksSection } from './BooksSection'
import { AuthorsSection } from './AuthorsSection'

interface IHomeScreenProps {
  referenceListings: ISongListing[]
  trackSongsByUid: Record<string, ITrackSong>
  trackAuthors: AuthorNames
  authors: IAuthorListing[]
  books: ISongGroup[]
  topics: ISongGroup[]
}

/** Home v5: seasonal context and repertoire, reading history, then independent browse shelves. */
export function HomeScreen({ referenceListings, trackSongsByUid, trackAuthors, authors, books, topics }: IHomeScreenProps) {
  const { theme } = useTheme()
  const ref = useRef<HTMLDivElement>(null)
  const obscured = useHomeLayout(ref)
  const listingsByUid = useMemo(() => Object.fromEntries(referenceListings.map((song) => [song.uid, song])), [referenceListings])
  return (
    <div ref={ref} className="home-screen" data-testid="home">
      <span className="home-text-probe" aria-hidden="true" />
      <div className="home-frame">
        <div className="home-brand">
          <h1 className="font-display font-normal">Śrī Gaudiya Kirtan</h1>
          {/* eslint-disable-next-line @next/next/no-img-element -- bundled decorative brand mark */}
          <img src={theme === 'dark' ? '/assets/Mridangam-BlueCover-01.svg' : '/assets/Mridanga-01.svg'} alt="" aria-hidden="true" />
        </div>
        <NowSection listingsByUid={listingsByUid} trackSongsByUid={trackSongsByUid} authors={trackAuthors} obscured={obscured} />
        <RecentlyPlayedSection listingsByUid={listingsByUid} />
        <TopicsSection topics={topics} title="Topics" limit={12} singleRow viewAllLink="/topics" />
        <BooksSection books={books} title="Books" limit={12} singleRow viewAllLink="/books" />
        <AuthorsSection authors={authors.filter((a) => a.author.uid !== UNKNOWN_AUTHOR_UID)} title="Authors" limit={12} singleRow viewAllLink="/authors" />
      </div>
    </div>
  )
}
