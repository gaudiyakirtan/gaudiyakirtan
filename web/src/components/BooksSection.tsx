import React from 'react'
import { ISongGroup } from '../models/Collections'
import { BookCard } from './BookCard'
import { ViewAllLink } from './ui/ViewAllLink'

interface BooksSectionProps {
  books: ISongGroup[]
  title?: string
  onBookClick?: (book: ISongGroup) => void
  className?: string
  limit?: number
  viewAllLink?: string
  /** Render as one horizontally-scrollable row instead of a wrapping grid (home). */
  singleRow?: boolean
}

export const BooksSection: React.FC<BooksSectionProps> = ({
  books,
  title = 'Books',
  onBookClick,
  className = '',
  limit,
  viewAllLink,
  singleRow = false,
}) => {
  if (!books.length) return null

  const displayBooks = limit ? books.slice(0, limit) : books

  return (
    <div className={className}>
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="text-xl font-bold text-[var(--primary)]">{title}</h2>
        {viewAllLink && <ViewAllLink href={viewAllLink} section={title} />}
      </div>

      <div
        className={
          // `pt-1 -mt-1`: room for a focused card's ring inside the y-clipping rail (see TopicsSection).
          singleRow
            ? '-mt-1 flex gap-6 overflow-x-auto px-4 pt-1 pb-2 [scrollbar-width:none]'
            : 'grid grid-cols-2 gap-6 px-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6'
        }
      >
        {displayBooks.map((book) => (
          <div key={book.uid} className={singleRow ? 'w-32 flex-none' : undefined}>
          <BookCard
            book={book}
            onClick={() => onBookClick && onBookClick(book)}
            compactSize={false}
          />
          </div>
        ))}
      </div>
    </div>
  )
}
