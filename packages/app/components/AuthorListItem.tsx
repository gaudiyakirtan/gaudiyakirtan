import { Text } from 'app/design/typography'
import { View } from 'app/design/view'
import { Image } from 'react-native'
import { styled } from 'nativewind'

interface IAuthorListItem {
  author: string
  image: string
}

const _AuthorListItem = ({
  author,
  image,
}: IAuthorListItem) => {
  return (
    <View className="flex flex-row items-center w-56 h-20 bg-gaur-background-offset dark:bg-shyam-background-offset rounded-xl px-2.5">
      <View className="mr-2 overflow-hidden h-14 w-14 rounded-xl">
        <Image source={{ uri: image }} style={{ width: 56, height: 56 }} />
      </View>
      <View className="flex-1">
        <Text
          className="text-base leading-5 dark:text-shyam-primary text-gaur-primary"
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {author}
        </Text>
      </View>
    </View>
  )
}

export const AuthorListItem = styled(_AuthorListItem)
export type { IAuthorListItem };
