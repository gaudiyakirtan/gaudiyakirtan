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
      <div className="p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gaur-primary dark:text-shyam-primary mb-4">Song not found</h1>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-gaur-accent dark:bg-shyam-accent text-white rounded-lg"
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

      <div className="flex items-center p-4 border-b border-gaur-border dark:border-shyam-border">
        <button 
          onClick={() => router.push('/')}
          className="text-gaur-primary dark:text-shyam-primary"
        >
          ← Back to Home
        </button>
      </div>
      
      <SongScreen song={song} language={userLanguage} />
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Get the paths we want to pre-render
  const paths = sampleSongs.map(song => ({
    params: { id: song.id.toString() }
  }))

  return {
    paths,
    fallback: true // Enable fallback for paths not generated at build time
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.id

  // Find the song with the matching ID
  const song = sampleSongs.find(s => s.id === id)

  // If no song was found, return not found
  if (!song) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      song
    },
    revalidate: 60 * 60 // Revalidate every hour
  }
}

export default SongPage