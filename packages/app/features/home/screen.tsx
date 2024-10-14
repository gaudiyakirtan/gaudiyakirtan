import { A, H1, P, Text, TextLink } from 'app/design/typography'
import { Row } from 'app/design/layout'
import { View } from 'app/design/view'
import { ScreenScrollView } from 'app/features/ScreenScrollView'
import { SongListItem, ISongListItem } from 'app/components/SongListItem'
import { AuthorListItem, IAuthorListItem } from 'app/components/AuthorListItem'
import { TopicListItem, ITopicListItem } from 'app/components/TopicListItem'
import { BookListItem, IBookListItem } from 'app/components/BookListItem'
import { ScrollView } from 'react-native'

// Data
const _songs = [
  {
    title: 'Sri Gurvaṣṭakam Sri Gurvaṣṭakam Sri Gurvaṣṭakam',
    author: 'Visvanatha Cakravarti Thakura',
    uid: 'n9',
    tags: ['Hare', 'Krishna', 'Bhaktivinoda', 'Thakura'],
  },
  {
    title: 'Bhaja Bhakata Vatsala',
    author: 'Bhaktivinoda Thakura',
    uid: 'n10',
    tags: ['Bhakti', 'Devotion', 'Vatsala'],
  },
  {
    title: 'Jaya Radha Madhava',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    uid: 'n11',
    tags: ['Radha', 'Madhava', 'Kirtan'],
  },
  {
    title: 'Hari Haraye Nama Krishna',
    author: 'Narottama Dasa Thakura',
    uid: 'n12',
    tags: ['Hari', 'Krishna', 'Nama'],
  },
  {
    title: 'Sri Krishna Caitanya Prabhu',
    author: 'Locana Dasa Thakura',
    uid: 'n13',
    tags: ['Krishna', 'Caitanya', 'Prabhu'],
  },
  {
    title: 'Yasomati Nandana',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    uid: 'n14',
    tags: ['Yasomati', 'Nandana', 'Krishna'],
  },
]

const _authors = [
  {
    author: 'Bhaktivinoda Thakur',
    image:
      'https://premadharma.org/wp-content/uploads/2017/01/Srila-Bhakti-Vinod-Thakur-1.jpg',
  },
  {
    author: 'Narottama Dasa',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo_tUvLJlX7XaV4k4vq67yfawaMIO2s6-Plg&s',
  },
  {
    author: 'Visvanatha Cakravarti Thakura',
    image:
      'https://bhaktiart.net/wp-content/uploads/2012/04/Visvanatha-Cakravati-Thakura-May-06-card-size-web.jpg',
  },
  {
    author: 'Rupa Goswami',
    image:
      'https://vaishnavsongs.iskcondesiretree.com/wp-content/uploads/2011/06/RupaGoswami1.jpg',
  },
  {
    author: 'Sanatana Goswami',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzuoabJy5ROPXsC-FZ8I6L-fTn49h6mC_ikA&s',
  },
  {
    author: 'Jiva Goswami',
    image:
      'https://d2j6dbq0eux0bg.cloudfront.net/images/10470937/1055188584.jpg',
  },
  {
    author: 'Krishnadasa Kaviraja Goswami',
    image:
      'https://krsnakatha.com/img/guru-parampara/Krishnadasa-Kaviraja-Goswami.jpg',
  },
  {
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    image:
      'https://satsvarupadasagoswami.com/wp-content/uploads/2017/01/SrilaPrabhupada.jpg',
  },
]

const _topics = [
  {
    topic: 'Sri Guru'
  },
  {
    topic: 'Vaisnavas'
  },
  {
    topic: "Sri Gadadhara"
  }
];

const _books = [
  {
    title: 'Kalyana Kalpataru',
    author: 'Śrīla Bhaktivinoda Thakura',
    image:
      'https://swamitripurari.com/wp-content/uploads/2011/01/nama-dharma.jpg',
  },
  {
    title: 'Jaiva Dharma',
    author: 'Śrīla Bhaktivinoda Thakura',
    image:
      'https://bhaktivinodainstitute.org/wp-content/uploads/2022/07/JAIVA-DHARMA-1024x600.jpg',
  },
  {
    title: 'Sri Caitanya-caritamrta',
    author: 'Krishnadasa Kaviraja Goswami',
    image:
      'https://i1.sndcdn.com/artworks-qmLFQ1cOC0F9szhF-kmywsQ-t500x500.jpg',
  },
  {
    title: 'Bhagavad-gita As It Is',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    image:
      'https://i.pinimg.com/736x/a9/18/c0/a918c08bd24e65f760490898affbb6d1.jpg',
  },
]


interface IHomeScreen {
  recent_songs?: ISongListItem[];
  authors: IAuthorListItem[];
  topics: ITopicListItem[];
  books: IBookListItem[];
  trending?: ISongListItem[];
}

export function HomeScreen({ recent_songs = _songs, authors = _authors, topics = _topics, books = _books, trending = _songs }: IHomeScreen) {
  return (
    <ScreenScrollView useWindowScrolling={true}>
      {/* TODO: Look into why gaur-backgorund is different color and not fff4e8 */}
      <View className="p-4 bg-gaur-background dark:bg-shyam-background">
        {/* Song section */}
        <View className="mb-4">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {recent_songs.splice(0, 4).map((song, index) => (
              <View
                style={{ width: '48%' }}
                className={index % 2 === 0 ? 'mb-2 mr-2' : 'mb-2'}
                key={index}
              >
                <SongListItem
                  title={song.title}
                  author={song.author}
                  uid={song.uid}
                  tags={song.tags}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Authors section */}
        <View className="mb-4">
          <Text className="mb-2 text-xl font-bold text-gaur-primary dark:text-shyam-primary">
            Authors
          </Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {authors.map((author, index) => (
              <View className="mr-2" key={index}>
                <AuthorListItem author={author.author} image={author.image} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Topics section */}
        <View className="mb-4">
          <Text className="mb-2 text-xl font-bold text-gaur-primary dark:text-shyam-primary">
            Topics
          </Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {topics.map((topic, index) => (
              <View className="mr-2" key={index}>
                <TopicListItem topic={topic.topic} key={index} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Books section */}
        <View className="mb-4">
          <Text className="mb-2 text-xl font-bold text-gaur-primary dark:text-shyam-primary">
            Books
          </Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {books.map((book, index) => (
              <View className="mr-2" key={index}>
                <BookListItem
                  title={book.title}
                  author={book.author}
                  image={book.image}
                  key={index}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Song section */}
        <View className="mb-4">
          <Text className="mb-2 text-xl font-bold text-gaur-primary dark:text-shyam-primary">
            Trending
          </Text>
          {recent_songs.splice(0, 4).map((song, index) => (
            <View
              className='mb-2'
              key={index}
            >
              <SongListItem
                title={song.title}
                author={song.author}
                uid={song.uid}
                tags={song.tags}
              />
            </View>
          ))}
        </View>
      </View>
    </ScreenScrollView>
  )
}