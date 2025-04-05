import React from 'react'
import { IExtendedSong } from '../models/Song'
import { SongListItem } from './SongListItem'

interface SongsSectionProps {
  songs: IExtendedSong[]
  title?: string
  language?: string
  onSongClick?: (song: IExtendedSong) => void
}

export const SongsSection: React.FC<SongsSectionProps> = ({ 
  songs,
  title = 'Songs',
  language = 'en',
  onSongClick
}) => {
  if (!songs.length) return null

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-primary mb-4 px-4">{title}</h2>
      <div className="px-4 space-y-3">
        {songs.map((song) => (
          <SongListItem
            key={song.id}
            song={song}
            language={language}
            onClick={() => onSongClick && onSongClick(song)}
          />
        ))}
      </div>
    </div>
  )
}