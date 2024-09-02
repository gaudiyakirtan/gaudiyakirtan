import { A, H1, P, Text, TextLink } from 'app/design/typography'
import { Row } from 'app/design/layout'
import { View } from 'app/design/view'
import { Music } from 'lucide-react'
import { MotiLink } from 'solito/moti'

// import SongListItem from 'app/components/song/SongListItem'

// SongListItem.tsx
interface ISongListItem {
  title: string
  author?: string
  uid: string
  audio?: boolean
  tags: string[]
}

const SongListItem = ({ title, author, uid, audio, tags }: ISongListItem) => {
  return (
    <View className="bg-shyam-background-offset flex h-14 w-full flex-row items-center px-2.5 rounded-xl">
      <View className="flex-none">
        <View className="flex flex-row gap-1">
          <Text className="text-sm text-shyam-primary">{title}</Text>
          <View className="bg-shyam-neutral/25 rounded-xl px-2.5">
            <Text className="text-shyam-neutral m-auto text-[10px] uppercase font-medium">
              {uid}
            </Text>
          </View>
        </View>
        <View className="flex flex-row gap-1">
          <Text className="text-sm text-shyam-neutral">{author}</Text>
          <Music size={12} className="my-auto text-shyam-neutral" />
        </View>
      </View>
      <View className="flex-row-reverse flex-1 gap-1.5 overflow-hidden sm:flex hidden">
        {tags.map((tag, index) => (
          <View
            key={index}
            className="px-2.5 py-1 rounded-[10px] bg-shyam-neutral/25"
          >
            <Text className="text-xs text-shyam-neutral">{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// End of SongListItem.tsx

// TopicListItem.tsx
import { theme } from 'app/design/tailwind/theme'
const getMediaColor = (media: string) => {
  const colors = Object.entries(theme?.extend?.colors?.media)
  const hash = media.length
  const colorIndex = Math.abs(hash) % colors.length
  return colors[colorIndex][1]
}


const TopicListItem = ({ topic }: { topic: string }) => {
  const color = getMediaColor(topic);
  return (
    <View
      style={{backgroundColor: color}}
      className={`h-24 rounded-xl pl-5 pr-1 pt-5 w-44`}
    >
      <Text className="text-lg font-black text-shyam-primary text-wrap">
        {topic}
      </Text>
    </View>
  )
}

// End of TopicListItem.tsx

// AuthorListItem.tsx
import { Image } from 'react-native';
const AuthorListItem = ({ author, image }: { author: string, image: string }) => {
  return (
    <View className="bg-shyam-background-offset flex h-20 w-64 flex-row items-center gap-2.5 rounded-xl px-2.5">
      <View className="overflow-hidden bg-gray-300 h-14 w-14 rounded-xl">
        <Image source={{ uri: image }} style={{ width: 56, height: 56 }} />
      </View>
      <View className="flex-1">
        {/* TODO: Text Ellipsis is not working */}
        <Text className="text-base leading-5 text-shyam-primary text-ellipsis">
          {author}
        </Text>
      </View>
    </View>
  )
}
// End of AuthorListItem.tsx

/*
  background: linear-gradient(to right, rgb(60, 13, 20) 3px, rgba(255, 255, 255, 0.5) 5px, rgba(255, 255, 255, 0.25) 7px, rgba(255, 255, 255, 0.25) 10px, transparent 12px, transparent 16px, rgba(255, 255, 255, 0.25) 17px, transparent 22px), url(https://images-na.ssl-images-amazon.com/images/I/51pnouuPO5L.jpg);
  box-shadow: 0 0 5px -1px black, inset -1px 1px 2px rgba(255, 255, 255, 0.5);

*/

// BookListItem.tsx
const BookListItem = ({ title, author, image }: { title: string, author?: string, image?: string }) => {
  const color = getMediaColor(title);
  return (
    <View
      style={{
        backgroundImage: `
          linear-gradient(90deg, #191919 0%, rgba(25, 25, 25, 0) 2.58%, rgba(25, 25, 25, 0.5) 5.15%, rgba(25, 25, 25, 0) 8%, rgba(25, 25, 25, 0) 100%),
          linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%),
          linear-gradient(color-mix(in srgb, ${color} 70%, transparent 100%), color-mix(in srgb, ${color} 70%, transparent 100%)),
          url(${image})`,
        backgroundBlendMode: 'overlay, normal, normal, normal',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // boxShadow: '0 0 5px -1px black, inset -1px 1px 2px rgba(255, 255, 255, 1)',
      }}
      className="flex flex-col justify-end h-48 gap-1 pb-6 pl-6 rounded-md w-36"
    >
      <View>
        <Text className="text-lg font-black leading-5 text-shyam-primary">
          {title}
        </Text>
        <Text className="text-shyam-primary text-[10px] font-medium">
          {author}
        </Text>
      </View>
    </View>
  )
}

export function HomeScreen() {
  return (
    <View className="items-center justify-center flex-1 p-3">
      <View className="w-full space-y-5">
        <SongListItem
          title="Sri Gurvaṣṭakam"
          author="Visvanatha Cakravarti Thakura"
          uid="n9"
          tags={['Hare', 'Krishna', 'Bhaktivinoda', 'Thakura']}
        />
        <TopicListItem topic="Śrī Gaura" />
        <AuthorListItem
          author="Śrīla Bhaktivinoda Thakura"
          image="https://premadharma.org/wp-content/uploads/2017/01/Srila-Bhakti-Vinod-Thakur-1.jpg"
        />
        <BookListItem
          title="Sri Caitanya Caritamrita"
          author="Krishnadasa Kaviraja Goswami"
          // image="https://krsnakatha.com/img/guru-parampara/Krishnadasa-Kaviraja-Goswami.jpg"
        />
      </View>
      <H1>Welcome to Solito.</H1>
      <View className="max-w-xl">
        <P className="text-center">
          Here is a basic starter to show you how you can navigate from one
          screen to another. This screen uses the same code on Next.js and React
          Native.
        </P>
        <P className="text-center">
          Solito is made by{' '}
          <A
            href="https://twitter.com/fernandotherojo"
            hrefAttrs={{
              target: '_blank',
              rel: 'noreferrer',
            }}
          >
            Fernando Rojo
          </A>
          .
        </P>
        <P className="text-center">
          NativeWind is made by{' '}
          <A
            href="https://twitter.com/mark__lawlor"
            hrefAttrs={{
              target: '_blank',
              rel: 'noreferrer',
            }}
          >
            Mark Lawlor
          </A>
          .
        </P>
      </View>
      <View className="h-[32px]" />
      <Row className="space-x-8">
        <TextLink href="/user/fernando">Regular Link</TextLink>
        <MotiLink
          href="/user/fernando"
          animate={({ hovered, pressed }) => {
            'worklet'

            return {
              scale: pressed ? 0.95 : hovered ? 1.1 : 1,
              rotateZ: pressed ? '0deg' : hovered ? '-3deg' : '0deg',
            }
          }}
          transition={{
            type: 'timing',
            duration: 150,
          }}
        >
          <Text selectable={false} className="text-base font-bold">
            Moti Link
          </Text>
        </MotiLink>
      </Row>
    </View>
  )
}
