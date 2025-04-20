import React from 'react'
import Image from 'next/image'
import { IAuthor } from '../models/Author'

interface AuthorCardProps {
  author: IAuthor
  onClick?: () => void
  expanded?: boolean
}

export const AuthorCard: React.FC<AuthorCardProps> = ({ 
  author, 
  onClick,
  expanded = false
}) => {
  // Determine if dates are available
  const hasDates = author.birthYear || author.deathYear
  const dateText = author.birthYear && author.deathYear 
    ? `${author.birthYear} - ${author.deathYear}`
    : author.birthYear 
      ? `b. ${author.birthYear}` 
      : author.deathYear
        ? `d. ${author.deathYear}`
        : ''

  return (
    <div className="group h-full flex">
      {/* Main author card - always visible */}
      <div 
        className="flex-shrink-0 flex flex-col items-center bg-[var(--background-offset)] rounded-xl pt-4 pb-3 px-4 
                   cursor-pointer transition-all duration-300 relative z-10 w-full"
        onClick={onClick}
      >
        {/* Avatar */}
        <div className="flex items-center justify-center w-24 h-24 mb-2 overflow-hidden transition-all duration-300 rounded-full hover:shadow-md">
          {author.image ? (
            <Image
              src={author.image}
              alt={author.name}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-[var(--highlight)]/10">
              <span className="text-3xl text-[var(--neutral)]">
                {author.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Author name */}
        <p className="text-sm font-medium text-center text-[var(--primary)] mt-1 px-2 line-clamp-2 group-hover:text-[var(--highlight)]">
          {author.name}
        </p>
      </div>

      {/* Details panel that expands out to the right */}
      <div 
        className="flex-shrink-0 bg-[var(--background-offset)] rounded-r-xl border-l border-[var(--border)] 
                  flex flex-col p-4 transition-all duration-300 overflow-hidden
                  w-0 group-hover:w-48 opacity-0 group-hover:opacity-100"
      >
        {/* Birth/Death years */}
        {hasDates && (
          <p className="text-xs text-[var(--neutral)] mb-2 whitespace-nowrap">
            {dateText}
          </p>
        )}
        
        {/* Description with clamp */}
        {author.description && (
          <p className="text-xs text-[var(--primary)] line-clamp-5 whitespace-normal">
            {author.description}
          </p>
        )}
      </div>
    </div>
  )
}

export default AuthorCard