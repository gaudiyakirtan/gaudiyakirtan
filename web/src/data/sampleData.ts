import { IExtendedSong } from '../models/Song'
import { IAuthor } from '../models/Author'
import { ITopic } from '../models/Topic'
import { IBook } from '../models/Book'

// Sample authors
export const sampleAuthors: IAuthor[] = [
  {
    id: '1',
    name: 'Bhaktivedanta Swami Prabhupada',
    image: 'https://satsvarupadasagoswami.com/wp-content/uploads/2017/01/SrilaPrabhupada.jpg',
    birthYear: 1896,
    deathYear: 1977,
    description: 'Founder-Acharya of the International Society for Krishna Consciousness (ISKCON).'
  },
  {
    id: '2',
    name: 'Bhaktivinoda Thakura',
    image: 'https://premadharma.org/wp-content/uploads/2017/01/Srila-Bhakti-Vinod-Thakur-1.jpg',
    birthYear: 1838,
    deathYear: 1914,
    description: 'Pioneer of the revival of Gaudiya Vaishnavism in the late 19th century.'
  },
  {
    id: '3',
    name: 'Narottama Dasa Thakura',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo_tUvLJlX7XaV4k4vq67yfawaMIO2s6-Plg&s',
    birthYear: 1520,
    deathYear: 1587,
    description: 'Influential Vaishnava saint known for his devotional songs.'
  },
  {
    id: '4',
    name: 'Locana Dasa Thakura',
    image: null,
    birthYear: 1520,
    deathYear: 1587,
    description: 'Renowned poet and author of Caitanya-mangala.'
  },
  {
    id: '5',
    name: 'Krishnadasa Kaviraja',
    image: 'https://krsnakatha.com/img/guru-parampara/Krishnadasa-Kaviraja-Goswami.jpg',
    birthYear: 1496,
    deathYear: 1588,
    description: 'Author of Sri Caitanya-caritamrta, the authoritative biography of Sri Caitanya Mahaprabhu.'
  }
]

// Sample topics
export const sampleTopics: ITopic[] = [
  { name: 'Sri Guru' },
  { name: 'Vaisnavas' },
  { name: 'Sri Gadadhara' },
  { name: 'Radha-Krishna' },
  { name: 'Gaura-lila' },
  { name: 'Prayers' },
  { name: 'Arati' },
  { name: 'Mangalacarana' }
]

// Sample books
export const sampleBooks: IBook[] = [
  {
    id: '1',
    title: 'Gītāvalī',
    author: 'Bhaktivinoda Thakura',
    coverImage: '/images/books/gitavali.jpg',
    description: 'A collection of devotional songs by Bhaktivinoda Thakura.',
    year: 1893,
    songCount: 73
  },
  {
    id: '2',
    title: 'Kalyana Kalpataru',
    author: 'Bhaktivinoda Thakura',
    coverImage: '/images/books/kalyana-kalpataru.jpg',
    description: 'A collection of prayers and songs by Bhaktivinoda Thakura.',
    year: 1881,
    songCount: 42
  },
  {
    id: '3',
    title: 'Prarthana',
    author: 'Narottama Dasa Thakura',
    coverImage: null,
    description: 'A collection of prayers by Narottama Dasa Thakura.',
    year: 1570,
    songCount: 33
  },
  {
    id: '4',
    title: 'Prema Bhakti Candrika',
    author: 'Narottama Dasa Thakura',
    coverImage: null,
    description: 'Devotional songs about prema-bhakti by Narottama Dasa Thakura.',
    year: 1570,
    songCount: 28
  }
]

// Sample songs
export const sampleSongs: IExtendedSong[] = [
  {
    id: '1',
    title: [
      { title: 'Sri Guru Vandana', language: 'en' },
      { title: 'শ্রী গুরু বন্দনা', language: 'bn' }
    ],
    author: [
      { author: 'Narottama Dasa Thakura', language: 'en' },
      { author: 'নরোত্তম দাস ঠাকুর', language: 'bn' }
    ],
    uid: 'N3',
    tags: ['prayer', 'guru'],
    topics: [
      { topic: 'Guru Vandana', language: 'en' },
      { topic: 'গুরু বন্দনা', language: 'bn' }
    ],
    audio: true,
    verses: [
      {
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
        word_to_words: [
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
    ],
    tracks: ['track1.mp3']
  },
  {
    id: '2',
    title: [
      { title: 'Saranagati', language: 'en' },
      { title: 'শরণাগতি', language: 'bn' }
    ],
    author: [
      { author: 'Bhaktivinoda Thakura', language: 'en' },
      { author: 'ভক্তিবিনোদ ঠাকুর', language: 'bn' }
    ],
    uid: 'S1',
    tags: ['surrender', 'prayer'],
    topics: [
      { topic: 'Prayers', language: 'en' },
      { topic: 'প্রার্থনা', language: 'bn' }
    ],
    audio: false,
    verses: [
      {
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
        word_to_words: [
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
    ],
    tracks: []
  },
  {
    id: '3',
    title: [
      { title: 'Sri Krishna Caitanya Prabhu', language: 'en' },
      { title: 'শ্রী কৃষ্ণ চৈতন্য প্রভু', language: 'bn' }
    ],
    author: [
      { author: 'Locana Dasa Thakura', language: 'en' },
      { author: 'লোচন দাস ঠাকুর', language: 'bn' }
    ],
    uid: 'E4',
    tags: ['mahaprabhu', 'prayer'],
    topics: [
      { topic: 'Gaura-lila', language: 'en' },
      { topic: 'গৌর-লীলা', language: 'bn' }
    ],
    audio: true,
    verses: [
      {
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
        word_to_words: [
          {
            language: 'en',
            words: [
              ['śrī-kṛṣṇa-caitanya', 'Lord Sri Krishna Caitanya'],
              ['prabhu', 'the master'],
              ['jīve', 'to the living entities'],
              ['doyā', 'mercy'],
              ['kori', 'doing'],
              ['sva-pārṣada', 'His own associates'],
              ['svīya', 'His own'],
              ['dhāma', 'abode'],
              ['saha', 'with'],
              ['avatari', 'descending']
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
    ],
    tracks: ['track3.mp3']
  },
  {
    id: '4',
    title: [
      { title: 'Jaya Radha Madhava', language: 'en' },
      { title: 'জয় রাধা মাধব', language: 'bn' }
    ],
    author: [
      { author: 'Bhaktivedanta Swami Prabhupada', language: 'en' },
      { author: 'ভক্তিবেদান্ত স্বামী প্রভুপাদ', language: 'bn' }
    ],
    uid: 'SQ2',
    tags: ['radha-krishna', 'prayer'],
    topics: [
      { topic: 'Radha-Krishna', language: 'en' },
      { topic: 'রাধা-কৃষ্ণ', language: 'bn' }
    ],
    audio: true,
    verses: [
      {
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
        word_to_words: [
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
            text: 'Glory to Radha and Madhava who sport in the groves of Vrindavana. Glory to the beloved of the gopis, who holds aloft the great Govardhana Hill.'
          }
        ]
      }
    ],
    tracks: ['track4.mp3']
  }
]