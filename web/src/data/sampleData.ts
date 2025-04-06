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
    title: 'Kalyana Kalpataru',
    author: 'Śrīla Bhaktivinoda Thakura',
    image: 'https://swamitripurari.com/wp-content/uploads/2011/01/nama-dharma.jpg',
    description: 'A collection of prayers and songs by Bhaktivinoda Thakura.',
    year: 1881,
    songCount: 42
  },
  {
    id: '2',
    title: 'Jaiva Dharma',
    author: 'Śrīla Bhaktivinoda Thakura',
    image: 'https://bhaktivinodainstitute.org/wp-content/uploads/2022/07/JAIVA-DHARMA-1024x600.jpg',
    description: 'A comprehensive philosophical treatise on Gaudiya Vaishnavism.',
    year: 1896,
    songCount: 0
  },
  {
    id: '3',
    title: 'Sri Caitanya-caritamrta',
    author: 'Krishnadasa Kaviraja Goswami',
    image: 'https://i1.sndcdn.com/artworks-qmLFQ1cOC0F9szhF-kmywsQ-t500x500.jpg',
    description: 'The authoritative biography of Sri Caitanya Mahaprabhu.',
    year: 1580,
    songCount: 0
  },
  {
    id: '4',
    title: 'Bhagavad-gita As It Is',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    image: 'https://i.pinimg.com/736x/a9/18/c0/a918c08bd24e65f760490898affbb6d1.jpg',
    description: 'Translation and commentary on the Bhagavad-gita.',
    year: 1972,
    songCount: 0
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
  },
  {
    id: '5',
    title: [
      { title: 'Akrodha Paramananda', language: 'en' },
      { title: 'অক্রোধ পরমানন্দ', language: 'bn' }
    ],
    author: [
      { author: 'Locana Dasa Thakura', language: 'en' },
      { author: 'লোচন দাস ঠাকুর', language: 'bn' }
    ],
    uid: 'L5',
    tags: ['Pañca-tattva', 'Śrī Nityānanda Prabhu', 'Bengali', 'Caitanya Mangala'],
    topics: [
      { topic: 'Gaura-lila', language: 'en' },
      { topic: 'গৌর-লীলা', language: 'bn' }
    ],
    audio: false,
    verses: [
      {
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
        word_to_words: [
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
          },
          {
            language: 'hi',
            words: [
              ['अक्रोध', 'क्रोधरहित'],
              ['परमानंद', 'परम आनंद'],
              ['नित्यानंद', 'नित्यानंद प्रभु'],
              ['राय', 'श्रेष्ठ'],
              ['अभिमान', 'अहंकार'],
              ['शून्य', 'रहित'],
              ['नीताई', 'नीताई'],
              ['नगरे', 'नगर में'],
              ['बेड़ाय', 'घूमते हैं']
            ]
          }
        ],
        translations: [
          {
            language: 'en',
            text: 'The noble Nityānanda Prabhu, the personification of supreme transcendental bliss, is never angry. Devoid of all false ego, He wanders throughout the town.'
          },
          {
            language: 'hi',
            text: 'श्रेष्ठ नित्यानंद प्रभु, जो परम आनंद के साकार रूप हैं, कभी क्रोधित नहीं होते। सभी अहंकार से रहित, वे नगर भर में घूमते रहते हैं।'
          }
        ]
      },
      {
        original: [
          'অধম পতিত জীবের দ্বারে দ্বারে গিয়া',
          'হরি-নাম মহা-মন্ত্র দিচ্ছেন বিলাইয়া'
        ],
        transliterations: [
          {
            language: 'en',
            text: [
              'adhama patita jīvera dvāre dvāre giẏā',
              'hari-nāma mahā-mantra dicchena bilāẏā'
            ]
          },
          {
            language: 'hi',
            text: [
              'अधम पतित जीवेर द्वारे द्वारे गिया',
              'हरि-नाम महा-मंत्र दिच्छेन बिलाया'
            ]
          }
        ],
        word_to_words: [
          {
            language: 'en',
            words: [
              ['adhama', 'fallen'],
              ['patita', 'degraded'],
              ['jīvera', 'of the souls'],
              ['dvāre dvāre', 'door to door'],
              ['giẏā', 'going'],
              ['hari-nāma', 'the holy name of Hari'],
              ['mahā-mantra', 'great mantra'],
              ['dicchena', 'distributing'],
              ['bilāẏā', 'freely']
            ]
          },
          {
            language: 'hi',
            words: [
              ['अधम', 'पतित'],
              ['पतित', 'गिरे हुए'],
              ['जीवेर', 'जीवों के'],
              ['द्वारे द्वारे', 'द्वार-द्वार'],
              ['गिया', 'जाकर'],
              ['हरि-नाम', 'हरि का पवित्र नाम'],
              ['महा-मंत्र', 'महामंत्र'],
              ['दिच्छेन', 'बाँट रहे हैं'],
              ['बिलाया', 'मुफ्त में']
            ]
          }
        ],
        translations: [
          {
            language: 'en',
            text: 'Going door to door, He freely distributes the great mantra, the holy name of Hari, to the fallen and degraded souls.'
          },
          {
            language: 'hi',
            text: 'वे द्वार-द्वार जाकर पतित और गिरे हुए जीवों को हरि के पवित्र नाम का महामंत्र मुफ्त में बाँट रहे हैं।'
          }
        ]
      },
      {
        original: [
          'জারে দেখে তারে কহে দন্তে তৃণা ধরি',
          'আমারে কিনিয়া লহ বল গৌর-হরি'
        ],
        transliterations: [
          {
            language: 'en',
            text: [
              'jāre dekhe tāre kahe dante tṛṇā dhori',
              'āmāre kiniyā laha bala gaura-hari'
            ]
          },
          {
            language: 'hi',
            text: [
              'जारे देखे तारे कहे दंते तृणा धोरी',
              'आमारे किनिया लहो बोलो गौर-हरि'
            ]
          }
        ],
        word_to_words: [
          {
            language: 'en',
            words: [
              ['jāre', 'whomever'],
              ['dekhe', 'he sees'],
              ['tāre', 'to them'],
              ['kahe', 'says'],
              ['dante', 'in his teeth'],
              ['tṛṇā', 'a straw'],
              ['dhori', 'holding'],
              ['āmāre', 'me'],
              ['kiniyā', 'purchasing'],
              ['laha', 'take'],
              ['bala', 'say'],
              ['gaura-hari', 'Gaura-Hari']
            ]
          },
          {
            language: 'hi',
            words: [
              ['जारे', 'जिसे'],
              ['देखे', 'देखते हैं'],
              ['तारे', 'उससे'],
              ['कहे', 'कहते हैं'],
              ['दंते', 'दाँतों में'],
              ['तृणा', 'तिनका'],
              ['धोरी', 'पकड़कर'],
              ['आमारे', 'मुझे'],
              ['किनिया', 'खरीदकर'],
              ['लहो', 'लो'],
              ['बोलो', 'कहो'],
              ['गौर-हरि', 'गौर-हरि']
            ]
          }
        ],
        translations: [
          {
            language: 'en',
            text: 'Whomever He sees, He says while holding a straw in His teeth, "Please purchase me by chanting the name of Gaura-Hari."'
          },
          {
            language: 'hi',
            text: 'जिसे भी वे देखते हैं, दाँतों में तिनका पकड़कर कहते हैं, "कृपया गौर-हरि का नाम जपकर मुझे खरीद लीजिए।"'
          }
        ]
      },
      {
        original: [
          'এতো বলি নিত্যানন্দ ভূমে গড়ি যায়',
          'সোনার পর্বত যেন ধূলাতে লোটায়'
        ],
        transliterations: [
          {
            language: 'en',
            text: [
              'eto boli nityānanda bhūme gaḓi yāya',
              'sonāra parvata jeno dhūlāte loṭāya'
            ]
          },
          {
            language: 'hi',
            text: [
              'एतो बोली नित्यानंद भूमे गड़ी जाय',
              'सोनार परबत जेनो धूलाते लोटाय'
            ]
          }
        ],
        word_to_words: [
          {
            language: 'en',
            words: [
              ['eto', 'thus'],
              ['boli', 'saying'],
              ['nityānanda', 'Nityānanda'],
              ['bhūme', 'on the ground'],
              ['gaḓi', 'rolling'],
              ['yāya', 'goes'],
              ['sonāra', 'golden'],
              ['parvata', 'mountain'],
              ['jeno', 'as if'],
              ['dhūlāte', 'in the dust'],
              ['loṭāya', 'rolling']
            ]
          },
          {
            language: 'hi',
            words: [
              ['एतो', 'इतना'],
              ['बोली', 'कहकर'],
              ['नित्यानंद', 'नित्यानंद'],
              ['भूमे', 'भूमि पर'],
              ['गड़ी', 'लोटते'],
              ['जाय', 'जाते हैं'],
              ['सोनार', 'सोने का'],
              ['परबत', 'पर्वत'],
              ['जेनो', 'जैसे'],
              ['धूलाते', 'धूल में'],
              ['लोटाय', 'लोट रहा हो']
            ]
          }
        ],
        translations: [
          {
            language: 'en',
            text: 'Saying this, Nityānanda falls to the ground, rolling as if a golden mountain were rolling in the dust.'
          },
          {
            language: 'hi',
            text: 'यह कहकर, नित्यानंद भूमि पर गिर पड़ते हैं, ऐसे लोटते हुए जैसे कोई सोने का पर्वत धूल में लोट रहा हो।'
          }
        ]
      },
      {
        original: [
          'হেনো অবতারে যার রতি না জন্মিল',
          'লোচন বলে সেই পাপী এলো আর গেল'
        ],
        transliterations: [
          {
            language: 'en',
            text: [
              'heno avatāre yāra rati nā janmila',
              'locana bale sei pāpi elo āra gela'
            ]
          },
          {
            language: 'hi',
            text: [
              'हेनो अवतारे जार रति ना जन्मिल',
              'लोचन बले सेई पापी एलो आर गेल'
            ]
          }
        ],
        word_to_words: [
          {
            language: 'en',
            words: [
              ['heno', 'such'],
              ['avatāre', 'incarnation'],
              ['yāra', 'whose'],
              ['rati', 'affection'],
              ['nā', 'not'],
              ['janmila', 'developed'],
              ['locana', 'Locana'],
              ['bale', 'says'],
              ['sei', 'that'],
              ['pāpi', 'sinner'],
              ['elo', 'came'],
              ['āra', 'and'],
              ['gela', 'went']
            ]
          },
          {
            language: 'hi',
            words: [
              ['हेनो', 'ऐसे'],
              ['अवतारे', 'अवतार के लिए'],
              ['जार', 'जिसकी'],
              ['रति', 'प्रीति'],
              ['ना', 'नहीं'],
              ['जन्मिल', 'जन्मी'],
              ['लोचन', 'लोचन'],
              ['बले', 'कहते हैं'],
              ['सेई', 'वह'],
              ['पापी', 'पापी'],
              ['एलो', 'आया'],
              ['आर', 'और'],
              ['गेल', 'चला गया']
            ]
          }
        ],
        translations: [
          {
            language: 'en',
            text: 'Locana Dasa says, "That sinner who has not developed affection for such an incarnation has come and gone for nothing."'
          },
          {
            language: 'hi',
            text: 'लोचन दास कहते हैं, "वह पापी जिसने ऐसे अवतार के लिए प्रेम विकसित नहीं किया, व्यर्थ ही आया और चला गया।"'
          }
        ]
      }
    ],
    tracks: []
  }
]