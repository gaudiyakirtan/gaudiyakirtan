export interface ISong {
  id: string
  title: string
  author: string
  lyrics: string
  tags: string[]
  dateAdded: Date
  audio?: boolean
}

// Extended song model for multilingual support
export interface IExtendedSong {
  id: string
  title: ITitle[]
  author?: IAuthor[]
  uid: string
  tags: string[]
  topics?: ITopic[]
  audio?: boolean
  verses?: IVerse[]
  tracks?: string[]
}

export interface ITitle {
  title: string
  language: string
}

export interface IAuthor {
  author: string
  language: string
}

export interface ITopic {
  topic: string
  language: string
}

export interface IVerse {
  language?: string
  original: string[]
  transliterations: ITransliteration[]
  word_to_words: IWordToWord[]
  translations: ITranslation[]
}

export interface ITransliteration {
  language: string
  text: string[]
}

export interface IWordToWord {
  language: string
  words: string[][]
}

export interface ITranslation {
  language: string
  text: string
}