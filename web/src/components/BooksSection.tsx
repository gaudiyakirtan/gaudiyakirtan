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
}

export const BooksSection: React.FC<BooksSectionProps> = ({ 
  books,
  title = 'Books',
  onBookClick,
  className = "",
  limit,
  viewAllLink,
}) => {
  if (!books.length) return null

  // Limit the number of books if limit is provided
  const displayBooks = limit ? books.slice(0, limit) : books;

  return (
    <div className={className}>
      <div className="flex items-center justify-between px-4 mb-4">
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

      <div className="grid grid-cols-2 gap-6 px-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6">
        {displayBooks.map((book, index) => (
          <BookCard
            key={`book-${index}-${book.title}`}
            book={book}
            onClick={() => onBookClick && onBookClick(book)}
            compactSize={false}
          />
        ))}
      </div>
    </div>
  );
}