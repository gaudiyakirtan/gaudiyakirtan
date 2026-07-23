import React from 'react'
import { ISongListing, pickListTitle } from '../services/songListingView'
import { useSettings } from '../utils/SettingsContext'
import { MusicNote } from './icons/MusicNote'

interface SongCardProps {
  song: ISongListing
  onClick?: () => void
}

/**
 * Compact song card for the grid presentation (`Songs` Figma frame): title (in listLanguage) + uid
 * badge on top, author + audio note beneath. Title re-picks by the reader's listLanguage.
 */
export const SongCard: React.FC<SongCardProps> = ({ song, onClick }) => {
  const { settings } = useSettings()
  const title = pickListTitle(song, settings.listLanguage)

  return (
    <div
      className="flex flex-col justify-between h-16 px-3 py-2 rounded-lg cursor-pointer bg-[var(--background-offset)] hover:bg-[var(--background-offset)]/70 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-sm text-[var(--primary)] truncate">{title}</span>
        <span className="flex-shrink-0 rounded-lg px-1.5 py-0.5 bg-[var(--neutral)]/20 text-[var(--neutral)] text-[9px] font-medium uppercase">
          {song.uid}
        </span>
      </div>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-xs text-[var(--neutral)] truncate">{song.authorName}</span>
        {song.audioAvailable && (
          <MusicNote size={11} className="flex-none text-[var(--neutral)]" />
        )}
      </div>
    </div>
  )
}

export default SongCard
