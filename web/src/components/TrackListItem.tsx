import React from 'react'
import Link from 'next/link'
import { Play, Pause, Loader2, AudioLines } from 'lucide-react'
import {
  AuthorNames,
  ITrackRow,
  pickTrackTitle,
  pickTrackAuthor,
  toPlayable,
} from '../services/trackListingView'
import { useSettings } from '../utils/SettingsContext'
import { usePlayer } from '../utils/PlayerContext'

interface ITrackListItemProps {
  row: ITrackRow
  /** Shared author-name table (see trackListing.getTrackAuthors) — rejoined for the player credit. */
  authors: AuthorNames
  /** Show the take's artist as the secondary line instead of the composing author. */
  showArtist?: boolean
}

/**
 * One recording in the Tracks list.
 *
 * Playing happens *in place* — the row calls into the PlayerProvider, which owns a single detached
 * <audio> element, so the mini-player picks the take up without any navigation at all. The song
 * title is a next/link `<Link>` (never a bare <a href>): a real anchor would trigger a full document
 * load, tearing down the provider and killing playback mid-track (docs/screens/player.md).
 */
export const TrackListItem: React.FC<ITrackListItemProps> = ({
  row,
  authors,
  showArtist = true,
}) => {
  const { settings } = useSettings()
  const { song: playing, trackUid, status, playPlayable, togglePlayPause } = usePlayer()

  const title = pickTrackTitle(row.song, settings.listLanguage)
  const author = pickTrackAuthor(row.song, authors, settings.listLanguage)
  const secondary = showArtist ? (row.track.artist ?? author) : author

  // A take's uid is only unique within its song, so identity needs both (see trackRowKey).
  const isCurrent = playing?.uid === row.song.uid && trackUid === row.track.uid
  const isPlaying = isCurrent && status === 'playing'
  const isLoading = isCurrent && status === 'loading'

  // Re-tapping the loaded take toggles it rather than restarting from 0.
  const handlePlay = () =>
    isCurrent ? togglePlayPause() : playPlayable(toPlayable(row.song, authors), row.track.uid)

  return (
    <div
      className={`group flex h-14 w-full flex-row items-center gap-3 rounded-xl px-2.5 cursor-pointer transition-colors ${
        isCurrent ? 'bg-[var(--background-offset)]' : 'hover:bg-[var(--background-offset)]'
      }`}
      onClick={handlePlay}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          handlePlay()
        }}
        aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
        className={`flex h-9 w-9 flex-none items-center justify-center rounded-full transition-colors ${
          isCurrent
            ? 'bg-[var(--highlight)] text-[var(--on-highlight)]'
            : 'bg-[var(--neutral)]/15 text-[var(--primary)] group-hover:bg-[var(--highlight)] group-hover:text-[var(--on-highlight)]'
        }`}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={16} />
        ) : (
          <Play size={16} className="ml-0.5" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-row items-center">
          {/* Client-side nav only - a bare <a href> would reload the document and stop playback. */}
          <Link
            href={`/songs/${row.song.uid}`}
            onClick={(e) => e.stopPropagation()}
            className="mr-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-[var(--primary)] hover:underline"
            style={{ maxWidth: '70%' }}
          >
            {title}
          </Link>
          <div className="mr-auto flex flex-shrink-0 items-center rounded-xl bg-[var(--neutral)]/20 px-2.5 py-0.5">
            <span className="text-[10px] font-medium uppercase text-[var(--neutral)]">
              {row.song.uid}
            </span>
          </div>
        </div>
        <div className="flex flex-row items-center gap-1.5">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-[var(--neutral)]">
            {secondary}
          </span>
          {isPlaying && (
            <AudioLines size={12} className="flex-none text-[var(--highlight)]" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  )
}

export default TrackListItem
