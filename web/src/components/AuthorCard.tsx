import React from 'react'
import Link from 'next/link'
import { IAuthorListing } from '../services/authorRepository'
import { pickScriptText } from '../services/textDisplay'
import { useSettings } from '../utils/SettingsContext'

interface AuthorCardProps {
  listing: IAuthorListing
  onClick?: () => void
  shelf?: boolean
}

export const AuthorCard: React.FC<AuthorCardProps> = ({ listing, onClick, shelf = false }) => {
  // Author names ship as list<ScriptText> just like song titles, so browse screens honor the
  // reader's `listLanguage` here too (docs/screens/browse.md "Titles honor listLanguage").
  const { settings } = useSettings()
  const name = pickScriptText(listing.author.names, [settings.listLanguage, 'Latn', 'Beng'])

  if (shelf) return (
    <Link href={`/songs?author=${encodeURIComponent(listing.author.uid)}`} className="home-browse-card home-author-card utility-target">
      <span className="home-author-portrait" aria-hidden="true">{name.charAt(0)}</span>
      <span className="min-w-0">
        <span className="block text-sm/5 font-medium">{name}</span>
        <span className="block text-sm/5 text-[var(--tertiary)]">{listing.songCount} songs</span>
      </span>
    </Link>
  )

  return (
    <div
      className="flex flex-col items-center mx-2 transition-transform duration-200 cursor-pointer hover:scale-105"
      onClick={onClick}
    >
      {/* No author images in the shipped corpus (not part of docs/data/author.md) - always
          fall back to a letter avatar. */}
      <div className="flex items-center justify-center w-24 h-24 mb-2 overflow-hidden transition-all duration-200 rounded-full bg-[var(--background-offset)] hover:shadow-md">
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-3xl text-[var(--neutral)]">{name.charAt(0)}</span>
        </div>
      </div>
      <p className="text-sm text-center text-[var(--primary)] mt-1 max-w-[96px] transition-colors duration-200 hover:text-[var(--highlight)]">
        {name}
      </p>
    </div>
  )
}

export default AuthorCard
