import { View } from 'app/design/view'
import { Text } from 'app/design/typography'
import { ScreenScrollView } from 'app/features/ScreenScrollView'
import { VerseListItem, IVerse } from 'app/components/VerseListItem'

const _verses: IVerse[] = [
  {
    language: 'bn',
    original: [
      'অক্রোধ পরমানন্দ নিত্যানন্দ-রায়',
      'অভিমান শূন্য নিতাই নগরে বেড়ায়',
    ],
    transletarations: [
      {
        language: 'en',
        text: [
          'akrodha paramānanda nityānanda-rāya',
          'abhimāna śūnya nitāi nagare beḓāya',
        ],
      },
      {
        language: 'hi',
        text: [
          'अक्रोध परमानंद नित्यानंद-राय',
          'अभिमान शून्य नीताई नगरे बेड़ाय',
        ],
      },
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
          ['beḓāya', 'wanders'],
        ],
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
          ['बेड़ाय', 'घूमते हैं'],
        ],
      },
    ],
    translations: [
      {
        language: 'en',
        text: 'The noble Nityānanda Prabhu, the personification of supreme transcendental bliss, is never angry. Devoid of all false ego, He wanders throughout the town.',
      },
      {
        language: 'hi',
        text: 'श्रेष्ठ नित्यानंद प्रभु, जो परम आनंद के साकार रूप हैं, कभी क्रोधित नहीं होते। सभी अहंकार से रहित, वे नगर भर में घूमते रहते हैं।',
      },
    ],
  },
  {
    language: 'bn',
    original: [
      'অধম পতিত জীবের দ্বারে দ্বারে গিয়া',
      'হরি-নাম মহা-মন্ত্র দিচ্ছেন বিলাইয়া',
    ],
    transletarations: [
      {
        language: 'en',
        text: [
          'adhama patita jīvera dvāre dvāre giẏā',
          'hari-nāma mahā-mantra dicchena bilāẏā',
        ],
      },
      {
        language: 'hi',
        text: [
          'अधम पतित जीवेर द्वारे द्वारे गिया',
          'हरि-नाम महा-मंत्र दिच्छेन बिलाया',
        ],
      },
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
          ['bilāẏā', 'freely'],
        ],
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
          ['बिलाया', 'मुफ्त में'],
        ],
      },
    ],
    translations: [
      {
        language: 'en',
        text: 'Going door to door, He freely distributes the great mantra, the holy name of Hari, to the fallen and degraded souls.',
      },
      {
        language: 'hi',
        text: 'वे द्वार-द्वार जाकर पतित और गिरे हुए जीवों को हरि के पवित्र नाम का महामंत्र मुफ्त में बाँट रहे हैं।',
      },
    ],
  },
  {
    language: 'bn',
    original: [
      'জারে দেখে তারে কহে দন্তে তৃণা ধরি',
      'আমারে কিনিয়া লহ বল গৌর-হরি',
    ],
    transletarations: [
      {
        language: 'en',
        text: [
          'jāre dekhe tāre kahe dante tṛṇā dhori',
          'āmāre kiniyā laha bala gaura-hari',
        ],
      },
      {
        language: 'hi',
        text: [
          'जारे देखे तारे कहे दंते तृणा धोरी',
          'आमारे किनिया लहो बोलो गौर-हरि',
        ],
      },
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
          ['gaura-hari', 'Gaura-Hari'],
        ],
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
          ['गौर-हरि', 'गौर-हरि'],
        ],
      },
    ],
    translations: [
      {
        language: 'en',
        text: 'Whomever He sees, He says while holding a straw in His teeth, "Please purchase me by chanting the name of Gaura-Hari."',
      },
      {
        language: 'hi',
        text: 'जिसे भी वे देखते हैं, दाँतों में तिनका पकड़कर कहते हैं, "कृपया गौर-हरि का नाम जपकर मुझे खरीद लीजिए।"',
      },
    ],
  },
  {
    language: 'bn',
    original: [
      'এতো বলি নিত্যানন্দ ভূমে গড়ি যায়',
      'সোনার পর্বত যেন ধূলাতে লোটায়',
    ],
    transletarations: [
      {
        language: 'en',
        text: [
          'eto boli nityānanda bhūme gaḓi yāya',
          'sonāra parvata jeno dhūlāte loṭāya',
        ],
      },
      {
        language: 'hi',
        text: [
          'एतो बोली नित्यानंद भूमे गड़ी जाय',
          'सोनार परबत जेनो धूलाते लोटाय',
        ],
      },
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
          ['loṭāya', 'rolling'],
        ],
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
          ['लोटाय', 'लोट रहा हो'],
        ],
      },
    ],
    translations: [
      {
        language: 'en',
        text: 'Saying this, Nityānanda falls to the ground, rolling as if a golden mountain were rolling in the dust.',
      },
      {
        language: 'hi',
        text: 'यह कहकर, नित्यानंद भूमि पर गिर पड़ते हैं, ऐसे लोटते हुए जैसे कोई सोने का पर्वत धूल में लोट रहा हो।',
      },
    ],
  },
  {
    language: 'bn',
    original: ['হেনো অবতারে যার রতি না জন্মিল', 'লোচন বলে সেই পাপী এলো আর গেল'],
    transletarations: [
      {
        language: 'en',
        text: [
          'heno avatāre yāra rati nā janmila',
          'locana bale sei pāpi elo āra gela',
        ],
      },
      {
        language: 'hi',
        text: ['हेनो अवतारे जार रति ना जन्मिल', 'लोचन बले सेई पापी एलो आर गेल'],
      },
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
          ['gela', 'went'],
        ],
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
          ['गेल', 'चला गया'],
        ],
      },
    ],
    translations: [
      {
        language: 'en',
        text: 'Locana Dasa says, "That sinner who has not developed affection for such an incarnation has come and gone for nothing."',
      },
      {
        language: 'hi',
        text: 'लोचन दास कहते हैं, "वह पापी जिसने ऐसे अवतार के लिए प्रेम विकसित नहीं किया, व्यर्थ ही आया और चला गया।"',
      },
    ],
  },
]

interface ISong {
  title: ITitle[]
  author?: IAuthor[]
  uid: string
  tags: string[]
  topics?: ITopics[]
  audio?: boolean
  verses?: IVerse[]
  tracks?: string[]
}

interface ITitle {
  title: string
  language: string
}

interface IAuthor {
  author: string
  language: string
}

interface ITopics {
  topic: string
  language: string
}

const _title: ITitle[] = [
  { title: 'Akrodha Paramānanda', language: 'en' },
  { title: 'अक्रोध परमानंद', language: 'hi' },
]

const _author: IAuthor[] = [
  { author: 'Śrīla Locana Dāsa Ṭhākura', language: 'en' },
  { author: 'श्रील लोचन दास ठाकुर', language: 'hi' },
]

const _topics: ITopics[] = [
  { topic: 'Devotion', language: 'en' },
  { topic: 'भक्ति', language: 'hi' },
]

const user_langauge = 'en'

export function SongScreen({
  title = _title,
  author = _author,
  uid,
  tags,
  topics,
  audio,
  verses = _verses,
  tracks,
}: ISong) {
  return (
    <ScreenScrollView useWindowScrolling={true}>
      <View className="flex flex-col items-center gap-1 mb-3">
        <Text className="text-3xl text-gaur-highlight dark:text-shyam-highlight">
          {title.find((title) => title.language === user_langauge)?.title ||
            (title[0] ? title[0].title : 'Unknown Title')}
        </Text>
        <Text className="text-lg text-gaur-primary dark:text-shyam-primary">
          {author.find((author) => author.language === user_langauge)?.author ||
            (author[0] ? author[0].author : 'Unknown Author')}
        </Text>
        <View className="bg-gaur-neutral/25 dark:bg-shyam-neutral/25 flex-shrink-0 rounded-xl px-2.5 py-0.5">
          <Text className="text-gaur-neutral dark:text-shyam-neutral text-[10px] font-medium uppercase m-auto">
            {uid}
          </Text>
        </View>
      </View>
      <View className="items-center justify-center flex-1">
        <View className="w-full mb-2">
          {verses.map((verse, index) => (
            <VerseListItem
              key={index}
              original={verse.original}
              transletarations={verse.transletarations}
              word_to_words={verse.word_to_words}
              translations={verse.translations}
            />
          ))}
        </View>
      </View>
    </ScreenScrollView>
  )
}
