import React from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { HomeScreen } from '../components/HomeScreen'
import { ISongGroup } from '../models/Collections'
import { IAuthorListing, getAuthors, getSongGroups, getSongListings } from '../services'
import { ISongListing } from '../services/songListingView'
import { getCalendar } from '../services/calendarRepository'

interface HomeProps {
  referenceListings: ISongListing[]
  authors: IAuthorListing[]
  books: ISongGroup[]
  topics: ISongGroup[]
}

const Home: React.FC<HomeProps> = (props) => {
  return (
    <>
      <Head>
        <title>Gaudiya Kirtan - Collection of Vaishnava Songs</title>
        <meta
          name="description"
          content="A collection of Gaudiya Vaishnava bhajans, kirtans, and prayers in various languages."
        />
      </Head>

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

  return {
    props: {
      referenceListings,
      authors: [...getAuthors()].sort((a, b) => b.songCount - a.songCount).slice(0, 10),
      books: getSongGroups('book'),
      topics: getSongGroups('topic'),
    },
  }
}

export default Home
