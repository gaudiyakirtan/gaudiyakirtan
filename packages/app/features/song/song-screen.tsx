import { createParam } from 'solito'
import { TextLink } from 'solito/link'
import { Text } from 'app/design/typography'
import { View } from 'app/design/view'
import DataTransform from 'app/utils/transliteration/DataTransform'
import ISong, { IVerse } from 'app/interfaces/ISong'
import Verse from 'app/features/song/Verse'


const { useParam } = createParam<{ uid: string }>()

const userLanguage = 'eng';

export function SongScreen() {
  const [uid] = useParam('uid')
  // TODO: Dynamically calling JSON based on uid dosn't work on app - works on web; something to do with webpack bundler
  // const song = require(`app/assets/songs/${uid}.json`);
  const song: ISong = require(`app/assets/songs/R23.json`);
  const title = DataTransform.transformSongTitle(song.title, song.language, userLanguage);
  const author = DataTransform.transformAuthor(song.author, song.language, userLanguage);


  return (
    <View className="items-center justify-center flex-1">
      {/* <Text className="mb-4 font-bold text-center">{`User ID: ${uid}`}</Text> */}
      {/* <TextLink href="/">👈 Go Home</TextLink> */}
      <Text className="mt-4 text-center">{title}</Text>
      <Text className="mt-4 text-center">{author}</Text>

      <View className="mt-4 text-center">
        {song.verses.map((v: IVerse, index) => (
        <>
          <Verse verse={v} songLanguage={song.language} userLanguage={userLanguage} hasSynonyms={song.has_synonyms} key={`${song.uid}.${index}`} />
          <Text className='text-center'>----------------</Text>
        </>
        ))}
      </View>
    </View>
  )
}
