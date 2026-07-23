import React from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ISongGroup } from '../../models/Collections'
import { getSongGroups } from '../../services'
import { BooksSection } from '../../components/BooksSection'
import { EmptyState } from '../../components/ui/EmptyState'
import { BooksIcon } from '../../components/icons/SidebarIcons'

interface BooksPageProps {
  books: ISongGroup[]
}

const BooksPage: React.FC<BooksPageProps> = ({ books }) => {
  const router = useRouter()
  const handleBookClick = (book: ISongGroup) => {
    router.push(`/books/${book.uid}`)
  }

  return (
    <>
      <Head>
        <title>Books - Gaudiya Kirtan</title>
        <meta name="description" content="Browse books containing Vaishnava songs and bhajans" />
      </Head>

      <div className="w-full max-w-screen-lg mx-auto pb-12">
        {books.length > 0 ? (
          <BooksSection books={books} title="Books" onBookClick={handleBookClick} />
        ) : (
          <>
            <div className="px-4 py-4">
              <h1 className="text-xl font-bold text-[var(--primary)]">Books</h1>
            </div>
            {/* No book groupings ship in the corpus yet (docs/data/collections.md) - a tasteful
                empty state, never fabricated rows (docs/screens/browse.md). This lights up
                automatically once song_groups.json ships book entries. */}
            <EmptyState
              icon={<BooksIcon />}
              title="No books yet"
              message="Published songbooks will appear here once the corpus ships book groupings."
            />
          </>
        )}
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps<BooksPageProps> = async () => {
  // No book groupings are shipped in the corpus yet - see services/songGroupRepository.ts.
  return {
    props: {
      books: getSongGroups('book'),
    },
  }
}

export default BooksPage
