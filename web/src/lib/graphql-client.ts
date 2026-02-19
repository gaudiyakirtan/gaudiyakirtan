const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/api/graphql'

export async function graphqlQuery<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  const json = await res.json()

  if (json.errors) {
    console.error('GraphQL errors:', json.errors)
    throw new Error(json.errors[0].message)
  }

  return json.data
}

// Query strings
export const SONGS_QUERY = `
  query Songs {
    songs {
      uid
      title
      author
      audio
      tags
      topics
      verses {
        index
        language
        original
        transliterations { language text }
        wordToWords { language words }
        translations { language text }
      }
    }
  }
`

export const SONG_QUERY = `
  query Song($uid: String!) {
    song(uid: $uid) {
      uid
      title
      author
      audio
      tags
      topics
      verses {
        index
        language
        original
        transliterations { language text }
        wordToWords { language words }
        translations { language text }
      }
    }
  }
`

export const AUTHORS_QUERY = `
  query Authors {
    authors {
      uid
      name
      slug
      image
      songs
      books
    }
  }
`

export const BOOKS_QUERY = `
  query Books {
    books {
      uid
      title
      author
      slug
      image
      songs
    }
  }
`

export const TOPICS_QUERY = `
  query Topics {
    topics {
      uid
      topic
      slug
      songs
    }
  }
`
