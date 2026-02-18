import React from "react";
import { ISong, IExtendedSong } from "../models/Song";
import { MusicNote } from "./icons/MusicNote";

interface ISongListItemProps {
  song: ISong | IExtendedSong;
  onClick?: () => void;
  language?: string;
}

export const SongListItem: React.FC<ISongListItemProps> = ({
  song,
  onClick,
  language = "en",
}) => {
  // Check if song is an extended song with title array
  const isExtendedSong = "title" in song && Array.isArray(song.title);

  // Get display title
  let displayTitle = "";
  if (isExtendedSong) {
    const extSong = song as IExtendedSong;
    displayTitle =
      extSong.title.find((t) => t.language === language)?.title ||
      extSong.title[0]?.title ||
      "Unknown Title";
  } else {
    displayTitle = (song as ISong).title;
  }

  // Get display author
  let displayAuthor = "";
  if (isExtendedSong) {
    const extSong = song as IExtendedSong;
    displayAuthor =
      extSong.author?.find((a) => a.language === language)?.author ||
      (extSong.author && extSong.author.length > 0
        ? extSong.author[0].author
        : "Unknown");
  } else {
    displayAuthor = (song as ISong).author;
  }

  // Song ID and audio status are the same in both interfaces
  const { id, audio, tags } = song;
  const uid = 'uid' in song ? song.uid : id;

  return (
    <div
      className="flex h-14 w-full flex-row items-center rounded-xl px-2.5 cursor-pointer hover:bg-[var(--background-offset)]"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-row items-center w-full">
          <span
            className="mr-1.5 text-sm text-[var(--primary)] whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ maxWidth: "70%" }}
          >
            {displayTitle}
          </span>
          <div className="flex-shrink-0 rounded-xl px-2.5 py-0.5 bg-[var(--neutral)]/20 mr-auto flex items-center">
            <span className="text-[var(--neutral)] text-[10px] font-medium uppercase">
              {uid}
            </span>
          </div>
        </div>
        <div className="flex flex-row items-center">
          <span
            className="text-sm text-[var(--neutral)] mr-1.5 whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ maxWidth: "85%" }}
          >
            {displayAuthor}
          </span>
          {audio && (
            <MusicNote size={12} className="flex-none text-[var(--neutral)]" />
          )}
        </div>
      </div>
      <div className="flex-row-reverse flex-shrink-0 hidden ml-2 overflow-hidden sm:flex">
        {[...tags].reverse().map((tag, index) => (
          <div
            key={index}
            className="rounded-[10px] px-2.5 py-1 mx-1 bg-[var(--neutral)]/20 flex items-center"
          >
            <span className="text-xs text-[var(--neutral)]">{tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongListItem;