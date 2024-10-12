import { Text } from 'app/design/typography'
import { View } from 'app/design/view'
import { Image } from 'react-native'

const AuthorListItem = ({
  author,
  image,
}: {
  author: string
  image: string
}) => {
  return (
    <View className="flex flex-row items-center w-64 h-20 bg-shyam-background-offset rounded-xl px-2.5">
      <View className="mr-2 overflow-hidden bg-gray-300 h-14 w-14 rounded-xl">
        <Image source={{ uri: image }} style={{ width: 56, height: 56 }} />
      </View>
      <View className="flex-1">
        <Text
          className="text-base leading-5 text-shyam-primary"
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {author}
        </Text>
      </View>
    </View>
  )
}

export default AuthorListItem
