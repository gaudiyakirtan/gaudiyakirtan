import React, { useState, useMemo } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { IExtendedSong } from '../../models/Song'
import { SongListItem } from '../../components/SongListItem'
import { getSongs } from '../../lib/data'
import { MusicNote } from '../../components/icons/MusicNote'

interface SongsPageProps {
  songs: IExtendedSong[]
}

type SortField = 'title' | 'author' | 'uid' | 'language' | 'audio'
type SortDirection = 'asc' | 'desc'

const SongsPage: React.FC<SongsPageProps> = ({ songs }) => {
  const router = useRouter()
  const [language, setLanguage] = useState('en')
  const [sortField, setSortField] = useState<SortField>('title')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [searchTerm, setSearchTerm] = useState('')

  // Get available languages from songs
  const availableLanguages = useMemo(() => {
    const languages = new Set<string>()
    songs.forEach(song => {
      song.title.forEach(title => languages.add(title.language))
    })
    return Array.from(languages)
  }, [songs])

  // Filter and sort songs
  const filteredAndSortedSongs = useMemo(() => {
    // First filter by search term
    let filteredSongs = [...songs]
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      filteredSongs = filteredSongs.filter(song => {
        const title = song.title.find(t => t.language === language)?.title || song.title[0].title
        const author = song.author?.find(a => a.language === language)?.author || (song.author && song.author.length > 0 ? song.author[0].author : '')
        const tags = song.tags.join(' ')
        
        return (
          title.toLowerCase().includes(lowerSearchTerm) ||
          author.toLowerCase().includes(lowerSearchTerm) ||
          song.uid.toLowerCase().includes(lowerSearchTerm) ||
          tags.toLowerCase().includes(lowerSearchTerm)
        )
      })
    }
    
    // Then sort
    return filteredSongs.sort((a, b) => {
      let valueA: string | boolean = ''
      let valueB: string | boolean = ''
      
      switch (sortField) {
        case 'title':
          valueA = a.title.find(t => t.language === language)?.title || a.title[0].title
          valueB = b.title.find(t => t.language === language)?.title || b.title[0].title
          break
        case 'author':
          valueA = a.author?.find(a => a.language === language)?.author || (a.author && a.author.length > 0 ? a.author[0].author : '')
          valueB = b.author?.find(a => a.language === language)?.author || (b.author && b.author.length > 0 ? b.author[0].author : '')
          break
        case 'uid':
          valueA = a.uid
          valueB = b.uid
          break
        case 'audio':
          valueA = a.audio || false
          valueB = b.audio || false
          break
        default:
          valueA = a.title.find(t => t.language === language)?.title || a.title[0].title
          valueB = b.title.find(t => t.language === language)?.title || b.title[0].title
      }
      
      // For string values
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const comparison = valueA.localeCompare(valueB)
        return sortDirection === 'asc' ? comparison : -comparison
      }
      
      // For boolean values
      if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
        const comparison = valueA === valueB ? 0 : valueA ? -1 : 1
        return sortDirection === 'asc' ? comparison : -comparison
      }
      
      return 0
    })
  }, [songs, sortField, sortDirection, language, searchTerm])

  const handleSongClick = (song: IExtendedSong) => {
    router.push(`/songs/${song.id}`)
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new field and reset direction
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null
    
    return sortDirection === 'asc' 
      ? <span className="ml-1">↑</span> 
      : <span className="ml-1">↓</span>
  }

  return (
    <>
      <Head>
        <title>Songs Library - Gaudiya Kirtan</title>
        <meta name="description" content="Browse the complete collection of Gaudiya Vaishnava songs" />
      </Head>

      <div className="w-full max-w-screen-lg pb-12 mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center px-4 py-4 mb-4 gap-y-2">
          <h1 className="text-xl font-bold text-[var(--primary)]">Songs</h1>
        </div>

        {/* Table view */}
        <div className="px-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-3 text-left">
                  <button 
                    className="flex items-center font-semibold text-[var(--primary)]"
                    onClick={() => handleSort('title')}
                  >
                    Title {getSortIcon('title')}
                  </button>
                </th>
                <th className="py-3 text-left">
                  <button 
                    className="flex items-center font-semibold text-[var(--primary)]"
                    onClick={() => handleSort('author')}
                  >
                    Author {getSortIcon('author')}
                  </button>
                </th>
                <th className="py-3 text-left">
                  <button 
                    className="flex items-center font-semibold text-[var(--primary)]"
                    onClick={() => handleSort('uid')}
                  >
                    Song Code {getSortIcon('uid')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedSongs.map(song => {
                const displayTitle = song.title.find(t => t.language === language)?.title || song.title[0].title
                const displayAuthor = song.author?.find(a => a.language === language)?.author || 
                  (song.author && song.author.length > 0 ? song.author[0].author : 'Unknown')
                
                return (
                  <tr 
                    key={song.id}
                    className="border-b border-[var(--border)] cursor-pointer hover:bg-[var(--background-offset)] transition-colors"
                    onClick={() => handleSongClick(song)}
                  >
                    <td className="py-3 font-medium text-[var(--primary)]">{displayTitle}</td>
                    <td className="py-3 text-[var(--neutral)]">{displayAuthor}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md text-xs bg-[var(--neutral)]/20 text-[var(--neutral)]">
                        {song.uid}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const dbSongs = await getSongs()
  const songs = dbSongs.map((song: any, index: number) => ({
    id: String(index + 1),
    title: [{ title: song.title, language: 'en' }],
    author: [{ author: song.author || 'Unknown', language: 'en' }],
    uid: song.uid,
    tags: song.tags || [],
    topics: (song.topics || []).map((t: string) => ({ topic: t, language: 'en' })),
    audio: song.audio || false,
    verses: (song.verses || []).map((v: any) => ({ ...v, word_to_words: v.wordToWords || [] })),
    tracks: song.tracks || [],
  }))
  return {
    props: { songs },
    revalidate: 60 * 60
  }
}

export default SongsPage