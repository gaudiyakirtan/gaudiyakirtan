import React from 'react'
import Link from 'next/link'
import { ISongListing } from '../services/songListingView'
import { SongListItem } from './SongListItem'

interface SongsSectionProps {
  songs: ISongListing[]
  title?: string
  onSongClick?: (song: ISongListing) => void
  gridLayout?: boolean
  limit?: number
  viewAllLink?: string
}

export const SongsSection: React.FC<SongsSectionProps> = ({
  songs,
  title = 'Songs',
  onSongClick,
  gridLayout = false,
  limit,
  viewAllLink,
}) => {
  if (!songs.length) return null

  const displaySongs = limit ? songs.slice(0, limit) : songs

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="text-xl font-bold text-[var(--primary)]">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-sm text-[var(--highlight)] hover:underline">
            View All →
          </Link>
        )}
      </div>

      {gridLayout ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
          {displaySongs.map((song) => (
            <div
              key={song.uid}
              className="bg-[var(--background-offset)] rounded-xl transition-colors duration-200"
            >
              {/* The card is already an offset surface, so the row's default offset hover would
                  be invisible on it - flip the row to the `offset` variant. */}
              <SongListItem
                song={song}
                surface="offset"
                onClick={() => onSongClick && onSongClick(song)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {displaySongs.map((song) => (
            <SongListItem
              key={song.uid}
              song={song}
              onClick={() => onSongClick && onSongClick(song)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
