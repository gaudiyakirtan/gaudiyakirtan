import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gaudiyakirtan'

const songs = [
  {
    uid: 'N3',
    title: 'Sri Guru Vandana',
    author: 'Narottama Dasa Thakura',
    audio: true,
    tags: ['prayer', 'guru'],
    topics: ['sri-guru'],
    tracks: [],
    verses: [
      {
        index: 1,
        language: 'bn',
        original: [
          'শ্রী-গুরু-চরণ-পদ্ম, কেবল-ভকতি-সদ্ম,',
          'বন্দো মুঞি সাবধান মতে'
        ],
        transliterations: [
          {
            language: 'en',
            text: [
              'śrī-guru-caraṇa-padma, kevala-bhakati-sadma,',
              'bando muñi sābadhāna mate'
            ]
          }
        ],
        wordToWords: [
          {
            language: 'en',
            words: [
              ['śrī-guru', 'spiritual master'],
              ['caraṇa', 'lotus feet'],
              ['padma', 'lotus flower'],
              ['kevala', 'exclusively'],
              ['bhakati', 'devotional service'],
              ['sadma', 'abode'],
              ['bando', 'I offer obeisances'],
              ['muñi', 'I'],
              ['sābadhāna', 'careful'],
              ['mate', 'mind']
            ]
          }
        ],
        translations: [
          {
            language: 'en',
            text: 'The lotus feet of the spiritual master are the abode of pure devotional service. I bow down to those lotus feet with great care and attention.'
          }
        ]
      }
    ]
  },
  {
    uid: 'S1',
    title: 'Saranagati',
    author: 'Bhaktivinoda Thakura',
    audio: false,
    tags: ['surrender', 'prayer'],
    topics: ['prayers'],
    tracks: [],
    verses: [
      {
        index: 1,
        language: 'bn',
        original: [
          'আত্ম-নিবেদন, তুয়া পদে করি',
          'হইনু পরম সুখী'
        ],
        transliterations: [
          {
            language: 'en',
            text: [
              'ātma-nivedana, tuyā pade kari',
              'hoinu parama sukhī'
            ]
          }
        ],
        wordToWords: [
          {
            language: 'en',
            words: [
              ['ātma', 'self'],
              ['nivedana', 'surrender'],
              ['tuyā', 'your'],
              ['pade', 'at the feet'],
              ['kari', 'doing'],
              ['hoinu', 'I have become'],
              ['parama', 'supremely'],
              ['sukhī', 'happy']
            ]
          }
        ],
        translations: [
          {
            language: 'en',
            text: 'I have become supremely joyful by surrendering myself at Your lotus feet.'
          }
        ]
      }
    ]
  },
  {
    uid: 'E4',
    title: 'Sri Krishna Caitanya Prabhu',
    author: 'Locana Dasa Thakura',
    audio: true,
    tags: ['mahaprabhu', 'prayer'],
    topics: ['gaura-lila'],
    tracks: [],
    verses: [
      {
        index: 1,
        language: 'bn',
        original: [
          'শ্রী-কৃষ্ণ-চৈতন্য প্রভু জীবে দয়া করি',
          'স্বপার্ষদ স্বীয় ধাম সহ অবতরি'
        ],
        transliterations: [
          {
            language: 'en',
            text: [
              'śrī-kṛṣṇa-caitanya prabhu jīve doyā kori',
              'sva-pārṣada svīya dhāma saha avatari'
            ]
          }
        ],
        wordToWords: [
          {
            language: 'en',
            words: [
              ['śrī-kṛṣṇa-caitanya', 'Lord Sri Krishna Caitanya'],
              ['prabhu', 'the master'],
              ['jīve', 'to the living entities'],
              ['doyā', 'mercy'],
              ['kori', 'doing']
            ]
          }
        ],
        translations: [
          {
            language: 'en',
            text: 'Lord Sri Krishna Caitanya, being compassionate toward the living entities, descended with His personal associates and His own abode.'
          }
        ]
      }
    ]
  },
  {
    uid: 'SQ2',
    title: 'Jaya Radha Madhava',
    author: 'Bhaktivedanta Swami Prabhupada',
    audio: true,
    tags: ['radha-krishna', 'prayer'],
    topics: ['radha-krishna'],
    tracks: [],
    verses: [
      {
        index: 1,
        language: 'bn',
        original: [
          'জয় রাধা-মাধব কুঞ্জ-বিহারী',
          'গোপী-জন-বল্লভ গিরি-বর-ধারী'
        ],
        transliterations: [
          {
            language: 'en',
            text: [
              'jaya rādhā-mādhava kuñja-bihārī',
              'gopī-jana-vallabha giri-bara-dhārī'
            ]
          }
        ],
        wordToWords: [
          {
            language: 'en',
            words: [
              ['jaya', 'all glories'],
              ['rādhā-mādhava', 'to Radha and Madhava'],
              ['kuñja-bihārī', 'who enjoy pastimes in the forest groves'],
              ['gopī-jana', 'of the gopis'],
              ['vallabha', 'the dear one'],
              ['giri-bara', 'Govardhana Hill'],
              ['dhārī', 'the lifter']
            ]
          }
        ],
        translations: [
          {
            language: 'en',
            text: 'Glory to Radha and Madhava who sport in the groves of Vrindavana.'
          }
        ]
      }
    ]
  },
  {
    uid: 'L5',
    title: 'Akrodha Paramananda',
    author: 'Locana Dasa Thakura',
    audio: false,
    tags: ['Pañca-tattva', 'Śrī Nityānanda Prabhu', 'Bengali', 'Caitanya Mangala'],
    topics: ['gaura-lila'],
    tracks: [],
    verses: [
      {
        index: 1,
        language: 'bn',
        original: [
          'অক্রোধ পরমানন্দ নিত্যানন্দ-রায়',
          'অভিমান শূন্য নিতাই নগরে বেড়ায়'
        ],
        transliterations: [
          {
            language: 'en',
            text: [
              'akrodha paramānanda nityānanda-rāya',
              'abhimāna śūnya nitāi nagare beḓāya'
            ]
          },
          {
            language: 'hi',
            text: [
              'अक्रोध परमानंद नित्यानंद-राय',
              'अभिमान शून्य नीताई नगरे बेड़ाय'
            ]
          }
        ],
        wordToWords: [
          {
            language: 'en',
            words: [
              ['akrodha', 'free from anger'],
              ['paramānanda', 'supreme bliss'],
              ['nityānanda', 'Nityānanda Prabhu'],
              ['rāya', 'noble'],
              ['abhimāna', 'false ego'],
              ['śūnya', 'devoid'],
              ['nitāi', 'Nitāi'],
              ['nagare', 'throughout the town'],
              ['beḓāya', 'wanders']
            ]
          }
        ],
        translations: [
          {
            language: 'en',
            text: 'The noble Nityānanda Prabhu, the personification of supreme transcendental bliss, is never angry. Devoid of all false ego, He wanders throughout the town.'
          }
        ]
      }
    ]
  }
]

const authors = [
  { uid: 'prabhupada', name: 'Bhaktivedanta Swami Prabhupada', slug: 'bhaktivedanta-swami-prabhupada', image: 'https://satsvarupadasagoswami.com/wp-content/uploads/2017/01/SrilaPrabhupada.jpg', songs: ['SQ2'], books: [] },
  { uid: 'bhaktivinoda', name: 'Bhaktivinoda Thakura', slug: 'bhaktivinoda-thakura', image: 'https://premadharma.org/wp-content/uploads/2017/01/Srila-Bhakti-Vinod-Thakur-1.jpg', songs: ['S1'], books: ['kalyana-kalpataru'] },
  { uid: 'narottama', name: 'Narottama Dasa Thakura', slug: 'narottama-dasa-thakura', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo_tUvLJlX7XaV4k4vq67yfawaMIO2s6-Plg&s', songs: ['N3'], books: [] },
  { uid: 'locana', name: 'Locana Dasa Thakura', slug: 'locana-dasa-thakura', image: null, songs: ['E4', 'L5'], books: [] },
  { uid: 'krishnadasa', name: 'Krishnadasa Kaviraja', slug: 'krishnadasa-kaviraja', image: 'https://krsnakatha.com/img/guru-parampara/Krishnadasa-Kaviraja-Goswami.jpg', songs: [], books: [] },
]

const topics = [
  { uid: 'sri-guru', topic: 'Sri Guru', slug: 'sri-guru', songs: ['N3'] },
  { uid: 'vaisnavas', topic: 'Vaisnavas', slug: 'vaisnavas', songs: [] },
  { uid: 'radha-krishna', topic: 'Radha-Krishna', slug: 'radha-krishna', songs: ['SQ2'] },
  { uid: 'gaura-lila', topic: 'Gaura-lila', slug: 'gaura-lila', songs: ['E4', 'L5'] },
  { uid: 'prayers', topic: 'Prayers', slug: 'prayers', songs: ['S1'] },
  { uid: 'arati', topic: 'Arati', slug: 'arati', songs: [] },
  { uid: 'mangalacarana', topic: 'Mangalacarana', slug: 'mangalacarana', songs: [] },
  { uid: 'sri-gadadhara', topic: 'Sri Gadadhara', slug: 'sri-gadadhara', songs: [] },
]

const books = [
  {
    uid: 'kalyana-kalpataru',
    title: 'Kalyana Kalpataru',
    author: 'Bhaktivinoda Thakura',
    slug: 'kalyana-kalpataru',
    image: 'https://swamitripurari.com/wp-content/uploads/2011/01/nama-dharma.jpg',
    songs: {
      type: 'section',
      children: [
        {
          label: 'Bengali',
          type: 'section',
          children: [
            { type: 'song', uid: 'S1' }
          ]
        }
      ]
    }
  },
]

async function seed() {
  console.log('Connecting to MongoDB...')
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db('gaudiyakirtan')

  console.log('Dropping existing collections...')
  const collections = await db.listCollections().toArray()
  for (const col of collections) {
    await db.dropCollection(col.name)
  }

  console.log('Inserting songs...')
  await db.collection('songs').insertMany(songs)
  console.log(`  ${songs.length} songs inserted`)

  console.log('Inserting authors...')
  await db.collection('authors').insertMany(authors)
  console.log(`  ${authors.length} authors inserted`)

  console.log('Inserting topics...')
  await db.collection('topics').insertMany(topics)
  console.log(`  ${topics.length} topics inserted`)

  console.log('Inserting books...')
  await db.collection('books').insertMany(books)
  console.log(`  ${books.length} books inserted`)

  // Create indexes
  console.log('Creating indexes...')
  await db.collection('songs').createIndex({ uid: 1 }, { unique: true })
  await db.collection('authors').createIndex({ uid: 1 }, { unique: true })
  await db.collection('topics').createIndex({ uid: 1 }, { unique: true })
  await db.collection('books').createIndex({ uid: 1 }, { unique: true })

  console.log('Seed complete!')
  await client.close()
}

seed().catch(console.error)
