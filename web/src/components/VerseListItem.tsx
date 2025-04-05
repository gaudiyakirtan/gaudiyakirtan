import React from 'react'
import { IVerse } from '../models/Song'

interface VerseListItemProps {
  verse: IVerse
  userLanguage?: string
}

export const VerseListItem: React.FC<VerseListItemProps> = ({ 
  verse, 
  userLanguage = 'en' 
}) => {
  const {
    original,
    transliterations,
    word_to_words,
    translations
  } = verse

  const transliteration = transliterations.find(
    (transliteration) => transliteration.language === userLanguage
  )?.text || []

  const translation = translations.find(
    (translation) => translation.language === userLanguage
  )?.text || ''

  const word_to_word = word_to_words.find(
    (word_to_word) => word_to_word.language === userLanguage
  )?.words || []

  return (
    <div className="w-full max-w-3xl mx-auto space-y-2.5 rounded-lg p-4 shadow-sm mb-4 bg-[var(--background-offset)]">
      {/* Original script language */}
      <div>
        {original.map((line, index) => (
          <p
            className="text-sm text-center text-[var(--neutral)]"
            key={index}
          >
            {line}
          </p>
        ))}
      </div>

      {/* User language script */}
      <div>
        {transliteration.map((line, index) => (
          <p
            className="text-sm text-center text-[var(--primary)] font-medium"
            key={index}
          >
            {line}
          </p>
        ))}
      </div>

      {/* Word-to-word */}
      <div className="flex flex-row flex-wrap justify-center">
        {word_to_word.map((pair, index) => (
          <React.Fragment key={index}>
            <span className="text-sm text-[var(--primary)]">
              {pair[0]}
              <span className="text-sm text-[var(--neutral)]">
                {' '}
                -{' '}
              </span>
            </span>
            <span className="text-sm text-[var(--neutral)]">
              {pair[1]}
              {index < word_to_word.length - 1 ? '; ' : ''}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Translation */}
      <p className="text-sm font-medium text-[var(--primary)] text-center">
        {translation}
      </p>
    </div>
  )
}

export default VerseListItem