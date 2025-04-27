import React from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { IAuthor } from '../../models/Author'
import { sampleAuthors } from '../../data/sampleData'
import { AuthorCard } from '../../components/AuthorCard'

interface AuthorsPageProps {
  authors: IAuthor[]
}

const AuthorsPage: React.FC<AuthorsPageProps> = ({ authors }) => {
  const router = useRouter()

  const handleAuthorClick = (author: IAuthor) => {
    // Navigate to author detail page (to be implemented)
    console.log('Navigate to author:', author.id)
    // router.push(`/authors/${author.id}`)
  }

  return (
    <>
      <Head>
        <title>Authors - Gaudiya Kirtan</title>
        <meta name="description" content="Browse Vaishnava authors and composers" />
      </Head>

      <div className="w-full max-w-screen-lg pb-12 mx-auto">
        <div className="flex flex-col justify-between px-4 mb-6 md:flex-row md:items-center">
          <h1 className="text-xl font-bold text-[var(--primary)]">Authors</h1>
          <div className="flex flex-col mt-4 space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 md:mt-0">
            <input 
              type="text" 
              placeholder="Search authors..."
              className="px-3 py-1.5 rounded-md bg-[var(--background-offset)] text-[var(--primary)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--highlight)]"
            />
            <select className="px-3 py-1.5 rounded-md bg-[var(--background-offset)] text-[var(--primary)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--highlight)]">
              <option>Sort by name</option>
              <option>Sort by popularity</option>
              <option>Sort by song count</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 px-4">
          {authors.map((author) => (
            <div key={author.id}>
              <AuthorCard
                author={author}
                onClick={() => handleAuthorClick(author)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  // Duplicate authors for testing with a larger dataset (about 30 authors)
  const duplicatedAuthors = [
    ...sampleAuthors,
    ...sampleAuthors.map(author => ({...author, id: `${author.id}-2`})),
    ...sampleAuthors.map(author => ({...author, id: `${author.id}-3`})),
    ...sampleAuthors.map(author => ({...author, id: `${author.id}-4`})),
    ...sampleAuthors.map(author => ({...author, id: `${author.id}-5`})),
    ...sampleAuthors.map(author => ({...author, id: `${author.id}-6`}))
  ];
  
  return {
    props: {
      authors: duplicatedAuthors
    },
    revalidate: 60 * 60 // Revalidate every hour
  }
}

export default AuthorsPage