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
      className="flex flex-col items-center mx-2 transition-transform duration-200 cursor-pointer hover:scale-105"
      onClick={onClick}
    >
      <div className="flex items-center justify-center w-24 h-24 mb-2 overflow-hidden transition-all duration-200 rounded-full bg-gaur-background-offset dark:bg-shyam-background-offset hover:shadow-md">
        {author.image ? (
          <Image
            src={author.image}
            alt={author.name}
            width={96}
            height={96}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="text-3xl text-gaur-neutral dark:text-shyam-neutral">
            {author.name.charAt(0)}
          </div>
        )}
      </div>
      <p className="text-sm text-center text-gaur-primary dark:text-shyam-primary mt-1 max-w-[96px] transition-colors duration-200 hover:text-gaur-accent dark:hover:text-shyam-accent">
        {author.name}
      </p>
    </div>
  )
}

export default AuthorCard