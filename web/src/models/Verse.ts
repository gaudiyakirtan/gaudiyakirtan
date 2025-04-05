export interface ITranslation {
  language: string
  text: string
}

export interface ITransliteration {
  language: string
  text: string
}

export interface IWordToWordTranslation {
  language: string
  translations: { [key: string]: string }
}

export interface IVerse {
  id?: string
  originalText: string
  translations: ITranslation[]
  transliterations: ITransliteration[]
  wordToWordTranslations: IWordToWordTranslation[]
}

// Helper functions for language selection
export function getTransliteration(verse: IVerse, language = 'english'): string | null {
  const transliteration = verse.transliterations.find(t => t.language.toLowerCase() === language.toLowerCase())
  return transliteration?.text || null
}

export function getTranslation(verse: IVerse, language = 'english'): string | null {
  const translation = verse.translations.find(t => t.language.toLowerCase() === language.toLowerCase())
  return translation?.text || null
}

export function getWordToWordTranslation(verse: IVerse, language = 'english'): { [key: string]: string } | null {
  const wtw = verse.wordToWordTranslations.find(t => t.language.toLowerCase() === language.toLowerCase())
  return wtw?.translations || null
}

// Default language preferences
export const DEFAULT_LANGUAGE = 'english'
export const AVAILABLE_LANGUAGES = ['english', 'hindi', 'bengali']