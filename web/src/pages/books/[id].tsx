import React from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { getSongGroups, getSongGroupByUid } from '../../services/songGroupRepository'
import { getSongListings } from '../../services/songListing'
import { pickScriptText } from '../../services/textDisplay'
import { ISongListing } from '../../services/songListingView'
import { SongGroupScreen, ISongGroupView } from '../../components/SongGroupScreen'

interface BookDetailProps {
  group: ISongGroupView
  songs: ISongListing[]
}

const BookDetailPage: React.FC<BookDetailProps> = ({ group, songs }) => (
  <>
    <Head>
      <title>{group.title} - Gaudiya Kirtan</title>
      <meta name="description" content={`Songs in ${group.title}`} />
    </Head>
    <SongGroupScreen group={group} songs={songs} />
  </>
)

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: getSongGroups('book').map((g) => ({ params: { id: g.uid } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<BookDetailProps> = async ({ params }) => {
  const uid = params?.id as string
  const group = getSongGroupByUid(uid)
  if (!group) return { notFound: true }

  const byUid = new Map(getSongListings().map((s) => [s.uid, s]))
  // Books are ordered — preserve song_uids order (docs/data/collections.md).
  const songs = group.songUids.map((u) => byUid.get(u)).filter((s): s is ISongListing => !!s)

  return {
    props: {
      group: {
        uid: group.uid,
        kind: 'book',
        title: pickScriptText(group.titles, ['Latn', 'Beng']),
        titles: group.titles,
        color: group.color ?? null,
        count: songs.length,
      },
      songs,
    },
  }
}

export default BookDetailPage
