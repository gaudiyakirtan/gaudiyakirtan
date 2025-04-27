import React from 'react'
import { IExtendedSong } from '../models/Song'
import { SongListItem } from './SongListItem'

interface SongsSectionProps {
  songs: IExtendedSong[]
  title?: string
  language?: string
  onSongClick?: (song: IExtendedSong) => void
  gridLayout?: boolean
  limit?: number
  viewAllLink?: string
}

export const SongsSection: React.FC<SongsSectionProps> = ({ 
  songs,
  title = 'Songs',
  language = 'en',
  onSongClick,
  gridLayout = false,
  limit,
  viewAllLink
}) => {
  if (!songs.length) return null
  
  // Limit the number of songs if limit is provided
  const displaySongs = limit ? songs.slice(0, limit) : songs

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="text-xl font-bold text-[var(--primary)]">{title}</h2>
        {viewAllLink && (
          <a 
            href={viewAllLink}
            className="text-sm text-[var(--highlight)] hover:underline"
          >
            View All →
          </a>
        )}
      </div>
      
      {gridLayout ? (
        // Grid layout (2x2 on desktop, adapts to smaller screens)
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
          {displaySongs.map((song) => (
            <div 
              key={song.id} 
              className="bg-[var(--background-offset)] rounded-xl hover:bg-[var(--background-offset)]/80 transition-all duration-200"
            >
              <SongListItem
                song={song}
                language={language}
                onClick={() => onSongClick && onSongClick(song)}
              />
            </div>
          ))}
        </div>
      ) : (
        // List layout
        <div className="px-4 space-y-3">
          {displaySongs.map((song) => (
            <SongListItem
              key={song.id}
              song={song}
              language={language}
              onClick={() => onSongClick && onSongClick(song)}
            />
          ))}
        </div>
      )}
    </div>
  )
}