import { Text} from 'app/design/typography'
import { View } from 'app/design/view'
// import { Music } from 'lucide-react-native'

// TODO: Add lucide-react-native
// gluestack has it working so it should be easy to add it to the monorepo (https://github.com/gluestack/solito-head-starter-kit/blob/c24d348725b24a1e3b6bc59dff2a7b381b4642d1/apps/next/next.config.js#L6)

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
    <View className="bg-shyam-background-offset flex h-14 w-full flex-row items-center rounded-xl px-2.5">
      <View className="flex-1 min-w-0">
        <View className="flex flex-row items-center w-full">
          <Text className="mr-1.5 text-sm flex-inital text-shyam-primary" numberOfLines={1} ellipsizeMode="tail" style={{flexShrink: 1 }}> {/* instead of truncate */}
            {title}
          </Text>
          <View className="bg-shyam-neutral/25 flex-shrink-0 rounded-xl px-2.5 py-0.5">
            <Text className="text-shyam-neutral text-[10px] font-medium uppercase m-auto">
              {uid}
            </Text>
          </View>
        </View>
        <View className="flex flex-row items-center">
          <Text className="text-sm text-shyam-neutral mr-1.5" numberOfLines={1} ellipsizeMode="tail" style={{flexShrink: 1 }}>
            {author}
          </Text>
          {/* <Music size={12} className="flex-none text-shyam-neutral" /> */}
        </View>
      </View>
      <View className="flex-row-reverse flex-shrink-0 hidden ml-2 overflow-hidden sm:flex">
        {tags.reverse().map((tag, index) => (
          <View
            key={index}
            className="bg-shyam-neutral/25 rounded-[10px] px-2.5 py-1 mx-1"
          >
            <Text className="text-xs text-shyam-neutral">{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default SongListItem
