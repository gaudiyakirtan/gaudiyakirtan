import React, { useState } from 'react'
import { IExtendedSong } from '../models/Song'
import { VerseListItem } from './VerseListItem'

interface SongScreenProps {
  song: IExtendedSong
  language?: string
}

export const SongScreen: React.FC<SongScreenProps> = ({
  song,
  language = 'en'
}) => {
  const [selectedLanguage] = useState(language)
  
  // Get the title in the selected language, or default to first title
  const title = song.title.find(t => t.language === selectedLanguage)?.title || song.title[0].title
  
  // Get the author in the selected language, or default to first author
  const author = song.author?.find(a => a.language === selectedLanguage)?.author || 
                (song.author && song.author.length > 0 ? song.author[0].author : 'Unknown')
  
  return (
    <div className="w-full max-w-screen-md pt-4 mx-auto">
      {/* Song Header */}
      <div className="flex flex-col items-center gap-1 mb-3">
        <h1 className="text-3xl text-[var(--highlight)]">
          {title}
        </h1>
        
        <p className="text-lg text-[var(--primary)]">
          {author}
        </p>
        
        <div className="bg-[var(--neutral)]/25 rounded-xl px-2.5 py-0.5">
          <p className="text-[var(--neutral)] text-[10px] font-medium uppercase m-auto">
            {song.uid}
          </p>
        </div>
      </div>
          
      {/* Verses */}
      <div>
        {song.verses && song.verses.map((verse, index) => (
          <VerseListItem 
            key={`verse-${index}`}
            verse={verse}
            userLanguage={selectedLanguage}
          />
        ))}
      </div>
    </div>
  )
}