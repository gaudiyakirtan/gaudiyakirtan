/**
 * Export MongoDB data to bundled JSON for mobile apps.
 *
 * Usage: MONGODB_URI="mongodb+srv://..." bun run scripts/export-mobile-data.ts
 *
 * Outputs:
 *   - ../ios/gk-ios/songs.json
 *   - ../andorid/app/src/main/assets/songs.json
 */
import { MongoClient } from 'mongodb'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gaudiyakirtan'

async function exportData() {
  console.log('Connecting to MongoDB...')
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db('gaudiyakirtan')

  console.log('Fetching data...')
  const songs = await db.collection('songs').find().toArray()
  const authors = await db.collection('authors').find().toArray()
  const topics = await db.collection('topics').find().toArray()
  const books = await db.collection('books').find().toArray()

  // Clean MongoDB-specific fields
  const cleanDocs = (docs: any[]) => docs.map(({ _id, ...rest }) => rest)

  const exportData = {
    songs: cleanDocs(songs),
    authors: cleanDocs(authors),
    topics: cleanDocs(topics),
    books: cleanDocs(books),
  }

  const json = JSON.stringify(exportData, null, 2)

  // Write to iOS bundle
  const iosPath = resolve(__dirname, '../../ios/gk-ios/songs.json')
  writeFileSync(iosPath, json)
  console.log(`  Wrote ${iosPath} (${songs.length} songs)`)

  // Write to Android assets
  const androidPath = resolve(__dirname, '../../andorid/app/src/main/assets/songs.json')
  writeFileSync(androidPath, json)
  console.log(`  Wrote ${androidPath} (${songs.length} songs)`)

  console.log('Export complete!')
  await client.close()
}

exportData().catch(console.error)
