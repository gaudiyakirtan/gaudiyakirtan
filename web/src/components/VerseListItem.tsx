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
    <div className="w-full max-w-3xl mx-auto space-y-2.5 rounded-lg p-4 mb-4">
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
            className="text-sm text-center text-[var(--highlight)] font-medium"
            key={index}
          >
            {line}
          </p>
        ))}
      </div>

      {/* Word-to-word */}
      <div className="flex flex-row flex-wrap">
        <span className="inline text-sm">
          {word_to_word.map((pair, index) => (
        <React.Fragment key={index}>
          <span className="text-[var(--highlight)]">{pair[0]}</span>
          <span className="text-[var(--primary)]"> - {pair[1]}</span>
          {index < word_to_word.length - 1 && (
            <span className="text-[var(--primary)]">; </span>
          )}
        </React.Fragment>
          ))}
        </span>
      </div>

      {/* Translation */}
      <p className="text-sm font-medium text-[var(--primary)]">
        {translation}
      </p>
    </div>
  )
}

export default VerseListItem