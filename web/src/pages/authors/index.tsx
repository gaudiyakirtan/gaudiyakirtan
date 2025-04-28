import React, { useState, useMemo } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { IAuthor } from '../../models/Author'
import { sampleAuthors } from '../../data/sampleData'
import { AuthorCard } from '../../components/AuthorCard'

interface AuthorsPageProps {
  authors: IAuthor[]
}

type SortField = 'name' | 'birthYear' | 'songCount'
type SortDirection = 'asc' | 'desc'

const AuthorsPage: React.FC<AuthorsPageProps> = ({ authors }) => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Filter featured authors (those with images for now - in a real app this would be a separate field)
  const featuredAuthors = useMemo(() => {
    return authors.filter(author => author.image).slice(0, 5)
  }, [authors])

  // Filter and sort authors
  const filteredAndSortedAuthors = useMemo(() => {
    // First filter by search term
    let filteredAuthors = [...authors]
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      filteredAuthors = filteredAuthors.filter(author => 
        author.name.toLowerCase().includes(lowerSearchTerm) ||
        (author.description && author.description.toLowerCase().includes(lowerSearchTerm))
      )
    }
    
    // Then sort
    return filteredAuthors.sort((a, b) => {
      let valueA: string | number = ''
      let valueB: string | number = ''
      
      switch (sortField) {
        case 'name':
          valueA = a.name
          valueB = b.name
          break
        case 'birthYear':
          valueA = a.birthYear || 0
          valueB = b.birthYear || 0
          break
        case 'songCount':
          // In a real app, this would be a field on the author
          // For now just use a random value for demo purposes
          valueA = Math.floor(Math.random() * 100)
          valueB = Math.floor(Math.random() * 100)
          break
        default:
          valueA = a.name
          valueB = b.name
      }
      
      // For string values
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const comparison = valueA.localeCompare(valueB)
        return sortDirection === 'asc' ? comparison : -comparison
      }
      
      // For number values
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        const comparison = valueA - valueB
        return sortDirection === 'asc' ? comparison : -comparison
      }
      
      return 0
    })
  }, [authors, sortField, sortDirection, searchTerm])

  const handleAuthorClick = (author: IAuthor) => {
    // Navigate to author detail page (to be implemented)
    console.log('Navigate to author:', author.id)
    // router.push(`/authors/${author.id}`)
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new field and reset direction
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null
    
    return sortDirection === 'asc' 
      ? <span className="ml-1">↑</span> 
      : <span className="ml-1">↓</span>
  }

  return (
    <>
      <Head>
        <title>Authors - Gaudiya Kirtan</title>
        <meta name="description" content="Browse Vaishnava authors and composers" />
      </Head>

      <div className="w-full max-w-screen-lg pb-12 mx-auto">
        {/* Search and filters */}
        <div className="flex flex-wrap items-center justify-between px-4 py-4 mb-4 gap-y-2">
          <h1 className="text-xl font-bold text-[var(--primary)]">Authors</h1>
          
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="text"
              placeholder="Search authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 rounded-md bg-[var(--background-offset)] text-[var(--primary)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--highlight)]"
            />
            
            <select 
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-') as [SortField, SortDirection]
                setSortField(field)
                setSortDirection(direction)
              }}
              className="px-3 py-1.5 rounded-md bg-[var(--background-offset)] text-[var(--primary)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--highlight)]"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="birthYear-asc">Birth Year (Oldest first)</option>
              <option value="birthYear-desc">Birth Year (Newest first)</option>
              <option value="songCount-desc">Popular (Most songs)</option>
              <option value="songCount-asc">Popular (Least songs)</option>
            </select>
          </div>
        </div>
        
        {/* Featured Authors */}
        <div className="px-4 mb-8">
          <h2 className="mb-4 text-lg font-semibold text-[var(--primary)]">Featured Authors</h2>
          <div className="flex flex-wrap gap-4">
            {featuredAuthors.map((author) => (
              <div key={author.id}>
                <AuthorCard
                  author={author}
                  onClick={() => handleAuthorClick(author)}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Table of All Authors */}
        <div className="px-4 overflow-x-auto">
          <h2 className="mb-4 text-lg font-semibold text-[var(--primary)]">All Authors</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-3 text-left">
                  <button 
                    className="flex items-center font-semibold text-[var(--primary)]"
                    onClick={() => handleSort('name')}
                  >
                    Name {getSortIcon('name')}
                  </button>
                </th>
                <th className="py-3 text-left">
                  <button 
                    className="flex items-center font-semibold text-[var(--primary)]"
                    onClick={() => handleSort('birthYear')}
                  >
                    Period {getSortIcon('birthYear')}
                  </button>
                </th>
                <th className="py-3 text-left hidden md:table-cell">
                  <span className="font-semibold text-[var(--primary)]">Description</span>
                </th>
                <th className="py-3 text-left">
                  <button 
                    className="flex items-center font-semibold text-[var(--primary)]"
                    onClick={() => handleSort('songCount')}
                  >
                    Songs {getSortIcon('songCount')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedAuthors.map(author => {
                // For demo purposes, assign a random song count
                // In a real app, this would be a field on the author
                const songCount = Math.floor(Math.random() * 100)
                
                return (
                  <tr 
                    key={author.id}
                    className="border-b border-[var(--border)] cursor-pointer hover:bg-[var(--background-offset)] transition-colors"
                    onClick={() => handleAuthorClick(author)}
                  >
                    <td className="py-3 font-medium text-[var(--primary)]">{author.name}</td>
                    <td className="py-3 text-[var(--neutral)]">
                      {author.birthYear && author.deathYear 
                        ? `${author.birthYear} - ${author.deathYear}` 
                        : author.birthYear 
                          ? `b. ${author.birthYear}`
                          : ''}
                    </td>
                    <td className="hidden py-3 text-[var(--neutral)] md:table-cell">
                      <div className="line-clamp-1">
                        {author.description || 'No description available'}
                      </div>
                    </td>
                    <td className="py-3 text-[var(--neutral)]">{songCount}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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