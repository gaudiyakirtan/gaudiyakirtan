import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

import { tracks, playlists } from '../../../data';

import { Colors } from 'app/constants';
import { usePlaylist } from 'app/provider';

import { Header } from './Header';
import { Title } from './Title';
import { Tabbar } from './Tabbar';
import { Lists } from './Lists';

export const Playlist = () => {
  const { setLists, setTracks } = usePlaylist();

  useEffect(() => {
    setLists(playlists);
    setTracks(
      tracks.map((item) => ({
        ...item,
        id: String(item.id),
        url: item.source,
      })),
    );
  }, []);

  return (
    <View style={styles.container}>
      <Header />
      <Title />
      <Tabbar />
      <Lists />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: initialWindowMetrics?.insets.top ?? 0
  },
  text: {
    fontSize: 40,
    color: 'white',
  },
});
