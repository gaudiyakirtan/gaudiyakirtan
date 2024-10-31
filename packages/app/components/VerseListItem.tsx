import React from 'react'
import { Text } from 'app/design/typography'
import { View } from 'app/design/view'
import { StyleSheet } from 'react-native'

interface IVerse {
  language?: string
  original: string[]
  transletarations: ITransletaration[]
  word_to_words: IWordToWord[]
  translations: ITranslation[]
  index?: number
}
interface ITransletaration {
  language: string
  text: string[]
}

interface ITranslation {
  language: string
  text: string
}

interface IWordToWord {
  language: string
  words: string[][]
}

const user_langauge = 'en'

const VerseListItem = ({
  language,
  original,
  transletarations,
  word_to_words,
  translations,
  index,
}: IVerse) => {
  const transletaration = transletarations.find(
    (transletaration) => transletaration.language === user_langauge,
  )?.text || []

  const translation = translations.find(
    (translation) => translation.language === user_langauge,
  )?.text || ''

  const word_to_word = word_to_words.find(
    (word_to_word) => word_to_word.language === user_langauge,
  )?.words || []

  return (
    <View
      key={index}
      className="w-full max-w-3xl m-3 mx-auto space-y-2.5 rounded-lg bg-gaur-background dark:bg-shyam-background"
    >
      {/* original script language */}
      <View>
        {original.map((line, index) => (
          <Text
            className="text-sm text-center text-gaur-neutral dark:text-shyam-neutral"
            key={index}
          >
            {line}
          </Text>
        ))}
      </View>

      {/* user language script*/}
      <View>
        {transletaration.map((line, index) => (
          <Text
            className="text-sm text-center text-gaur-highlight font-nor dark:text-shyam-highlight"
            key={index}
          >
            {line}
          </Text>
        ))}
      </View>

      {/* word-to-word */}
      <View style={styles.container}>
        {word_to_word.map((pair, index) => (
          <React.Fragment key={index}>
            <Text className="text-sm text-gaur-highlight dark:text-shyam-highlight">
              {pair[0]}
              <Text className="text-sm text-gaur-primary dark:text-shyam-primary">
                {' '}
                -{' '}
              </Text>
            </Text>
            <Text className="text-sm text-gaur-primary dark:text-shyam-primary">
              {pair[1]}
              {index < word_to_word.length - 1 ? '; ' : ''}
            </Text>
          </React.Fragment>
        ))}
      </View>

      {/* translation */}
      <Text className="text-sm font-medium text-gaur-primary dark:text-shyam-primary">
        {translation}
      </Text>
    </View>
  )
}
  
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
  })

export { VerseListItem, IVerse }
