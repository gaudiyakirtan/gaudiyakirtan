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

  // A native button (navigation stays the caller's callback), so the row is focusable and opens on
  // Enter/Space. Feedback per docs/screens/home.md v5: the surface tints on hover *and* keyboard
  // focus, the text block travels 4px toward the trailing edge ("opens forward"), and a press tints
  // in --highlight. The travel is on the inner block, never the row, so row geometry never changes;
  // `motion-safe:` drops it for reduced motion while the tint and ring remain.
  return (
    <button
      type="button"
      data-testid="song-list-item"
      className={`group/row flex h-14 w-full cursor-pointer flex-row items-center rounded-xl px-2.5 text-left transition-colors duration-200 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--highlight)] active:bg-[var(--highlight)]/10 ${
        surface === 'offset'
          ? 'hover:bg-[var(--background)] focus-visible:bg-[var(--background)]'
          : 'hover:bg-[var(--background-offset)] focus-visible:bg-[var(--background-offset)]'
      }`}
      onClick={onClick}
    >
      <span
        data-testid="song-list-item-content"
        className="block min-w-0 flex-1 transition-transform duration-200 ease-standard group-active/row:duration-100 motion-safe:group-hover/row:translate-x-1 motion-safe:group-focus-visible/row:translate-x-1 motion-safe:group-active/row:translate-x-0.5"
      >
        <span className="flex flex-row items-center w-full">
          <span
            className="mr-1.5 text-sm text-[var(--primary)] whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ maxWidth: '70%' }}
          >
            {title}
          </span>
          <span className="flex-shrink-0 rounded-xl px-2.5 py-0.5 bg-[var(--neutral)]/20 mr-auto flex items-center">
            <span className="text-[var(--neutral)] text-[10px] font-medium uppercase">
              {song.uid}
            </span>
          </span>
        </span>
        <span className="flex flex-row items-center">
          <span
            className="text-sm text-[var(--neutral)] mr-1.5 whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ maxWidth: '85%' }}
          >
            {pickListAuthor(song, settings.listLanguage)}
          </span>
          {song.audioAvailable && (
            <MusicNote size={12} className="flex-none text-[var(--neutral)]" />
          )}
        </span>
      </span>
    </button>
  )
}

export default SongListItem
