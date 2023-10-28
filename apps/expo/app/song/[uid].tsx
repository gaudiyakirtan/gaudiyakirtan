import { SongScreen } from 'app/features/song/song-screen'
import { ScrollView } from 'react-native-gesture-handler'
import { useLocalSearchParams } from 'expo-router'

export default function Song({ route }) {
  // return <ScrollView><SongScreen/></ScrollView>
  return <SongScreen/>
}


