import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PlaylistProvider } from './Playlist';

interface Props {
  children: React.ReactNode;
}

export const Provider: React.FC<Props> = ({ children }: Props) => {
  return (
    <SafeAreaProvider>
      <PlaylistProvider>
        {children}
      </PlaylistProvider>
    </SafeAreaProvider>
  );
};

export { usePlaylist } from './Playlist';
