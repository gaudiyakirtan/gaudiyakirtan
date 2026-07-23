import React, { useMemo, useState } from 'react'
import { GetStaticProps } from 'next'
import { Seo } from '../../components/Seo'
import { IAuthorListing } from '../../services/authorRepository'
import { getAuthors } from '../../services'
import { pickScriptText } from '../../services/textDisplay'
import { AuthorCard } from '../../components/AuthorCard'
import { useSettings } from '../../utils/SettingsContext'
import { ScriptCode } from '../../models/Common'

interface AuthorsPageProps {
  authors: IAuthorListing[]
}

type SortField = 'name' | 'songCount'
type SortDirection = 'asc' | 'desc'

// Author names ship as list<ScriptText> just like song titles, so this list screen honors the
// reader's `listLanguage` too (docs/screens/browse.md "Titles honor listLanguage").
const displayName = (listing: IAuthorListing, listLanguage: ScriptCode) =>
  pickScriptText(listing.author.names, [listLanguage, 'Latn', 'Beng'])

const AuthorsPage: React.FC<AuthorsPageProps> = ({ authors }) => {
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const { settings } = useSettings()

  // Most prolific authors first, as a "featured" proxy.
  const featuredAuthors = useMemo(
    () => [...authors].sort((a, b) => b.songCount - a.songCount).slice(0, 5),
    [authors]
  )

  const filteredAndSortedAuthors = useMemo(() => {
    return [...authors].sort((a, b) => {
      if (sortField === 'songCount') {
        const comparison = a.songCount - b.songCount
        return sortDirection === 'asc' ? comparison : -comparison
      }
      const comparison = displayName(a, settings.listLanguage).localeCompare(
        displayName(b, settings.listLanguage)
      )
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [authors, sortField, sortDirection, settings.listLanguage])

  const handleAuthorClick = (listing: IAuthorListing) => {
    console.log('Navigate to author:', listing.author.uid)
    // router.push(`/authors/${listing.author.uid}`)
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null
    return sortDirection === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>
  }

  return (
    <>
      <Seo
        title="Authors — Gaudiya Kirtan"
        description="Browse the ācāryas and poets of the Gauḍīya Vaiṣṇava tradition — Bhaktivinoda Ṭhākura, Narottama dāsa Ṭhākura, and more — and the songs they composed."
        path="/authors"
      />

      <div className="w-full max-w-screen-lg pb-12 mx-auto">
        <div className="flex flex-wrap items-center px-4 py-4 mb-4 gap-y-2">
          <h1 className="text-xl font-bold text-[var(--primary)]">Authors</h1>
        </div>

        <div className="px-4 mb-8">
          <h2 className="mb-4 text-lg font-semibold text-[var(--primary)]">Featured Authors</h2>
          <div className="flex flex-wrap gap-4">
            {featuredAuthors.map((listing) => (
              <div key={listing.author.uid}>
                <AuthorCard listing={listing} onClick={() => handleAuthorClick(listing)} />
              </div>
            ))}
          </div>
        </div>

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
                    onClick={() => handleSort('songCount')}
                  >
                    Songs {getSortIcon('songCount')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedAuthors.map((listing) => (
                <tr
                  key={listing.author.uid}
                  className="border-b border-[var(--border)] cursor-pointer hover:bg-[var(--background-offset)] transition-colors"
                  onClick={() => handleAuthorClick(listing)}
                >
                  <td className="py-3 font-medium text-[var(--primary)]">
                    {displayName(listing, settings.listLanguage)}
                  </td>
                  <td className="py-3 text-[var(--neutral)]">{listing.songCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps<AuthorsPageProps> = async () => {
  return {
    props: {
      authors: getAuthors(),
    },
  }
}

export default AuthorsPage
