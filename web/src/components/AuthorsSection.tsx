import React from 'react'
import { IAuthor } from '../models/Author'
import { AuthorCard } from './AuthorCard'

interface AuthorsSectionProps {
  authors: IAuthor[]
  title?: string
  onAuthorClick?: (author: IAuthor) => void
  className?: string
  limit?: number
  viewAllLink?: string
}

export const AuthorsSection: React.FC<AuthorsSectionProps> = ({ 
  authors,
  title = 'Authors',
  onAuthorClick,
  className = "",
  limit,
  viewAllLink
}) => {
  if (!authors.length) return null

  // Limit the number of authors if limit is provided
  const displayAuthors = limit ? authors.slice(0, limit) : authors

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
      
      <div className="flex flex-wrap gap-4 px-4">
        {displayAuthors.map((author, index) => (
          <div 
            style={{ minHeight: '180px' }}
            key={`author-${index}-${author.name}`}
          >
            <AuthorCard
              author={author}
              onClick={() => onAuthorClick && onAuthorClick(author)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}