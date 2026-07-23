import React, { useState } from 'react'
import { ISongGroup } from '../models/Collections'
import { getMediaColor } from '../utils/colors'
import { pickScriptText } from '../services/textDisplay'
import { useSettings } from '../utils/SettingsContext'

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
    <div
      className={`relative overflow-hidden transition-all duration-300 cursor-pointer hover:scale-103 rounded-lg shadow-md ${sizeClasses} ${className}`}
      onClick={onClick}
    >
      {/* Cover image (or accent-colour base as the fallback). */}
      <div className="h-full w-full" style={{ backgroundColor }}>
        {!coverFailed && (
          // eslint-disable-next-line @next/next/no-img-element -- bundled cover under /public/covers
          <img
            src={`/covers/${book.uid}.jpg`}
            alt={title}
            className="h-full w-full object-cover object-center"
            onError={() => setCoverFailed(true)}
          />
        )}
      </div>

      {/* Accent-colour gradient — the book's own colour fading up from the bottom. */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `linear-gradient(to top, ${backgroundColor}, ${backgroundColor}00)` }}
      />
      {/* Black readability gradient. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

      {/* Song-count badge. */}
      {book.songUids.length > 0 && (
        <div className="absolute top-0 right-0 p-3">
          <span
            className="rounded-full px-2.5 py-1 text-xs text-white backdrop-blur-sm"
            style={{ backgroundColor }}
          >
            {book.songUids.length} songs
          </span>
        </div>
      )}

      {/* Title at the bottom. */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="relative z-10 p-3 pb-3">
          <h3 className="text-base font-bold leading-tight text-white line-clamp-2">{title}</h3>
        </div>
      </div>
    </div>
  )
}

export default BookCard
