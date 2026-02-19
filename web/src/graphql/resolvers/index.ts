import { connectToDatabase } from '../../lib/mongodb'
import { GraphQLScalarType } from 'graphql'

const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  serialize(value) { return value },
  parseValue(value) { return value },
})

export const resolvers = {
  JSON: JSONScalar,

  Query: {
    songs: async (_: unknown, { limit = 100, offset = 0 }: { limit?: number; offset?: number }) => {
      const { db } = await connectToDatabase()
      return db.collection('songs').find().skip(offset).limit(limit).toArray()
    },

    song: async (_: unknown, { uid }: { uid: string }) => {
      const { db } = await connectToDatabase()
      return db.collection('songs').findOne({ uid })
    },

    authors: async () => {
      const { db } = await connectToDatabase()
      return db.collection('authors').find().toArray()
    },

    author: async (_: unknown, { uid }: { uid: string }) => {
      const { db } = await connectToDatabase()
      return db.collection('authors').findOne({ uid })
    },

    books: async () => {
      const { db } = await connectToDatabase()
      return db.collection('books').find().toArray()
    },

    book: async (_: unknown, { uid }: { uid: string }) => {
      const { db } = await connectToDatabase()
      return db.collection('books').findOne({ uid })
    },

    topics: async () => {
      const { db } = await connectToDatabase()
      return db.collection('topics').find().toArray()
    },

    topic: async (_: unknown, { uid }: { uid: string }) => {
      const { db } = await connectToDatabase()
      return db.collection('topics').findOne({ uid })
    },

    singers: async () => {
      const { db } = await connectToDatabase()
      return db.collection('singers').find().toArray()
    },

    singer: async (_: unknown, { uid }: { uid: string }) => {
      const { db } = await connectToDatabase()
      return db.collection('singers').findOne({ uid })
    },
  },
}
