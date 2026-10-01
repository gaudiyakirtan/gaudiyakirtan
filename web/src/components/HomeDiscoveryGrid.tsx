import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ISongGroup } from '../models/Collections'
import { IAuthorListing } from '../services/authorRepository'
import { ISongListing } from '../services/songListingView'
import { pickScriptText } from '../services/textDisplay'
import { useSettings } from '../utils/SettingsContext'
import { useRecents } from '../utils/useRecents'
import { BooksSection } from './BooksSection'
import { SongListItem } from './SongListItem'
import { ArrowRightIcon } from './icons/SidebarIcons'

interface IHomeDiscoveryGridProps {
  books: ISongGroup[]
  topics: ISongGroup[]
  authors: IAuthorListing[]
  listingsByUid: Record<string, ISongListing>
}

function HomeRecentPanel({ listingsByUid }: Pick<IHomeDiscoveryGridProps, 'listingsByUid'>) {
  const { recents, hydrated } = useRecents()
  const [catalog, setCatalog] = useState<Record<string, ISongListing>>({})
  const missing = hydrated && recents.some(({ uid }) => !listingsByUid[uid])

  useEffect(() => {
    if (!missing) return
    const controller = new AbortController()
    fetch('/search-listings.json', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : [])
      .then((songs: ISongListing[]) => {
        setCatalog(Object.fromEntries(songs.map((song) => [song.uid, song])))
      })
      .catch(() => {})
    return () => controller.abort()
  }, [missing])

  const songs = recents
    .map(({ uid }) => listingsByUid[uid] ?? catalog[uid])
    .filter((song): song is ISongListing => Boolean(song))
    .slice(0, 4)

  if (!hydrated || !songs.length) return null

  return <section className="home-recent" aria-labelledby="home-recent-heading">
    <div className="home-section-heading">
      <h2 id="home-recent-heading">Recently opened</h2>
    </div>
    <ul role="list" className="home-recent-list">
      {songs.map((song) => <li key={song.uid}><SongListItem song={song} /></li>)}
    </ul>
  </section>
}

export function HomeDiscoveryGrid({
  books,
  topics,
  authors,
  listingsByUid,
}: IHomeDiscoveryGridProps) {
  const { settings } = useSettings()

  return <div className="home-discovery">
    <HomeRecentPanel listingsByUid={listingsByUid} />
    <BooksSection books={books} limit={7} singleRow viewAllLink="/books" />
    {!!authors.length && <section className="home-authors" aria-labelledby="home-authors-heading">
      <div className="home-section-heading">
        <h2 id="home-authors-heading">Authors</h2>
        <Link href="/authors" className="home-view-all utility-target">All authors <ArrowRightIcon className="home-arrow" aria-hidden="true" /></Link>
      </div>
      <ul role="list" className="home-author-list">
        {authors.slice(0, 4).map(({ author, songCount }) => {
          const name = pickScriptText(author.names, [settings.listLanguage, 'Latn', 'Beng'])
          return <li key={author.uid}>
            <Link href={`/songs?author=${encodeURIComponent(author.uid)}`} className="home-author-row utility-target">
              <span>{name}</span><small>{songCount} songs</small><ArrowRightIcon className="home-arrow" size={16} aria-hidden="true" />
            </Link>
          </li>
        })}
      </ul>
    </section>}
    {!!topics.length && <section className="home-topics" aria-labelledby="home-topics-heading">
      <div className="home-section-heading">
        <h2 id="home-topics-heading">Topics</h2>
        <Link href="/topics" className="home-view-all utility-target">All topics <ArrowRightIcon className="home-arrow" aria-hidden="true" /></Link>
      </div>
      <ul role="list" className="home-topic-links">
        {topics.slice(0, 6).map((topic) => <li key={topic.uid}>
          <Link href={`/topics/${topic.uid}`} className="home-topic-link utility-target">
            <span>{pickScriptText(topic.titles, [settings.listLanguage, 'Latn', 'Beng'])}</span>
            <small>{topic.songUids.length}<span className="sr-only"> songs</span></small>
          </Link>
        </li>)}
      </ul>
    </section>}
  </div>
}
