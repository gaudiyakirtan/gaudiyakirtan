import { createParam } from 'solito'
import { TextLink } from 'solito/link'
import { Text } from 'app/design/typography'
import { View } from 'app/design/view'
import { use } from 'react'

const { useParam } = createParam<{ id: string }>()

export function UserDetailScreen() {
    // const [id] = useParam('id')
    const [id] = "123";

    return (
      <View className="items-center justify-center flex-1">
        <Text className="mb-4 font-bold text-center">{`User ID: ${id}`}</Text>
        <TextLink href="/">👈 Go Home</TextLink>
      </View>
    )
}
