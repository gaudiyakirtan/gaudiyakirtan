import { A, H1, P, Text, TextLink } from 'app/design/typography'
import { Row } from 'app/design/layout'
import { View } from 'app/design/view'

import songList from 'app/assets/songs/_list.json'
import {transformSongTitle, strip, deaccent } from 'app/utils/transliteration/DataTransform'
import { SectionList, TextInput, TouchableOpacity } from 'react-native'
import { use, useEffect, useState } from 'react'
import { ScrollView } from 'moti'
import { fuzzy, getScore } from 'app/utils/transliteration/TransliterationUtils'
import Fuse from 'fuse.js'


const userLanguage = 'eng';

export function HomeScreen() {
  // sections is a map of first letter of song title to array of songs
  const sections = new Map();
  let deaccentSongTitles: { title: string; uid: string; }[] = [];
  let fuzzySongTitles = [];

  // addes song to sections map
  songList.forEach((song, idx) => {
    let title = transformSongTitle(song.title, song.language, userLanguage);
    let s = {
    transliteratedTitle: title,
    deaccentedTitle: title,
    songData: song,
    }


    deaccentSongTitles.push({
      "title": s.transliteratedTitle,
      "uid": song.uid,
    });
    // fuzzySongTitles.push(fuzzy(s.deaccentedTitle));

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
  
  // search function
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState('');
  // let result = [];
  const [result, setResult] = useState([]);
  // let fuzeResult = [];
  const [fuzeResult, setFuzeResult] = useState([]);
  // let ogResult = [];
  const [ogResult, setOgResult] = useState([]);

  useEffect(() => {
    // result = fuse.search(search).splice(0, 10);
    setResult(fuse.search(search).splice(0, 10));

    let fuzSearch = fuzzy(search);
    // fuzeResult = fusefuze.search(fuzSearch).splice(0, 10);
    // setFuzeResult(fusefuze.search(fuzSearch).splice(0, 10));
    // ogResult = fuzzySongTitles.map((title, idx) => [title, getScore(title, fuzSearch)]).sort((a, b) => a[1] - b[1]).splice(0, 10);

        // if (fuzzySearchText.length > 0 && song.fuzzyTitle.includes(fuzzySearchText)) {
        //   const newEntry = { ...song };
        //   const score = TransliterationUtils.getScore(
        //     transliterate(song.title, song.language, UserLanguage.eng),
        //     searchText
        //   );
        //   if (score > 0.1) {
        //     const scoreString = `${1001 + Math.floor((1 - score) * 998)}`;
        //     newEntry.title = `${scoreString}${song.title}`;
        //     titleMatchedSongs.push(newEntry);
        //   }
        // }
    // setOgResult(fuzzySongTitles.map((title, idx) => [title, getScore(title, fuzSearch)]).sort((a, b) => a[1] - b[1]).splice(0, 10));

    let lol = [];
    for (let title in deaccentSongTitles)
    {
        let score = `${1001 + Math.floor((1 - getScore(title, fuzSearch)) * 998)}${title}`;
        lol.push([title, score]);
    }

    lol = lol.sort((a, b) => a[1] < b[1] ? -1 : 1).splice(0, 10);
    // setOgResult(lol);

  },[search]);

  // useEffect(() => {
  // }, [result, fuzeResult, ogResult]);
  console.log(deaccentSongTitles);
  const fuse = new Fuse(deaccentSongTitles, {distance: 10, ignoreLocation: true, ignoreFieldNorm: true, keys: ['title']});
  // const fusefuze = new Fuse(fuzzySongTitles);

  return (
      <View className="bg-zinc-900">
      <View className="w-full max-w-4xl p-4 m-3 mx-auto rounded-lg shadow-md bg-zinc-800">
      <H1 className="text-center text-white">Gaudiya Kirtan</H1>
      <Text className="text-lg text-center text-zinc-400">A collection of Gaudiya Vaishnava kirtans</Text>



      <form className="max-w-md m-5 mx-auto">   
          <label for="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
          <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
              </div>
              <input onChange={(event) => setSearch(event.target.value)} type="search" id="default-search" className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg ps-10 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder='Search'/>
              </div>
      </form>


      {/* {searchResults.map((result, idx) => (
        // <Text key={idx}>{transformSongTitle(songList[result.refIndex]?.title, songList[result.refIndex]?.language, userLanguage)}</Text>
        <Text key={idx}>{result.item}</Text>
      ))} */}
      {result.map((result, idx) => (
            <TextLink className='text-lg text-center text-sky-500' href={`/song/${result.item.uid}`} key={idx}>
              {result.item.title}
            </TextLink>
      ))}
      
      {/* // <Text className='text-lg text-center text-sky-500' key={idx}>{result.item.title}</Text>))} */}
      {/* <Text>--------------------------</Text>
      {fuzeResult.map((result, idx) => (<Text key={idx}>{result.item}</Text>))}
      <Text>--------------------------</Text>
      {ogResult.map((result, idx) => (<Text key={idx}>{result[0]}{result[1]}</Text>))} */}



      {search.length == 0 ? sortedSections.map(([letter, song], idx) => (
        <View key={letter}>
          <Text id={letter} className="text-2xl text-center text-white">{letter}</Text>
          {song.map((songData, idx) => (
            <TextLink className='text-lg text-center text-sky-500' href={`/song/${songData.songData.uid}`} key={idx}>
              {songData.transliteratedTitle}
            </TextLink>
          ))}
        </View>
      )) : <></>}
    </View>
    </View>
  )
}