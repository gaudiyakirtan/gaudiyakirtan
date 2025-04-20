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

      <div className="w-full max-w-screen-lg mx-auto pb-12">
        <h1 className="text-xl font-bold mb-6 px-4 text-[var(--primary)]">Authors</h1>
        
        <div className="flex flex-wrap gap-4 px-4">
          {authors.map((author) => (
            <div 
              key={author.id} 
              className="w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] xl:w-[calc(20%-13px)]"
              style={{ minHeight: '180px' }}
            >
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