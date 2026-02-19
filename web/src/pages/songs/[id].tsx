import React from 'react'
import { useRouter } from 'next/router'
import { GetStaticProps, GetStaticPaths } from 'next'
import { IExtendedSong } from '../../models/Song'
import { SongScreen } from '../../components/SongScreen'
import Head from 'next/head'
import { getSongs, getSongByIdOrUid } from '../../lib/data'

interface SongPageProps {
  song: IExtendedSong
}

const SongPage: React.FC<SongPageProps> = ({ song }) => {
  const userLanguage = 'en'
  const router = useRouter()

  if (router.isFallback) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (!song) {
    return (
      <div className="flex flex-col items-center p-8">
        <h1 className="mb-4 text-2xl font-bold text-gaur-primary dark:text-shyam-primary">Song not found</h1>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 text-white rounded-lg bg-gaur-accent dark:bg-shyam-accent"
        >
          Return to home
        </button>
      </div>
    )
  }

  const title = song.title.find(t => t.language === 'en')?.title || song.title[0].title
  const author = song.author?.find(a => a.language === 'en')?.author ||
                (song.author && song.author.length > 0 ? song.author[0].author : 'Unknown')

  return (
    <>
      <Head>
        <title>{title} by {author} - Gaudiya Kirtan</title>
        <meta name="description" content={`Lyrics, transliteration and translation for ${title} by ${author}`} />
      </Head>

      <SongScreen song={song} language={userLanguage} />
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const songs = await getSongs()

  const paths = songs.flatMap((song: any, index: number) => [
    { params: { id: String(index + 1) } },
    { params: { id: song.uid } }
  ])

  return {
    paths,
    fallback: true
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.id as string
  const dbSong = await getSongByIdOrUid(id)

  if (!dbSong) {
    return { notFound: true }
  }

  // Transform to IExtendedSong format
  const song = {
    id: dbSong.uid,
    title: [{ title: dbSong.title, language: 'en' }],
    author: [{ author: dbSong.author || 'Unknown', language: 'en' }],
    uid: dbSong.uid,
    tags: dbSong.tags || [],
    topics: (dbSong.topics || []).map((t: string) => ({ topic: t, language: 'en' })),
    audio: dbSong.audio || false,
    verses: (dbSong.verses || []).map((v: any) => ({
      ...v,
      word_to_words: v.wordToWords || [],
    })),
    tracks: dbSong.tracks || [],
  }

  return {
    props: { song },
    revalidate: 60 * 60
  }
}

export default SongPage
