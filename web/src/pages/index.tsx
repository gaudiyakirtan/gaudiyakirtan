import React from 'react'
import { GetStaticProps } from 'next'
import { HomeScreen } from '../components/HomeScreen'
import Head from 'next/head'
import { getSongs, getAuthors, getBooks, getTopics } from '../lib/data'

interface HomeProps {
  songs: any[]
  authors: any[]
  topics: any[]
  books: any[]
}

const Home: React.FC<HomeProps> = ({ songs, authors, topics, books }) => {
  // Transform MongoDB song docs to match IExtendedSong interface
  const transformedSongs = songs.map((song, index) => ({
    id: String(index + 1),
    title: [{ title: song.title, language: 'en' }],
    author: [{ author: song.author || 'Unknown', language: 'en' }],
    uid: song.uid,
    tags: song.tags || [],
    topics: (song.topics || []).map((t: string) => ({ topic: t, language: 'en' })),
    audio: song.audio || false,
    verses: (song.verses || []).map((v: any) => ({
      ...v,
      word_to_words: v.wordToWords || [],
    })),
    tracks: song.tracks || [],
  }))

  // Transform authors
  const transformedAuthors = authors.map(a => ({
    id: a.uid,
    name: a.name,
    image: a.image,
  }))

  // Transform topics
  const transformedTopics = topics.map(t => ({
    name: t.topic,
  }))

  // Transform books
  const transformedBooks = books.map(b => ({
    id: b.uid,
    title: b.title,
    author: b.author,
    slug: b.slug,
    uid: b.uid,
    image: b.image,
  }))

  return (
    <>
      <Head>
        <title>Gaudiya Kirtan - Collection of Vaishnava Songs</title>
        <meta name="description" content="A collection of Gaudiya Vaishnava bhajans, kirtans, and prayers in various languages." />
      </Head>

      <HomeScreen
        songs={transformedSongs}
        authors={transformedAuthors}
        topics={transformedTopics}
        books={transformedBooks}
      />
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const [songs, authors, books, topics] = await Promise.all([
    getSongs(),
    getAuthors(),
    getBooks(),
    getTopics(),
  ])

  return {
    props: { songs, authors, topics, books },
    revalidate: 60 * 60,
  }
}

export default Home
