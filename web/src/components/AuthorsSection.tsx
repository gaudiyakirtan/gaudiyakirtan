import React from 'react'
import { IAuthor } from '../models/Author'
import { AuthorCard } from './AuthorCard'

interface AuthorsSectionProps {
  authors: IAuthor[]
  title?: string
  onAuthorClick?: (author: IAuthor) => void
}

export const AuthorsSection: React.FC<AuthorsSectionProps> = ({ 
  authors,
  title = 'Authors',
  onAuthorClick
}) => {
  if (!authors.length) return null

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gaur-primary dark:text-shyam-primary mb-4 px-4">{title}</h2>
      <div className="flex overflow-x-auto pb-4 no-scrollbar">
        <div className="pl-4"></div>
        {authors.map((author, index) => (
          <AuthorCard
            key={`author-${index}-${author.name}`}
            author={author}
            onClick={() => onAuthorClick && onAuthorClick(author)}
          />
        ))}
        <div className="pr-4"></div>
      </div>
    </div>
  )
}