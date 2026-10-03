import React from 'react'
import { IAuthorListing } from '../services/authorRepository'
import { pickScriptText } from '../services/textDisplay'
import { useSettings } from '../utils/SettingsContext'
import { BROWSE_CARD_INTERACTION } from '../utils/motion'

interface AuthorCardProps {
  listing: IAuthorListing
  onClick?: () => void
}

export const AuthorCard: React.FC<AuthorCardProps> = ({ listing, onClick }) => {
  // Author names ship as list<ScriptText> just like song titles, so browse screens honor the
  // reader's `listLanguage` here too (docs/screens/browse.md "Titles honor listLanguage").
  const { settings } = useSettings()
  const name = pickScriptText(listing.author.names, [settings.listLanguage, 'Latn', 'Beng'])

  return (
    // Native button. Hover / focus warms the avatar to a --highlight tint, lifts its initial 2px and
    // turns the name --highlight (docs/screens/home.md v5) — replacing a whole-card scale that a
    // rail clipped.
    <button
      type="button"
      className={`group/card mx-2 flex flex-col items-center rounded-xl ${BROWSE_CARD_INTERACTION}`}
      onClick={onClick}
    >
      {/* No author images in the shipped corpus (not part of docs/data/author.md) - always
          fall back to a letter avatar. */}
      <span
        data-testid="author-card-avatar"
        className="flex items-center justify-center w-24 h-24 mb-2 overflow-hidden rounded-full bg-[var(--background-offset)] transition-colors duration-200 ease-standard group-hover/card:bg-[var(--highlight)]/15 group-focus-visible/card:bg-[var(--highlight)]/15"
      >
        <span className="flex items-center justify-center w-full h-full">
          <span className="text-3xl text-[var(--neutral)] transition-[color,translate] duration-200 ease-standard group-hover/card:text-[var(--highlight)] group-focus-visible/card:text-[var(--highlight)] motion-safe:group-hover/card:-translate-y-0.5 motion-safe:group-focus-visible/card:-translate-y-0.5">
            {name.charAt(0)}
          </span>
        </span>
      </span>
      <span className="block text-sm text-center text-[var(--primary)] mt-1 max-w-[96px] transition-colors duration-200 ease-standard group-hover/card:text-[var(--highlight)] group-focus-visible/card:text-[var(--highlight)]">
        {name}
      </span>
    </button>
  )
}

export default AuthorCard
