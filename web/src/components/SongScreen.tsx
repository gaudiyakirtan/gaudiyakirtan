import React, { useState, useEffect, useRef } from 'react'
import { IExtendedSong } from '../models/Song'
import { VerseListItem } from './VerseListItem'

interface SongScreenProps {
  song: IExtendedSong
  language?: string
}

const BOOKMARKED_SONG_IDS = ['N3', 'S1', 'E4']

export const SongScreen: React.FC<SongScreenProps> = ({
  song,
  language = 'en'
}) => {
  const [selectedLanguage] = useState(language)
  const [fontSize, setFontSize] = useState(14)
  const [showOriginal, setShowOriginal] = useState(true)
  const [showTransliteration, setShowTransliteration] = useState(true)
  const [showWordToWord, setShowWordToWord] = useState(true)
  const [showTranslation, setShowTranslation] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showReaderSettings, setShowReaderSettings] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [copied, setCopied] = useState(false)
  const readerRef = useRef<HTMLDivElement>(null)
  const queueRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsBookmarked(BOOKMARKED_SONG_IDS.includes(song.uid))
  }, [song.uid])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (readerRef.current && !readerRef.current.contains(e.target as Node)) {
        setShowReaderSettings(false)
      }
      if (queueRef.current && !queueRef.current.contains(e.target as Node)) {
        setShowQueue(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const title = song.title.find(t => t.language === selectedLanguage)?.title || song.title[0].title
  const author = song.author?.find(a => a.language === selectedLanguage)?.author ||
                (song.author && song.author.length > 0 ? song.author[0].author : 'Unknown')

  const handleShare = async () => {
    const url = `https://gaudiyakirtan.com/songs/${song.uid}`
    const text = `${title} by ${author}\n${url}`
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="w-full max-w-screen-md pt-4 mx-auto">
      {/* Action Bar */}
      <div className="flex items-center justify-end gap-3 px-4 mb-4">
        {/* Queue */}
        <div className="relative" ref={queueRef}>
          <button
            onClick={() => { setShowQueue(!showQueue); setShowReaderSettings(false) }}
            className="p-2 rounded-lg hover:bg-[var(--neutral)]/10 text-[var(--highlight)]"
            title="Tracks"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
          {showQueue && (
            <div className="absolute right-0 z-50 mt-1 bg-[var(--background)] border border-[var(--neutral)]/20 rounded-xl shadow-lg w-64 p-4">
              <p className="mb-3 text-sm font-semibold text-[var(--primary)]">Tracks</p>
              {song.audio ? (
                <div className="space-y-2">
                  <p className="text-sm text-[var(--primary)]">Track 1</p>
                  <hr className="border-[var(--neutral)]/20" />
                  <p className="text-sm text-[var(--primary)]">Track 2</p>
                </div>
              ) : (
                <p className="text-sm text-center text-[var(--neutral)]">No audio tracks available</p>
              )}
            </div>
          )}
        </div>

        {/* Aa Reader Settings */}
        <div className="relative" ref={readerRef}>
          <button
            onClick={() => { setShowReaderSettings(!showReaderSettings); setShowQueue(false) }}
            className="p-2 rounded-lg hover:bg-[var(--neutral)]/10 text-[var(--highlight)] font-bold text-base"
            title="Display settings"
          >
            Aa
          </button>
          {showReaderSettings && (
            <div className="absolute right-0 z-50 mt-1 bg-[var(--background)] border border-[var(--neutral)]/20 rounded-xl shadow-lg w-72 p-4">
              <p className="mb-2 text-xs font-semibold text-[var(--neutral)]">Font Size</p>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-[var(--neutral)]">A</span>
                <input
                  type="range"
                  min="10"
                  max="22"
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="flex-1 accent-[var(--highlight)]"
                />
                <span className="text-lg text-[var(--neutral)]">A</span>
              </div>
              <hr className="mb-3 border-[var(--neutral)]/20" />
              <p className="mb-2 text-xs font-semibold text-[var(--neutral)]">Display</p>
              <div className="space-y-2">
                {[
                  { label: 'Original Script', value: showOriginal, setter: setShowOriginal },
                  { label: 'Transliteration', value: showTransliteration, setter: setShowTransliteration },
                  { label: 'Synonyms', value: showWordToWord, setter: setShowWordToWord },
                  { label: 'Translation', value: showTranslation, setter: setShowTranslation },
                ].map(({ label, value, setter }) => (
                  <label key={label} className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-[var(--primary)]">{label}</span>
                    <div
                      onClick={() => setter(!value)}
                      className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${value ? 'bg-[var(--highlight)]' : 'bg-[var(--neutral)]/30'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bookmark */}
        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className="p-2 rounded-lg hover:bg-[var(--neutral)]/10 text-[var(--highlight)]"
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="p-2 rounded-lg hover:bg-[var(--neutral)]/10 text-[var(--highlight)] relative"
          title="Share"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {copied && (
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-[var(--primary)] text-[var(--background)] px-2 py-1 rounded whitespace-nowrap">
              Link copied!
            </span>
          )}
        </button>
      </div>

      {/* Song Header */}
      <div className="flex flex-col items-center gap-1 mb-3">
        <h1 className="text-3xl text-[var(--highlight)]">
          {title}
        </h1>
        <p className="text-lg text-[var(--primary)]">
          {author}
        </p>
      </div>

      {/* Verses */}
      <div>
        {song.verses && song.verses.map((verse, index) => (
          <VerseListItem
            key={`verse-${index}`}
            verse={verse}
            userLanguage={selectedLanguage}
            fontSize={fontSize}
            showOriginal={showOriginal}
            showTransliteration={showTransliteration}
            showWordToWord={showWordToWord}
            showTranslation={showTranslation}
          />
        ))}
      </div>
    </div>
  )
}
