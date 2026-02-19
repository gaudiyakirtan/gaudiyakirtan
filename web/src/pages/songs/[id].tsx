import React from 'react'
import { useRouter } from 'next/router'
import { GetStaticProps, GetStaticPaths } from 'next'
import { IExtendedSong } from '../../models/Song'
import { SongScreen } from '../../components/SongScreen'
import Head from 'next/head'
import { sampleSongs } from '../../data/sampleData'

interface SongPageProps {
  song: IExtendedSong
}

const SongPage: React.FC<SongPageProps> = ({ song }) => {
  const userLanguage = 'en'
  const router = useRouter()

  if (router.isFallback) {
    return <div className="p-8 text-center">Loading...</div>
  }

  // If no song was found
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

  // Get the English title for the document head
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
  // Generate paths for both id and uid to support deep links
  const paths = sampleSongs.flatMap(song => [
    { params: { id: song.id.toString() } },
    { params: { id: song.uid } }
  ])

  return {
    paths,
    fallback: true
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.id

  // Find the song by id OR uid (supports deep links like /songs/N3)
  const song = sampleSongs.find(s => s.id === id || s.uid === id)

  // If no song was found, return not found
  if (!song) {
    return {
      notFound: true
    }
  }

  // Get the English title or fallback to the first available title
  const title = song.title.find(t => t.language === 'en')?.title || song.title[0].title

  return {
    props: {
      song,
      subtitle: title // Add the subtitle for the header breadcrumb
    },
    revalidate: 60 * 60 // Revalidate every hour
  }
}

export default SongPage