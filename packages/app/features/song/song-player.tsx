import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProgressBar from 'react-native-progress/Bar';

interface SongPlayerProps {
  songTitle: string;
  artist: string;
  isPlaying: boolean;
  onPlayPausePress: () => void;
  onSkipPress: () => void;
  onPreviousPress: () => void;
  progress: number; // Progress in percentage (0-100)
}

const SongPlayer: React.FC<SongPlayerProps> = ({
  songTitle,
  artist,
  isPlaying,
  onPlayPausePress,
  onSkipPress,
  onPreviousPress,
  progress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{songTitle}</Text>
      <Text style={styles.artist}>{artist}</Text>

      <ProgressBar
        progress={progress / 100}
        width={null} // Takes full width
        height={10}
        color="#3498db"
        style={styles.progressBar}
      />

      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={onPreviousPress} style={styles.controlButton}>
          <Text>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onPlayPausePress} style={styles.controlButton}>
          <Text>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSkipPress} style={styles.controlButton}>
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 16,
    marginVertical: 4,
  },
  progressBar: {
    marginTop: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  controlButton: {
    padding: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
});

export default SongPlayer;
