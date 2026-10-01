import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ISongGroup } from '../models/Collections'
import { IAuthorListing } from '../services/authorRepository'
import { ISongListing, pickListAuthor, pickListTitle } from '../services/songListingView'
import { pickScriptText } from '../services/textDisplay'
import { useSettings } from '../utils/SettingsContext'
import { useRecents } from '../utils/useRecents'

interface IHomeDiscoveryGridProps {
  books: ISongGroup[]
  topics: ISongGroup[]
  authors: IAuthorListing[]
  listingsByUid: Record<string, ISongListing>
}

function HomeRecentPanel({ listingsByUid }: Pick<IHomeDiscoveryGridProps, 'listingsByUid'>) {
  const { settings } = useSettings()
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

  return (
    <section className="home-v6-module home-v6-recent-module">
      <p className="home-v6-module-label">Recently opened</p>
      <div className="home-v6-card home-v6-list-card">
        <div className="home-v6-list-heading">
          <h2>Pick up where you left off</h2>
          <span>{songs.length}</span>
        </div>
        <ul>
          {songs.map((song) => (
            <li key={song.uid}>
              <Link href={`/songs/${song.uid}`}>
                <span className="home-v6-list-dot" />
                <span>
                  <strong>{pickListTitle(song, settings.listLanguage)}</strong>
                  <small>{pickListAuthor(song, settings.listLanguage)}</small>
                </span>
                <span aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function HomeDiscoveryGrid({
  books,
  topics,
  authors,
  listingsByUid,
}: IHomeDiscoveryGridProps) {
  const { settings } = useSettings()
  const displayedBooks = books.slice(0, 4)
  const displayedTopics = topics.slice(0, 6)
  const displayedAuthors = useMemo(
    () => authors.slice(0, 4),
    [authors],
  )

  return (
    <div className="home-v6-discovery">
      <section className="home-v6-module home-v6-books-module">
        <p className="home-v6-module-label">Books</p>
        <div className="home-v6-card home-v6-books-card">
          <div className="home-v6-books-copy">
            <h2>A library made for singing</h2>
            <p>Open a songbook and move through its original sequence.</p>
            <Link href="/books">Browse all books <span aria-hidden="true">→</span></Link>
          </div>
          <div className="home-v6-cover-grid">
            {displayedBooks.map((book, index) => {
              const title = pickScriptText(book.titles, [settings.listLanguage, 'Latn', 'Beng'])
              return (
                <Link
                  key={book.uid}
                  href={`/books/${book.uid}`}
                  className={index === 0 ? 'home-v6-cover-main' : undefined}
                  aria-label={title}
                >
                  <span className="home-v6-cover-fallback" aria-hidden="true">GK</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/covers/${book.uid}.jpg`}
                    alt=""
                    onError={(event) => { event.currentTarget.style.display = 'none' }}
                  />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <HomeRecentPanel listingsByUid={listingsByUid} />

      <section className="home-v6-module home-v6-authors-module">
        <p className="home-v6-module-label">Authors</p>
        <div className="home-v6-card home-v6-authors-card">
          <div className="home-v6-list-heading">
            <h2>Voices in the library</h2>
            <Link href="/authors">All</Link>
          </div>
          <ul>
            {displayedAuthors.map((listing, index) => {
              const name = pickScriptText(
                listing.author.names,
                [settings.listLanguage, 'Latn', 'Beng'],
              )
              return (
                <li key={listing.author.uid}>
                  <Link href={`/songs?author=${encodeURIComponent(listing.author.uid)}`}>
                    <span className={`home-v6-author-swatch home-v6-author-swatch-${index + 1}`}>
                      {name.charAt(0)}
                    </span>
                    <span>
                      <strong>{name}</strong>
                      <small>{listing.songCount} songs</small>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="home-v6-module home-v6-topics-module">
        <div className="home-v6-module-heading">
          <p className="home-v6-module-label">Explore</p>
          <Link href="/topics">Browse all topics <span aria-hidden="true">→</span></Link>
        </div>
        <div className="home-v6-topic-grid">
          {displayedTopics.map((topic, index) => {
            const title = pickScriptText(topic.titles, [settings.listLanguage, 'Latn', 'Beng'])
            return (
              <Link
                key={topic.uid}
                href={`/topics/${topic.uid}`}
                className={`home-v6-topic-tile home-v6-topic-tile-${(index % 3) + 1}`}
              >
                <span>{title}</span>
                <small>{topic.songUids.length} songs</small>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
