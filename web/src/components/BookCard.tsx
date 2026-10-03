import React, { useState } from 'react'
import { ISongGroup } from '../models/Collections'
import { getMediaColor } from '../utils/colors'
import { pickScriptText } from '../services/textDisplay'
import { useSettings } from '../utils/SettingsContext'
import { BROWSE_CARD_INTERACTION } from '../utils/motion'

interface BookCardProps {
  book: ISongGroup
  onClick?: () => void
  className?: string
  compactSize?: boolean
}

/**
 * Book card — the original dual-gradient treatment: the cover image (public/covers/<uid>.jpg) under
 * an accent-colour gradient (the book's own colour fading up) plus a black readability gradient, with
 * the title + song-count over it. The accent gradient ties every cover to its colour and keeps the
 * title legible; it also *is* the look on the color-accent fallback when a book has no cover.
 */
export const BookCard: React.FC<BookCardProps> = ({
  book,
  onClick,
  className = '',
  compactSize = false,
}) => {
  const { settings } = useSettings()
  // Title in the reader's List-language (matching song titles/authors); the color seed stays on the
  // fixed Latin title so a book's accent never shifts when the language changes.
  const title = pickScriptText(book.titles, [settings.listLanguage, 'Latn', 'Beng'])
  const backgroundColor = book.color || getMediaColor(pickScriptText(book.titles, ['Latn', 'Beng']))
  const [coverFailed, setCoverFailed] = useState(false)

  const sizeClasses = compactSize ? 'w-36 h-48 mx-2 shrink-0' : 'aspect-[2/3] w-full'

  return (
    // Native button. Hover / focus is a glance into the book (docs/screens/home.md v5): the cover
    // zooms inside the card's own clip and the title lifts 2px, so the card's box never grows into a
    // rail's clip. The title is text, so the cover is decorative (`alt=""`) rather than read twice.
    <button
      type="button"
      className={`group/card relative block overflow-hidden rounded-lg shadow-md ${BROWSE_CARD_INTERACTION} ${sizeClasses} ${className}`}
      onClick={onClick}
    >
      {/* Cover image (or accent-colour base as the fallback). */}
      <span className="block h-full w-full" style={{ backgroundColor }}>
        {!coverFailed && (
          // eslint-disable-next-line @next/next/no-img-element -- bundled cover under /public/covers
          <img
            src={`/covers/${book.uid}.jpg`}
            alt=""
            data-testid="book-card-cover"
            className="h-full w-full object-cover object-center transition-transform duration-300 ease-standard motion-safe:group-hover/card:scale-105 motion-safe:group-focus-visible/card:scale-105"
            onError={() => setCoverFailed(true)}
          />
        )}
      </span>

      {/* Accent-colour gradient — the book's own colour fading up from the bottom. */}
      <span
        className="absolute inset-0"
        style={{ backgroundImage: `linear-gradient(to top, ${backgroundColor}, ${backgroundColor}00)` }}
      />
      {/* Black readability gradient. */}
      <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

      {/* Song-count badge. */}
      {book.songUids.length > 0 && (
        <span className="absolute top-0 right-0 p-3">
          <span
            className="rounded-full px-2.5 py-1 text-xs text-white backdrop-blur-sm"
            style={{ backgroundColor }}
          >
            {book.songUids.length} songs
          </span>
        </span>
      )}

      {/* Title at the bottom. */}
      <span className="absolute bottom-0 left-0 right-0">
        <span className="relative z-10 block p-3 pb-3 transition-transform duration-200 ease-standard motion-safe:group-hover/card:-translate-y-0.5 motion-safe:group-focus-visible/card:-translate-y-0.5">
          <span className="block text-base font-bold leading-tight text-white line-clamp-2">{title}</span>
        </span>
      </span>
    </button>
  )
}

export default BookCard
