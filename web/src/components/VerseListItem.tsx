import React from 'react'
import { IVerse } from '../models/Verse'
import { LanguageCode, ScriptCode } from '../models/Common'
import { RomanStandard } from '../models/Settings'
import { pickTranslation, pickWordToWord, resolveScriptLines, scriptRenderKey } from '../services/textDisplay'

interface VerseListItemProps {
  verse: IVerse
  /** Script of the source line (line 1, muted reference). Settings `displayScript`. */
  displayScript: ScriptCode
  /** Script of the transliteration line (line 2, highlighted reading). Settings
   *  `transliterationScript` — any script, not just Latin. */
  transliterationScript: ScriptCode
  /** Roman scheme used for whichever line is Latin. */
  romanStandard: RomanStandard
  /** Language for the word-to-word glossary (e.g. 'eng'). */
  wordToWordLanguage: LanguageCode
  /** Language for the full-meaning translation (e.g. 'eng'). */
  translationLanguage: LanguageCode
  showSource: boolean
  showTransliteration: boolean
  showWordToWord: boolean
  showTranslation: boolean
  /** Hidden-song display-only collapse: render only the first reading line (docs spec). */
  collapsed?: boolean
}

export const VerseListItem: React.FC<VerseListItemProps> = ({
  verse,
  displayScript,
  transliterationScript,
  romanStandard,
  wordToWordLanguage,
  translationLanguage,
  showSource,
  showTransliteration,
  showWordToWord,
  showTranslation,
  collapsed = false,
}) => {
  // Highlighted transliteration reading line (line 2) — shown when the reader wants it.
  const readingLines = showTransliteration
    ? resolveScriptLines(verse, transliterationScript, romanStandard)
    : undefined
  // Source line (line 1) rendered muted above, as reference. Shown when the reader wants it, but
  // omitted when it renders identically to a shown transliteration line (e.g. both English/IAST).
  const sameAsReading =
    scriptRenderKey(displayScript, romanStandard) === scriptRenderKey(transliterationScript, romanStandard)
  const displayScriptEntry =
    showSource && !(sameAsReading && showTransliteration)
      ? resolveScriptLines(verse, displayScript, romanStandard)
      : undefined

  const wordToWord = showWordToWord
    ? pickWordToWord(verse.wordToWords, wordToWordLanguage)
    : undefined
  const translation = showTranslation
    ? pickTranslation(verse.translations, translationLanguage)
    : undefined

  if (collapsed) {
    // Line counts are guaranteed equal, so the first reading line is a faithful stanza preview.
    const previewLine = readingLines?.[0] ?? displayScriptEntry?.[0] ?? ''
    return (
      <div className="w-full max-w-3xl mx-auto py-2 mb-1 border-b border-[var(--border)]/60">
        <p className="text-sm text-center text-[var(--highlight)] font-medium truncate">
          {previewLine}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-2.5 py-4 mb-6">
      {/* Source line (muted reference) */}
      {displayScriptEntry && (
        <div>
          {displayScriptEntry.map((line, index) => (
            <p className="text-sm text-center text-[var(--neutral)]" key={index}>
              {line}
            </p>
          ))}
        </div>
      )}

      {/* Romanized reading line (highlighted) */}
      {readingLines && (
        <div>
          {readingLines.map((line, index) => (
            <p className="text-base text-center text-[var(--highlight)] font-medium" key={index}>
              {line}
            </p>
          ))}
        </div>
      )}

      {/* Word-to-word glossary - flowing text, omitted when absent for this verse/language */}
      {wordToWord && wordToWord.words.length > 0 && (
        <p className="text-sm leading-relaxed text-left pt-1">
          {wordToWord.words.map((pair, index) => (
            <React.Fragment key={index}>
              <span className="text-[var(--highlight)]">{pair[0]}</span>
              <span className="text-[var(--primary)]"> — {pair[1]}</span>
              {index < wordToWord.words.length - 1 && (
                <span className="text-[var(--primary)]">; </span>
              )}
            </React.Fragment>
          ))}
        </p>
      )}

      {/* Full translation - omitted when absent for this verse/language */}
      {translation && translation.text.length > 0 && (
        <div className="pt-0.5">
          {translation.text.map((line, index) => (
            <p className="text-sm leading-relaxed text-left text-[var(--primary)]" key={index}>
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default VerseListItem
