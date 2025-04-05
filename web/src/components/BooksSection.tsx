import React from 'react'
import { IBook } from '../models/Book'
import { BookCard } from './BookCard'

interface BooksSectionProps {
  books: IBook[]
  title?: string
  onBookClick?: (book: IBook) => void
}

export const BooksSection: React.FC<BooksSectionProps> = ({ 
  books,
  title = 'Books',
  onBookClick
}) => {
  if (!books.length) return null

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gaur-primary dark:text-shyam-primary mb-4 px-4">{title}</h2>
      <div className="flex overflow-x-auto pb-4 no-scrollbar">
        <div className="pl-4"></div>
        {books.map((book, index) => (
          <BookCard
            key={`book-${index}-${book.title}`}
            book={book}
            onClick={() => onBookClick && onBookClick(book)}
          />
        ))}
        <div className="pr-4"></div>
      </div>
    </div>
  )
}