import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { typeDefs } from '../../graphql/schema'
import { resolvers } from '../../graphql/resolvers'
import type { NextApiRequest, NextApiResponse } from 'next'

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const handler = startServerAndCreateNextHandler<NextApiRequest>(server)

export default async function graphqlHandler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS for mobile clients
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  return handler(req, res)
}
