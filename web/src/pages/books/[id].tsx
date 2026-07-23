import React from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { getSongGroups, getSongGroupByUid } from '../../services/songGroupRepository'
import { getSongListings } from '../../services/songListing'
import { pickScriptText } from '../../services/textDisplay'
import { ISongListing } from '../../services/songListingView'
import { SongGroupScreen, ISongGroupView } from '../../components/SongGroupScreen'
import { Seo } from '../../components/Seo'
import { canonical, SITE_NAME, SITE_URL } from '../../config'

interface BookDetailProps {
  group: ISongGroupView
  songs: ISongListing[]
}

const BookDetailPage: React.FC<BookDetailProps> = ({ group, songs }) => {
  const path = `/books/${group.uid}`
  return (
    <>
      <Seo
        title={`${group.title} — Gaudiya Kirtan`}
        description={`${group.title}, a Gauḍīya Vaiṣṇava songbook — ${group.count} songs with lyrics, transliteration and translation.`}
        path={path}
        type="article"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: group.title,
            url: canonical(path),
            isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Books', item: canonical('/books') },
              { '@type': 'ListItem', position: 3, name: group.title, item: canonical(path) },
            ],
          },
        ]}
      />
      <SongGroupScreen group={group} songs={songs} />
    </>
  )
}

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
