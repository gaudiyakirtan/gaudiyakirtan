import React from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { getSongGroups, getSongGroupByUid } from '../../services/songGroupRepository'
import { getSongListings } from '../../services/songListing'
import { pickScriptText } from '../../services/textDisplay'
import { ISongListing } from '../../services/songListingView'
import { SongGroupScreen, ISongGroupView } from '../../components/SongGroupScreen'
import { Seo } from '../../components/Seo'
import { canonical, SITE_NAME, SITE_URL } from '../../config'

interface TopicDetailProps {
  group: ISongGroupView
  songs: ISongListing[]
}

const TopicDetailPage: React.FC<TopicDetailProps> = ({ group, songs }) => {
  const path = `/topics/${group.uid}`
  return (
    <>
      <Seo
        title={`${group.title} — Gaudiya Kirtan`}
        description={`Gauḍīya Vaiṣṇava songs on the theme of ${group.title} — ${group.count} bhajans and kīrtans with lyrics, transliteration and translation.`}
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
              { '@type': 'ListItem', position: 2, name: 'Topics', item: canonical('/topics') },
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
  paths: getSongGroups('topic').map((g) => ({ params: { id: g.uid } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<TopicDetailProps> = async ({ params }) => {
  const uid = params?.id as string
  const group = getSongGroupByUid(uid)
  if (!group) return { notFound: true }

  const byUid = new Map(getSongListings().map((s) => [s.uid, s]))
  // Topics are unordered — sort by title for a stable listing.
  const songs = group.songUids
    .map((u) => byUid.get(u))
    .filter((s): s is ISongListing => !!s)
    .sort((a, b) => a.title.localeCompare(b.title))

  return {
    props: {
      group: {
        uid: group.uid,
        kind: 'topic',
        title: pickScriptText(group.titles, ['Latn', 'Beng']),
        titles: group.titles,
        color: group.color ?? null,
        count: songs.length,
      },
      songs,
    },
  }
}

export default TopicDetailPage
