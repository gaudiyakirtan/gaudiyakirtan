import React from 'react'
import { ISongListing, pickListTitle, pickListAuthor } from '../services/songListingView'
import { useSettings } from '../utils/SettingsContext'
import { MusicNote } from './icons/MusicNote'

interface ISongListItemProps {
  song: ISongListing
  onClick?: () => void
  /**
   * Which surface the row sits on, so the hover state is actually visible.
   *
   * The default hover tint is `--background-offset`, which is invisible when the row is placed
   * *on* an offset surface (home's month card). Pass `offset` there and the hover flips to
   * `--background` instead.
   */
  surface?: 'default' | 'offset'
}

export const SongListItem: React.FC<ISongListItemProps> = ({
  song,
  onClick,
  surface = 'default',
}) => {
  const { settings } = useSettings()
  const title = pickListTitle(song, settings.listLanguage)

  return (
    <div
      className={`flex h-14 w-full flex-row items-center rounded-xl px-2.5 cursor-pointer transition-colors ${
        surface === 'offset'
          ? 'hover:bg-[var(--background)]'
          : 'hover:bg-[var(--background-offset)]'
      }`}
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-row items-center w-full">
          <span
            className="mr-1.5 text-sm text-[var(--primary)] whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ maxWidth: '70%' }}
          >
            {title}
          </span>
          <div className="flex-shrink-0 rounded-xl px-2.5 py-0.5 bg-[var(--neutral)]/20 mr-auto flex items-center">
            <span className="text-[var(--neutral)] text-[10px] font-medium uppercase">
              {song.uid}
            </span>
          </div>
        </div>
        <div className="flex flex-row items-center">
          <span
            className="text-sm text-[var(--neutral)] mr-1.5 whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ maxWidth: '85%' }}
          >
            {pickListAuthor(song, settings.listLanguage)}
          </span>
          {song.audioAvailable && (
            <MusicNote size={12} className="flex-none text-[var(--neutral)]" />
          )}
        </div>
      </div>
    </div>
  )
}

export default SongListItem
