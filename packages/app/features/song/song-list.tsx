import React from 'react';

interface Song {
  title: string;
  author: string;
  uid: string;
}

interface SongListProps {
  songs: Song[];
}

const SongList: React.FC<SongListProps> = ({ songs }) => {
  // Group songs by the first letter of the title
  const groupedSongs: { [key: string]: Song[] } = {};

  songs.forEach((song) => {
    const firstLetter = song.title.charAt(0).toUpperCase();
    groupedSongs[firstLetter] = groupedSongs[firstLetter] || [];
    groupedSongs[firstLetter].push(song);
  });

  // Get an array of alphabet letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4">Song List</h2>
      <div className="flex">
        <div className="mr-4">
          {/* Scrollable alphabet navigation */}
          <div className="overflow-y-auto max-h-60">
            {alphabet.map((letter) => (
              <a key={letter} href={`#${letter}`} className="block text-blue-500 font-semibold py-1">
                {letter}
              </a>
            ))}
          </div>
        </div>
        <div className="flex-1">
          {/* Song list grouped by first letter */}
          {alphabet.map((letter) => (
            <div key={letter} id={letter}>
              <h3 className="text-xl font-semibold mt-4">{letter}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {groupedSongs[letter] &&
                  groupedSongs[letter].map((song) => (
                    <div key={song.uid} className="bg-white rounded-lg overflow-hidden shadow-md">
                      <img src='https://e0.pxfuel.com/wallpapers/280/602/desktop-wallpaper-chaitanya-mahaprabhu-thumbnail.jpg' alt={song.title} className="w-full h-32 object-cover" />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{song.title}</h3>
                        <p className="text-gray-600">{song.author}</p>
                        <p className="text-gray-500 mt-2">UID: {song.uid}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SongList;
