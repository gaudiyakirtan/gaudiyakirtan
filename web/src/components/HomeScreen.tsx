import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { IExtendedSong } from '../models/Song'
import { IAuthor } from '../models/Author'
import { ITopic } from '../models/Topic'
import { IBook } from '../models/Book'
import { SongsSection } from './SongsSection'
import { AuthorsSection } from './AuthorsSection'
import { TopicsSection } from './TopicsSection'
import { BooksSection } from './BooksSection'

// Sample data - In a real implementation, this would come from an API or context
import { sampleSongs, sampleAuthors, sampleTopics, sampleBooks } from '../data/sampleData'

export const HomeScreen: React.FC = () => {
  const router = useRouter()
  const [songs] = useState<IExtendedSong[]>(sampleSongs)
  const [authors] = useState<IAuthor[]>(sampleAuthors)
  const [topics] = useState<ITopic[]>(sampleTopics)
  const [books] = useState<IBook[]>(sampleBooks)
  const [language] = useState('en')

  // Navigation handlers
  const handleSongClick = (song: IExtendedSong) => {
    router.push(`/songs/${song.id}`)
  }

  const handleAuthorClick = (author: IAuthor) => {
    console.log('Navigate to author:', author.id)
    // router.push(`/authors/${author.id}`)
  }

  const handleTopicClick = (topic: ITopic) => {
    console.log('Navigate to topic:', topic.name)
    // router.push(`/topics/${encodeURIComponent(topic.name)}`)
  }

  const handleBookClick = (book: IBook) => {
    console.log('Navigate to book:', book.id)
    // router.push(`/books/${book.id}`)
  }

  return (
    <div className="w-full max-w-screen-2xl mx-auto pb-20 pt-4">
      {/* Header/Search area would go here */}
      
      {/* Topics Section */}
      <TopicsSection 
        topics={topics}
        onTopicClick={handleTopicClick}
      />
      
      {/* Authors Section */}
      <AuthorsSection 
        authors={authors}
        onAuthorClick={handleAuthorClick}
      />
      
      {/* Books Section */}
      <BooksSection 
        books={books}
        onBookClick={handleBookClick}
      />
      
      {/* Songs Section */}
      <SongsSection 
        songs={songs}
        title="Popular Songs"
        language={language}
        onSongClick={handleSongClick}
      />
    </div>
  )
}