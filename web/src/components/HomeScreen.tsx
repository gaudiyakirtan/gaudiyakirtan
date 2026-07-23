import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import { ISongGroup } from '../models/Collections'
import { UNKNOWN_AUTHOR_UID } from '../models/Common'
import { IAuthorListing } from '../services/authorRepository'
import { ISongListing } from '../services/songListingView'
import { AuthorNames, ITrackSong } from '../services/trackListingView'
import { NowSection } from './NowSection'
import { RecentlyPlayedSection } from './RecentlyPlayedSection'
import { TopicsSection } from './TopicsSection'
import { BooksSection } from './BooksSection'
import { AuthorsSection } from './AuthorsSection'

interface HomeScreenProps {
  /** Lookup source for uid-only references (calendar song refs, local recents). */
  referenceListings: ISongListing[]
  /** Player slices for the month songs that have recordings, keyed by uid (home's recording picker). */
  trackSongsByUid: Record<string, ITrackSong>
  /** Shared authorUid -> renderings table for those track songs (rejoined by `toPlayable`). */
  trackAuthors: AuthorNames
  authors: IAuthorListing[]
  books: ISongGroup[]
  topics: ISongGroup[]
}

/**
 * Home (docs/screens/home.md) — leads with what to sing now, then what the reader was last
 * reading, then the browse sections.
 *
 *   1. This month      — the lunar month's songs + the ārati for the time of day
 *   2. Recently played — from localStorage, most recent first
 *   3. Topics          — one row
 *   4. Books           — one row
 *   5. Authors         — one row
 *
 * There is no "Popular" region: the corpus carries no usage signal and none can be manufactured
 * (~30 of 702 songs appear even once across 2,172 dated community livestreams).
 */
export const HomeScreen: React.FC<HomeScreenProps> = ({
  referenceListings,
  trackSongsByUid,
  trackAuthors,
  authors,
  books,
  topics,
}) => {
  const router = useRouter()

  const listingsByUid = useMemo(
    () => Object.fromEntries(referenceListings.map((l) => [l.uid, l])),
    [referenceListings],
  )

  const handleSongClick = (song: ISongListing) => {
    router.push(`/songs/${song.uid}`)
  }

  const handleAuthorClick = (listing: IAuthorListing) => {
    router.push(`/songs?author=${encodeURIComponent(listing.author.uid)}`)
  }

  const handleBookClick = (book: ISongGroup) => {
    router.push(`/books/${book.uid}`)
  }

  const handleTopicClick = (topic: ISongGroup) => {
    router.push(`/topics/${topic.uid}`)
  }

  return (
    <div className="w-full max-w-screen-lg pt-4 pb-20 mx-auto">
      {/* "This month" is the lead region: the month's songs plus the ārati for the time of day.
          It carries the seasonal recommendations (in Āṣāḍha, the Jagannātha/Ratha-yātrā and
          Guru-pūrṇimā songs) and is the only region that changes through the day and year. */}
      <NowSection
        listingsByUid={listingsByUid}
        trackSongsByUid={trackSongsByUid}
        authors={trackAuthors}
        onSongClick={handleSongClick}
      />

      <RecentlyPlayedSection listingsByUid={listingsByUid} onSongClick={handleSongClick} />

      {/* Topics -> Books -> Authors, each ONE horizontally-scrollable row (`singleRow`). The
          wrapping grids these sections use by default belong on /topics and /books, where the
          whole set is the point; on home they cost three rows of vertical scroll each.
          Topics and Books hide themselves when the corpus ships no groups of that kind. */}
      <div className="mb-8">
        <TopicsSection
          topics={topics}
          onTopicClick={handleTopicClick}
          title="Topics"
          limit={12}
          singleRow
          viewAllLink="/topics"
        />
      </div>

      <div className="mb-8">
        <BooksSection
          books={books}
          onBookClick={handleBookClick}
          title="Books"
          limit={12}
          singleRow
          viewAllLink="/books"
        />
      </div>

      <AuthorsSection
        authors={authors.filter((a) => a.author.uid !== UNKNOWN_AUTHOR_UID)}
        onAuthorClick={handleAuthorClick}
        title="Authors"
        limit={12}
        singleRow
        viewAllLink="/authors"
      />
    </div>
  )
}
