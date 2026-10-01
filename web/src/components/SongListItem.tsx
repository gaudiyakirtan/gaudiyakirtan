import Link from 'next/link'
import { ISongListing, pickListTitle, pickListAuthor } from '../services/songListingView'
import { useSettings } from '../utils/SettingsContext'
import { MusicNote } from './icons/MusicNote'

interface ISongListItemProps {
  song: ISongListing
  href?: string
  /** Optional side effect; navigation belongs to the anchor. */
  onClick?: () => void
  surface?: 'default' | 'offset'
}

export function SongListItem({ song, href = `/songs/${song.uid}`, onClick, surface = 'default' }: ISongListItemProps) {
  const { settings } = useSettings()
  const title = pickListTitle(song, settings.listLanguage)
  return (
    <Link href={href} className="song-list-item utility-target" data-surface={surface}
      onClick={(event) => {
        if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) onClick?.()
      }}>
      <span className="min-w-0 w-full">
        <span className="song-title-group">
          <span className="song-row-title">{title}</span>
          <span className="song-row-uid">{song.uid}</span>
        </span>
        <span className="song-row-credit">
          <span>{pickListAuthor(song, settings.listLanguage)}</span>
          {song.audioAvailable && <span aria-hidden="true"><MusicNote size={12} className="flex-none" /></span>}
        </span>
      </span>
    </Link>
  )
}

export default SongListItem
