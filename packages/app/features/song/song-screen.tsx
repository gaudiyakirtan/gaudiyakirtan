import { createParam } from 'solito'
import { TextLink } from 'solito/link'
import { Text } from 'app/design/typography'
import { View } from 'app/design/view'


const { useParam } = createParam<{ uid: string }>()

export function SongScreen() {
  const [uid] = useParam('uid')
  // TODO: Dynamically calling JSON based on uid dosn't work on app - works on web; something to do with webpack bundler
  const song = require(`app/assets/songs/${uid}.json`);

  return (
    <View className="items-center justify-center flex-1">
      <Text className="mb-4 font-bold text-center">{`User ID: ${uid}`}</Text>
      <TextLink href="/">👈 Go Home</TextLink>
      <Text className="mt-4 text-center">{song.title}</Text>
      <Text className="mt-4 text-center">{song.author}</Text>
    </View>
  )
}
