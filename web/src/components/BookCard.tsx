import React from 'react'
import Image from 'next/image'
import { IBook } from '../models/Book'
import { getMediaColor, isColorDark } from '../utils/colors'

interface BookCardProps {
  book: IBook
  onClick?: () => void
}

export const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
  // Generate color based on book title
  const backgroundColor = getMediaColor(book.title)
  const textColor = isColorDark(backgroundColor) ? 'text-white' : 'text-black'
  
  return (
    <div 
      className="w-36 h-48 rounded-lg overflow-hidden relative shadow-md mx-2 cursor-pointer"
      onClick={onClick}
    >
      {/* Book cover image or color */}
      <div className="w-full h-full">
        {book.image ? (
          <Image
            src={book.image}
            alt={book.title}
            width={144}
            height={192}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor }}
          >
            <span className={`text-2xl font-bold ${textColor}`}>
              {book.title.charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
      
      {/* Book info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
        <h3 className="text-sm font-medium truncate">
          {book.title}
        </h3>
        <p className="text-xs text-gray-300 truncate">
          {book.author}
        </p>
      </div>
    </div>
  )
}

export default BookCard