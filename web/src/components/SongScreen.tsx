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
    <div className="w-full max-w-screen-md mx-auto pt-4 pb-20">
      {/* Song Header */}
      <div className="px-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary)] mb-2">
          {title}
        </h1>
        
        <div className="flex items-center justify-between">
          <p className="text-base text-[var(--secondary)]">
            {author}
          </p>
          
          {/* Audio badge */}
          {song.audio && (
            <div className="bg-[var(--accent)] bg-opacity-15 text-[var(--accent)] px-3 py-1 rounded-full text-xs font-medium flex items-center">
              <span className="mr-1">🎵</span> Audio
            </div>
          )}
        </div>
        
        {/* Tags */}
        {song.tags && song.tags.length > 0 && (
          <div className="flex flex-wrap mt-3 gap-2">
            {song.tags.map((tag, index) => (
              <span 
                key={`tag-${index}`} 
                className="bg-[var(--background-offset)] text-[var(--tertiary)] px-3 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Divider */}
      <div className="h-px bg-[var(--border)] mb-6"></div>
      
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