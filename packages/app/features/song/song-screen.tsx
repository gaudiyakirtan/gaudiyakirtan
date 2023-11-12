import { createParam } from 'solito'
import { TextLink } from 'solito/link'
import { Text } from 'app/design/typography'
import { View } from 'app/design/view'
import {transformSongTitle, transformAuthor} from 'app/utils/transliteration/DataTransform'
import ISong, { IVerse } from 'app/interfaces/ISong'
import Verse from 'app/features/song/Verse'
import requireSongList from 'app/assets/songs/_requireFile'


const { useParam } = createParam<{ uid: string }>()

const userLanguage = 'ger';

export function SongScreen() {
  const [uid] = useParam('uid');
  // TODO: Dynamically calling JSON based on uid dosn't work on app - works on web; something to do with webpack bundler
  // const song = require(`app/assets/songs/${uid}.json`);
  // Solved: By used _requireFile.tsx to require all songs and then use uid to get the song created by _requireFile.py
  const song = requireSongList[uid as keyof typeof requireSongList];

  const title = transformSongTitle(song.title, song.language, userLanguage);
  const author = transformAuthor(song.author, song.language, userLanguage);


  return (
    <View className="items-center justify-center flex-1">
      <Text className="mt-4 text-center">{title}</Text>
      <Text className="mt-4 text-center">{author}</Text>

      <View className="mt-4 text-center">
        {song.verses.map((v: IVerse, index) => (
        <>
          <Verse verse={v} songLanguage={song.language} userLanguage={userLanguage} hasSynonyms={song.has_synonyms} index={`${song.uid}.${index}`} />
        </>
        ))}
      </View>
    </View>
  )
}
