import React from 'react'
import { IVerse } from '../models/Song'

interface VerseListItemProps {
  verse: IVerse
  userLanguage?: string
  fontSize?: number
  showOriginal?: boolean
  showTransliteration?: boolean
  showWordToWord?: boolean
  showTranslation?: boolean
}

export const VerseListItem: React.FC<VerseListItemProps> = ({
  verse,
  userLanguage = 'en',
  fontSize = 14,
  showOriginal = true,
  showTransliteration = true,
  showWordToWord = true,
  showTranslation = true
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
    <div className="w-full max-w-3xl mx-auto space-y-2.5 rounded-lg py-4 mb-4">
      {/* Original script language */}
      {showOriginal && original.length > 0 && (
        <div>
          {original.map((line, index) => (
            <p
              className="text-center text-[var(--neutral)]"
              style={{ fontSize: `${fontSize}px` }}
              key={index}
            >
              {line}
            </p>
          ))}
        </div>
      )}

      {/* User language script */}
      {showTransliteration && transliteration.length > 0 && (
        <div>
          {transliteration.map((line, index) => (
            <p
              className="text-center text-[var(--highlight)] font-medium"
              style={{ fontSize: `${fontSize}px` }}
              key={index}
            >
              {line}
            </p>
          ))}
        </div>
      )}

      {/* Word-to-word */}
      {showWordToWord && word_to_word.length > 0 && (
        <div className="flex flex-row flex-wrap">
          <span style={{ fontSize: `${fontSize}px` }}>
            {word_to_word.map((pair, index) => (
          <React.Fragment key={index}>
            <span className="text-[var(--highlight)]">{pair[0]}</span>
            <span className="text-[var(--primary)]"> {'\u2014'} {pair[1]}</span>
            {index < word_to_word.length - 1 && (
              <span className="text-[var(--primary)]">; </span>
            )}
          </React.Fragment>
            ))}
          </span>
        </div>
      )}

      {/* Translation */}
      {showTranslation && translation && (
        <p
          className="font-bold text-[var(--primary)]"
          style={{ fontSize: `${fontSize + 1}px` }}
        >
          {translation}
        </p>
      )}
    </div>
  )
}

export default VerseListItem
