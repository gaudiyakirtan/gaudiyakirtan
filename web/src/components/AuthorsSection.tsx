import React from 'react'
import { IAuthorListing } from '../services/authorRepository'
import { AuthorCard } from './AuthorCard'
import { ViewAllLink } from './ui/ViewAllLink'

interface AuthorsSectionProps {
  authors: IAuthorListing[]
  title?: string
  onAuthorClick?: (listing: IAuthorListing) => void
  className?: string
  limit?: number
  viewAllLink?: string
  /** Render as one horizontally-scrollable row instead of a wrapping flex (home). */
  singleRow?: boolean
}

export const AuthorsSection: React.FC<AuthorsSectionProps> = ({
  authors,
  title = 'Authors',
  onAuthorClick,
  className = '',
  limit,
  viewAllLink,
  singleRow = false,
}) => {
  if (!authors.length) return null

  const displayAuthors = limit ? authors.slice(0, limit) : authors

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
            ? '-mt-1 flex gap-4 overflow-x-auto px-4 pt-1 pb-2 [scrollbar-width:none]'
            : 'flex flex-wrap gap-4 px-4'
        }
      >
        {displayAuthors.map((listing) => (
          <div
            style={{ minHeight: '180px' }}
            key={listing.author.uid}
            className={singleRow ? 'flex-none' : undefined}
          >
            <AuthorCard listing={listing} onClick={() => onAuthorClick && onAuthorClick(listing)} />
          </div>
        ))}
      </div>
    </div>
  )
}
