import React from "react";
import { ISong, IExtendedSong } from "../models/Song";
import { MusicNote } from "./icons/MusicNote";
import { Tag } from "./ui/Tag";

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
  const uid = (song as any).uid || id;

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
          <Tag 
            text={uid} 
            variant="default" 
            size="small" 
            uppercase={true} 
            className="mr-auto flex-shrink-0"
          />
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
          <Tag
            key={index}
            text={tag}
            variant="default"
            size="normal"
            className="mx-1"
          />
        ))}
      </div>
    </div>
  );
};

export default SongListItem;