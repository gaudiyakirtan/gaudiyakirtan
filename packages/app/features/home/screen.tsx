import { A, H1, P, Text, TextLink } from 'app/design/typography'
import { Row } from 'app/design/layout'
import { View } from 'app/design/view'

import songList from 'app/assets/songs/_list.json'
import {transformSongTitle, strip, deaccent } from 'app/utils/transliteration/DataTransform'
import { SectionList, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { ScrollView } from 'moti'

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

  return (
    <ScrollView ref={(ref) => setRef(ref)}>

      {sortedSections.map(([letter, song], idx) => (
          // <TouchableOpacity key={idx} onPress={() => scrollToLetter(letter)}>
            // <TextLink href={`#${letter}`} key={idx}>{letter}</TextLink>
            <Text key={idx} onClick={()=>scrollHandler()}>{letter}</Text>
            // <Text className='text-center' key={idx}>{letter}</Text>
          // </TouchableOpacity>
      ))}

      {sortedSections.map(([letter, song], idx) => (
        <View key={letter}>
          <Text id={letter} className="text-center">{letter}</Text>
          {song.map((songData, idx) => (
            <TextLink className='text-center' href={`/song/${songData.songData.uid}`} key={idx}>
              {songData.transliteratedTitle}
            </TextLink>
          ))}
        </View>
      ))}
    </ScrollView>
  )
}