import React, { useMemo, useRef } from 'react'
import { ISongGroup } from '../models/Collections'
import { UNKNOWN_AUTHOR_UID } from '../models/Common'
import { IAuthorListing } from '../services/authorRepository'
import { ISongListing } from '../services/songListingView'
import { AuthorNames, ITrackSong } from '../services/trackListingView'
import { useTheme } from '../utils/ThemeContext'
import { useHomeLayout } from '../utils/useHomeLayout'
import { NowSection } from './NowSection'
import { HomeDiscoveryGrid } from './HomeDiscoveryGrid'

interface IHomeScreenProps {
  referenceListings: ISongListing[]
  trackSongsByUid: Record<string, ITrackSong>
  trackAuthors: AuthorNames
  authors: IAuthorListing[]
  books: ISongGroup[]
  topics: ISongGroup[]
}

/** Home v6: an airy bento canvas built from real seasonal, playback and library data. */
export function HomeScreen({ referenceListings, trackSongsByUid, trackAuthors, authors, books, topics }: IHomeScreenProps) {
  const { theme } = useTheme()
  const ref = useRef<HTMLDivElement>(null)
  const obscured = useHomeLayout(ref)
  const listingsByUid = useMemo(() => Object.fromEntries(referenceListings.map((song) => [song.uid, song])), [referenceListings])
  return (
    <div ref={ref} className="home-screen" data-testid="home">
      <span className="home-text-probe" aria-hidden="true" />
      <div className="home-v6-frame">
        <header className="home-v6-masthead">
          <h1 className="font-display font-normal">Śrī Gaudiya Kirtan</h1>
          {/* eslint-disable-next-line @next/next/no-img-element -- bundled decorative brand mark */}
          <img src={theme === 'dark' ? '/assets/Mridangam-BlueCover-01.svg' : '/assets/Mridanga-01.svg'} alt="" aria-hidden="true" />
          <p aria-hidden="true">Songbooks, recordings and seasonal kīrtana in one quiet place.</p>
        </header>
        <NowSection listingsByUid={listingsByUid} trackSongsByUid={trackSongsByUid} authors={trackAuthors} obscured={obscured} />
        <HomeDiscoveryGrid
          books={books}
          topics={topics}
          authors={authors.filter((author) => author.author.uid !== UNKNOWN_AUTHOR_UID)}
          listingsByUid={listingsByUid}
        />
      </div>
    </div>
  )
}
