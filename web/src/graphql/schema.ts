export const typeDefs = `#graphql
  type Query {
    songs(limit: Int, offset: Int): [Song!]!
    song(uid: String!): Song
    authors: [Author!]!
    author(uid: String!): Author
    books: [Book!]!
    book(uid: String!): Book
    topics: [Topic!]!
    topic(uid: String!): Topic
    singers: [Singer!]!
    singer(uid: String!): Singer
  }

  type Song {
    uid: String!
    title: String!
    author: String
    audio: Boolean
    tags: [String!]!
    topics: [String!]!
    verses: [Verse!]!
    tracks: [String!]!
  }

  type Verse {
    index: Int!
    language: String
    original: [String!]!
    transliterations: [Transliteration!]!
    wordToWords: [WordToWord!]!
    translations: [Translation!]!
  }

  type Transliteration {
    language: String!
    text: [String!]!
  }

  type WordToWord {
    language: String!
    words: [[String!]!]!
  }

  type Translation {
    language: String!
    text: String!
  }

  type Author {
    uid: String!
    name: String!
    slug: String!
    image: String
    songs: [String!]!
    books: [String!]!
  }

  type Book {
    uid: String!
    title: String!
    author: String
    slug: String!
    image: String
    songs: JSON
  }

  type Topic {
    uid: String!
    topic: String!
    slug: String!
    songs: [String!]!
  }

  type Singer {
    uid: String!
    name: String!
    slug: String!
    image: String
    songs: [String!]!
  }

  type Track {
    uid: String!
    singer_uid: String!
    song_uid: String!
    audio: String!
  }

  scalar JSON
`
