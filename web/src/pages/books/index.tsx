import React from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { IBook } from '../../models/Book'
import { sampleBooks } from '../../data/sampleData'
import { BooksSection } from '../../components/BooksSection'

interface BooksPageProps {
  books: IBook[]
}

const BooksPage: React.FC<BooksPageProps> = ({ books }) => {
  const router = useRouter()

  const handleBookClick = (book: IBook) => {
    // Navigate to book detail page (to be implemented)
    console.log('Navigate to book:', book.id)
    // router.push(`/books/${book.id}`)
  }

  return (
    <>
      <Head>
        <title>Books - Gaudiya Kirtan</title>
        <meta name="description" content="Browse books containing Vaishnava songs and bhajans" />
      </Head>

      <div className="w-full max-w-screen-lg mx-auto pb-12">
        <BooksSection 
          books={books}
          title="Books"
          onBookClick={handleBookClick}
          gridLayout={true}
        />
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  // In a real app, fetch books from an API
  return {
    props: {
      books: sampleBooks
    },
    revalidate: 60 * 60 // Revalidate every hour
  }
}

export default BooksPage