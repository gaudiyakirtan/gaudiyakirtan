import { A, H1, P, Text, TextLink } from 'app/design/typography'
import { Row } from 'app/design/layout'
import { View } from 'app/design/view'

import songList from 'app/assets/songs/_list.json'
import {transformSongTitle, strip, deaccent } from 'app/utils/transliteration/DataTransform'
import { SectionList, TouchableOpacity , Image, StyleSheet} from 'react-native'
import { useState } from 'react'
import { ScrollView } from 'moti'
import SongList from '../song/song-list'
import { Playlist } from '../song/Playlist';
import {Colors} from '../../constants/Colors';

const userLanguage = 'eng';

export function HomeScreen() {
  // sections is a map of first letter of song title to array of songs
  const sections = new Map();
  const [ref, setRef]= useState(null);

  // addes song to sections map
  songList.forEach((song, idx) => {
    let s = {
    transliteratedTitle: transformSongTitle(song.title, song.language, userLanguage),
    songData: song,
    }

    let firstLetter = deaccent(strip(s.transliteratedTitle).charAt(0)).toUpperCase();
    if (sections.hasOwnProperty(firstLetter)) {
      sections[firstLetter].push(s);
    } else {
      sections[firstLetter] = [s];
    }
  });

  // sorts sections by first letter
  let sortedSections = Object.keys(sections)
    .sort()
    .map(
      (letter, idx) => [letter, sections[letter].sort((a, b) => a.transliteratedTitle.localeCompare(b.transliteratedTitle))]);
  
  const scrollHandler = () => {
    ref.scrollTo({
      x: 0,
      y: sortedSections.length-1,
      animated: false,
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
  });
  /* 
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: 50,
      height: 50,
      resizeMode: 'cover', // or 'contain' depending on your needs
    },
  }); */
  return (
    <ScrollView ref={(ref) => setRef(ref)}>
   {/*    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {songList.map((song) => (
                    <div key={song.uid} className="bg-white rounded-lg overflow-hidden shadow-md">
                      <a href={`/song/${song.uid}`}>
                      <img src='https://e0.pxfuel.com/wallpapers/280/602/desktop-wallpaper-chaitanya-mahaprabhu-thumbnail.jpg' alt={song.title} className="w-full h-32 object-cover" /><div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{song.title}</h3>
                        <p className="text-gray-600">{song.author}</p>
                        <p className="text-gray-500 mt-2">UID: {song.uid}</p>
                      </div>
                      </a>
                    </div>
                  ))}
              </div> */}

{/* 
      {sortedSections.map(([letter, song], idx) => (
          // <TouchableOpacity key={idx} onPress={() => scrollToLetter(letter)}>
            // <TextLink href={`#${letter}`} key={idx}>{letter}</TextLink>
            <Text key={idx} onClick={()=>scrollHandler()}>{letter}</Text>
            // <Text className='text-center' key={idx}>{letter}</Text>
          // </TouchableOpacity>
      ))}
 */}
{/*      {sortedSections.map(([letter, song], idx) => (
        <View key={letter} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <Text id={letter} className="text-center">{letter}</Text>
          {song.map((songData, idx) => (
             <>
             <Image
              style={styles.image}
              source={{ uri: 'https://e0.pxfuel.com/wallpapers/280/602/desktop-wallpaper-chaitanya-mahaprabhu-thumbnail.jpg' }}
            />
            <TextLink className="text-lg font-semibold mb-2" href={`/song/${songData.songData.uid}`} key={idx}>
                {songData.transliteratedTitle}
              </TextLink>
              </>
          ))}
        </View>
      ))} */}

       <View style={styles.container}>
          <Playlist />
          {/* <Player /> */}
        </View>

    </ScrollView>
  )
}