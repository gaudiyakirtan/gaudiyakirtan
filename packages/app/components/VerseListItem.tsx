import { Text } from 'app/design/typography'
import { View } from 'app/design/view'
import { StyleSheet } from 'react-native'

interface IVerse {
    original: string[]
    transletaration: string[]
    word_to_word: string[][]
    translation: string
    index?: number
}

const VerseListItem = ({
  original,
  transletaration,
  word_to_word,
  translation,
  index,
}: IVerse) => (
  <View
    key={index}
    className="w-full max-w-4xl p-4 m-3 mx-auto space-y-2.5 rounded-lg shadow-md bg-gaur-background dark:bg-shyam-background"
  >
    {/* original script language */}
    <View>
        {original.map((line, index) => (
        <Text className="text-xs text-center text-gaur-neutral dark:text-shyam-neutral" key={index}>
            {line}
        </Text>
        ))}
    </View>

    {/* user language script*/}
    <View>
        {transletaration.map((line, index) => (
        <Text className="text-xs text-center text-gaur-highlight font-nor dark:text-shyam-highlight" key={index}>
            {line}
        </Text>
        ))}
    </View>

    {/* word-to-word */}
    <View style={styles.container}>
      {word_to_word.map((pair, index) => (
        <Text key={index} style={styles.pairText} className='text-xs'>
          <Text className='text-xs text-gaur-highlight dark:text-shyam-highlight'>{pair[0]}</Text><Text className='text-gaur-primary dark:text-shyam-primary'> - {pair[1]}{index < word_to_word.length - 1 ? '; ' : ''}</Text>
        </Text>
      ))}
    </View>

    {/* translation */}
    <Text className="text-xs font-medium text-gaur-primary dark:text-shyam-primary">{translation}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pairText: {
  },
})

export default VerseListItem
