import React from 'react'
import Image from 'next/image'
import { IAuthor } from '../models/Author'

interface AuthorCardProps {
  author: IAuthor
  onClick?: () => void
}

export const AuthorCard: React.FC<AuthorCardProps> = ({ author, onClick }) => {
  return (
    <div 
      className="flex flex-col items-center mx-2 cursor-pointer" 
      onClick={onClick}
    >
      <div className="w-24 h-24 rounded-full overflow-hidden mb-2 bg-gaur-background-offset dark:bg-shyam-background-offset flex items-center justify-center">
        {author.image ? (
          <Image
            src={author.image}
            alt={author.name}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-3xl text-gaur-neutral dark:text-shyam-neutral">
            {author.name.charAt(0)}
          </div>
        )}
      </div>
      <p className="text-sm text-center text-gaur-primary dark:text-shyam-primary mt-1 max-w-[96px] truncate">
        {author.name}
      </p>
    </div>
  )
}

export default AuthorCard