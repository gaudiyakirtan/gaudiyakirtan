import React from 'react'
import { ISongListing } from '../services/songListingView'
import { SongsSection } from './SongsSection'
import { useRecents } from '../utils/useRecents'

interface RecentlyPlayedSectionProps {
  listingsByUid: Record<string, ISongListing>
  onSongClick?: (song: ISongListing) => void
  limit?: number
}

/**
 * "Recently played" — the reader's recently-opened songs, most recent first
 * (docs/screens/home.md §2), read from localStorage.
 *
 * Rendering is delegated to SongsSection/SongListItem, the shared song-display component, so these
 * rows stay identical to every other song list in the app (title in the reader's script, uid chip,
 * author name, audio indicator). This section only decides *which* songs and in *what order*.
 *
 * Hidden entirely on first run and until localStorage has been read after mount; there is no
 * placeholder state, because an empty "Recently played" row is worse than no row.
 */
export const RecentlyPlayedSection: React.FC<RecentlyPlayedSectionProps> = ({
  listingsByUid,
  onSongClick,
  limit = 4,
}) => {
  const { recents, hydrated } = useRecents()

  if (!hydrated) return null

  // `recents` is already most-recent-first; preserve that order rather than re-sorting.
  const songs = recents
    .map((entry) => listingsByUid[entry.uid])
    .filter((l): l is ISongListing => Boolean(l))
    .slice(0, limit)

  // SongsSection renders nothing for an empty list, which is exactly the wanted first-run behavior.
  return (
    <SongsSection
      songs={songs}
      title="Recently played"
      onSongClick={onSongClick}
      gridLayout={true}
      limit={limit}
    />
  )
}
