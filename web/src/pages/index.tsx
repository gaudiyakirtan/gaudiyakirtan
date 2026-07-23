import React from 'react'
import { GetStaticProps } from 'next'
import { Seo } from '../components/Seo'
import { SITE_URL, SITE_NAME } from '../config'
import { HomeScreen } from '../components/HomeScreen'
import { ISongGroup } from '../models/Collections'
import { IAuthorListing, getAuthors, getSongGroups, getSongListings } from '../services'
import { ISongListing } from '../services/songListingView'
import { getTrackSongs, getTrackAuthors } from '../services/trackListing'
import { AuthorNames, ITrackSong } from '../services/trackListingView'
import { getCalendar } from '../services/calendarRepository'

interface HomeProps {
  referenceListings: ISongListing[]
  /** Player slices for the month songs that have recordings, keyed by uid (home's recording picker). */
  trackSongsByUid: Record<string, ITrackSong>
  /** Shared authorUid -> renderings table for those track songs (rejoined by `toPlayable`). */
  trackAuthors: AuthorNames
  authors: IAuthorListing[]
  books: ISongGroup[]
  topics: ISongGroup[]
}

const Home: React.FC<HomeProps> = (props) => {
  return (
    <>
      <Seo
        title="Gaudiya Kirtan — Gauḍīya Vaiṣṇava Songs, Bhajans & Kirtans"
        description="A free, offline-first library of Gauḍīya Vaiṣṇava bhajans, kīrtans and prayers — 700+ songs with lyrics, transliteration in many scripts, translations, and recordings."
        path="/"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
            // Sitelinks Search Box: lets Google offer a search field for the site in results.
            potentialAction: {
              '@type': 'SearchAction',
              target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/songs?q={search_term_string}` },
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
            logo: `${SITE_URL}/icon-512.png`,
          },
        ]}
      />

      <HomeScreen {...props} />
    </>
  )
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const listings = getSongListings()
  const byUid = new Map(listings.map((l) => [l.uid, l]))

  // Ship only the songs that uid-only references can point at (month + ārati refs), not the whole
  // 702-entry index — the page payload would balloon for no gain. A recently-played song outside
  // this set resolves to nothing and is skipped; acceptable, since the local history is capped at
  // 10 and this covers the songs home can actually surface.
  const calendar = getCalendar()
  const referenced = new Set<string>([
    ...calendar.months.flatMap((m) => m.songs.map((s) => s.uid)),
    ...calendar.daily.flatMap((d) => d.songs.map((s) => s.uid)),
  ])

  const referenceListings = [...referenced]
    .map((uid) => byUid.get(uid))
    .filter((l): l is ISongListing => Boolean(l))

  // The recording picker only appears on the month song rows, so ship the player slice for exactly
  // those — the songs in `calendar.months` that actually have recordings — not all 244 with audio.
  // /tracks ships the full set at 350 kB and is already flagged over the page-data threshold; home
  // must not repeat that. The month set with audio is a few dozen songs (~one order of magnitude
  // smaller), and daily/ārati refs are excluded because they carry no picker.
  const monthUids = new Set<string>(calendar.months.flatMap((m) => m.songs.map((s) => s.uid)))
  const trackSongsByUid: Record<string, ITrackSong> = {}
  for (const song of getTrackSongs()) {
    if (monthUids.has(song.uid)) trackSongsByUid[song.uid] = song
  }

  // Author renderings are shipped once in a shared table (see getTrackAuthors), but bounded further
  // to only the authors those month songs reference — the full table covers all 244 audio songs'
  // authors, most of which home never needs.
  const allAuthors = getTrackAuthors()
  const trackAuthors: AuthorNames = {}
  for (const song of Object.values(trackSongsByUid)) {
    if (allAuthors[song.authorUid]) trackAuthors[song.authorUid] = allAuthors[song.authorUid]
  }

  return {
    props: {
      referenceListings,
      trackSongsByUid,
      trackAuthors,
      authors: [...getAuthors()].sort((a, b) => b.songCount - a.songCount).slice(0, 10),
      books: getSongGroups('book'),
      topics: getSongGroups('topic'),
    },
  }
}

export default Home
