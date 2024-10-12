import { Text } from 'app/design/typography'
import { View } from 'app/design/view'
import { ImageBackground, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { getMediaColor } from 'app/tools/colors'

// BookListItem.tsx
interface BookListItemProps {
  title: string
  author?: string
  image?: string
}

const BookListItem: React.FC<BookListItemProps> = ({
  title,
  author,
  image,
}) => {
  const color = getMediaColor(title)

  const GradientWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    return (
      <ImageBackground
        source={{ uri: image }}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.container}>
          {/* Color Overlay Gradient */}
          <LinearGradient
            colors={[color, '#00' + color.slice(1)]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Vertical Bottom Gradient */}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Horizontal Left Gradient */}
          <LinearGradient
            colors={[
              '#191919',
              'rgba(25,25,25,0)',
              'rgba(25,25,25,0.5)',
              'rgba(25,25,25,0)',
              'rgba(25,25,25,0)',
            ]}
            locations={[0, 0.0258, 0.0515, 0.08, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.content}>{children}</View>
        </View>
      </ImageBackground>
    )
  }

  return (
    <GradientWrapper>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {author && <Text style={styles.author}>{author}</Text>}
      </View>
    </GradientWrapper>
  )
}

const styles = StyleSheet.create({
  imageBackground: {
    width: 144,
    height: 192,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageStyle: {
    borderRadius: 8,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  textContainer: {
    paddingLeft: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
    color: '#FFFFFF', // Replace with your primary color or variable
  },
  author: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF', // Replace with your primary color or variable
  },
})

export default BookListItem