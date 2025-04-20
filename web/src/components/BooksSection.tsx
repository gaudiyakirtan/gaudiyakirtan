import React from 'react'
import { IBook } from '../models/Book'
import { BookCard } from './BookCard'

interface BooksSectionProps {
  books: IBook[]
  title?: string
  onBookClick?: (book: IBook) => void
  className?: string
  limit?: number
  viewAllLink?: string
  gridLayout?: boolean
}

export const BooksSection: React.FC<BooksSectionProps> = ({ 
  books,
  title = 'Books',
  onBookClick,
  className = "",
  limit,
  viewAllLink,
  gridLayout = false
}) => {
  if (!books.length) return null

  // Limit the number of books if limit is provided
  const displayBooks = limit ? books.slice(0, limit) : books

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4 px-4">
        <h2 className="text-xl font-bold text-[var(--primary)]">{title}</h2>
        {viewAllLink && (
          <a 
            href={viewAllLink}
            className="text-sm text-[var(--highlight)] hover:underline"
          >
            View All →
          </a>
        )}
      </div>
      
      {gridLayout ? (
        // Grid layout
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 px-4">
          {displayBooks.map((book, index) => (
            <BookCard
              key={`book-${index}-${book.title}`}
              book={book}
              onClick={() => onBookClick && onBookClick(book)}
              compactSize={false}
            />
          ))}
        </div>
      ) : (
        // Horizontal scroll layout
        <div className="flex pt-1 pb-4 overflow-x-auto no-scrollbar">
          <div className="pl-4"></div>
          {displayBooks.map((book, index) => (
            <BookCard
              key={`book-${index}-${book.title}`}
              book={book}
              onClick={() => onBookClick && onBookClick(book)}
              compactSize={true}
            />
          ))}
          <div className="pr-4"></div>
        </div>
      )}
    </div>
  )
}