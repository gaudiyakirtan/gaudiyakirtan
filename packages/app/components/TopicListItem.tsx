import { Text } from 'app/design/typography'
import { View } from 'app/design/view'
import { getMediaColor } from 'app/tools/colors'

const TopicListItem = ({ topic }: { topic: string }) => {
  const color = getMediaColor(topic) || '#FFFFFF' // default to white if color is invalid
  return (
    <View
      style={{ backgroundColor: color }}
      className={`h-24 rounded-xl pl-5 pr-1 pt-5 w-44`}
    >
      <Text className="text-lg font-black text-shyam-primary text-wrap">
        {topic}
      </Text>
    </View>
  )
}

export default TopicListItem