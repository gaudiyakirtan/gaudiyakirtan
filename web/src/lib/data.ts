import { connectToDatabase } from './mongodb'

// Fetch all songs from MongoDB
export async function getSongs() {
  const { db } = await connectToDatabase()
  const songs = await db.collection('songs').find().toArray()
  return JSON.parse(JSON.stringify(songs))
}

// Fetch a single song by uid
export async function getSongByUid(uid: string) {
  const { db } = await connectToDatabase()
  const song = await db.collection('songs').findOne({ uid })
  return song ? JSON.parse(JSON.stringify(song)) : null
}

// Fetch a single song by id or uid
export async function getSongByIdOrUid(id: string) {
  const { db } = await connectToDatabase()
  const songs = await db.collection('songs').find().toArray()
  const song = songs.find((s: any, i: number) => s.uid === id || String(i + 1) === id)
  return song ? JSON.parse(JSON.stringify(song)) : null
}

// Fetch all authors
export async function getAuthors() {
  const { db } = await connectToDatabase()
  const authors = await db.collection('authors').find().toArray()
  return JSON.parse(JSON.stringify(authors))
}

// Fetch all books
export async function getBooks() {
  const { db } = await connectToDatabase()
  const books = await db.collection('books').find().toArray()
  return JSON.parse(JSON.stringify(books))
}

// Fetch all topics
export async function getTopics() {
  const { db } = await connectToDatabase()
  const topics = await db.collection('topics').find().toArray()
  return JSON.parse(JSON.stringify(topics))
}
