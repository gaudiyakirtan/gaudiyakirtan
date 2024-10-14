import { A, H1, P, Text, TextLink } from 'app/design/typography'
import { Row } from 'app/design/layout'
import { View } from 'app/design/view'
import { MotiLink } from 'solito/moti'
import { ScreenScrollView } from 'app/features/ScreenScrollView'
import SongListItem from 'app/components/SongListItem'
import TopicListItem from 'app/components/TopicListItem'
import AuthorListItem from 'app/components/AuthorListItem'
import BookListItem from 'app/components/BookListItem'
import VerseListItem from 'app/components/VerseListItem'

export function HomeScreen() {
  return (
    <ScreenScrollView useWindowScrolling={true}>
      <View className="items-center justify-center flex-1 p-3">
        <View className="w-full">
          <SongListItem
            title="Sri Gurvaṣṭakam Sri Gurvaṣṭakam Sri Gurvaṣṭakam"
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
            title="Kalyana Kalpataru"
            author="Śrīla Bhaktivinoda Thakura"
            image="https://swamitripurari.com/wp-content/uploads/2011/01/nama-dharma.jpg"
          />
          <VerseListItem
            key={0}
            original={['অক্রোধ পরমানন্দ নিত্যানন্দ-রায়', 'অভিমান শূন্য নিতাই নগরে বেড়ায়']}
            transletaration={['akrodha paramānanda nityānanda-rāya', 'abhimāna śūnya nitāi nagare beḓāya']}
            word_to_word={[
              ['akrodha', 'free from anger'],
              ['paramānanda', 'supreme bliss'],
              ['nityānanda', 'Nityānanda Prabhu'],
              ['rāya', 'noble'],
              ['abhimāna', 'false ego'],
              ['śūnya', 'devoid'],
              ['nitāi', 'Nitāi'],
              ['nagare', 'throughout the town'],
              ['beḓāya', 'wanders'],
            ]}
            translation="The noble Nityānanda Prabhu, the personification of supreme transcendental bliss, is never angry. Devoid of all false ego, He wanders throughout the town."
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
    </ScreenScrollView>
  )
}
