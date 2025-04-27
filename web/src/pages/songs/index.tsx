import React, { useState, useMemo } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { IExtendedSong } from '../../models/Song'
import { SongListItem } from '../../components/SongListItem'
import { sampleSongs } from '../../data/sampleData'

interface SongsPageProps {
  songs: IExtendedSong[]
}

const SongsPage: React.FC<SongsPageProps> = ({ songs }) => {
  const router = useRouter()
  const [language] = useState('en')

  // Sort songs alphabetically by title
  const sortedSongs = useMemo(() => {
    return [...songs].sort((a, b) => {
      const titleA = a.title.find(t => t.language === language)?.title || a.title[0].title
      const titleB = b.title.find(t => t.language === language)?.title || b.title[0].title
      return titleA.localeCompare(titleB)
    })
  }, [songs, language])

  const handleSongClick = (song: IExtendedSong) => {
    router.push(`/songs/${song.id}`)
  }

  return (
    <>
      <Head>
        <title>Songs Library - Gaudiya Kirtan</title>
        <meta name="description" content="Browse the complete collection of Gaudiya Vaishnava songs" />
      </Head>

      <div className="w-full max-w-screen-lg pb-12 mx-auto">
        {/* Table Header - Only visible on tablet and larger */}
        <div className="hidden md:grid md:grid-cols-6 md:gap-4 px-4 py-3 border-b border-[var(--border)]">
          <div className="col-span-6 md:col-span-3 font-semibold text-[var(--primary)]">Title</div>
          <div className="hidden md:block md:col-span-3 font-semibold text-[var(--primary)]">Tags</div>
        </div>

        {/* Songs List */}
        <div className="px-4 space-y-3">
          {sortedSongs.map(song => (
            <SongListItem
              key={song.id}
              song={song}
              language={language}
              onClick={() => handleSongClick(song)}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  // In a real app, fetch songs from an API
  return {
    props: {
      songs: sampleSongs
    },
    revalidate: 60 * 60 // Revalidate every hour
  }
}

export default SongsPage