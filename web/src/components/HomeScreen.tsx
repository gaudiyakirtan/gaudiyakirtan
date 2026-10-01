import React, { useEffect, useMemo, useRef } from 'react'
import { ISongGroup } from '../models/Collections'
import { UNKNOWN_AUTHOR_UID } from '../models/Common'
import { IAuthorListing } from '../services/authorRepository'
import { ISongListing } from '../services/songListingView'
import { AuthorNames, ITrackSong } from '../services/trackListingView'
import { useOpenSearch } from '../utils/SearchContext'
import { SearchIcon, ArrowRightIcon } from './icons/SidebarIcons'
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

/** Home v7: one featured song, followed by seasonal context and editorial discovery. */
export function HomeScreen({ referenceListings, trackSongsByUid, trackAuthors, authors, books, topics }: IHomeScreenProps) {
  const openSearch = useOpenSearch()
  const ref = useRef<HTMLDivElement>(null)
  const obscured = useHomeLayout(ref)
  const searchRef = useRef<HTMLButtonElement>(null)
  const restoreSearchFocus = useRef(false)
  const wasObscured = useRef(false)
  useEffect(() => {
    if (wasObscured.current && !obscured && restoreSearchFocus.current) {
      searchRef.current?.focus()
      restoreSearchFocus.current = false
    }
    wasObscured.current = obscured
  }, [obscured])
  const listingsByUid = useMemo(() => Object.fromEntries(referenceListings.map((song) => [song.uid, song])), [referenceListings])
  return (
    <div ref={ref} className="home-screen" data-testid="home">
      <span className="home-text-probe" aria-hidden="true" />
      <div className="home-frame">
        <header className="home-masthead">
          <h1 className="font-display font-normal">Śrī Gaudiya Kirtan</h1>
          <button ref={searchRef} type="button" className="home-search utility-target" onClick={() => {
            restoreSearchFocus.current = true
            openSearch?.()
          }}>
            <SearchIcon aria-hidden="true" />
            <span>Find a song</span>
            <ArrowRightIcon className="home-arrow" aria-hidden="true" />
          </button>
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
