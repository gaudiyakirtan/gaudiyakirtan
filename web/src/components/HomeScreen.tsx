import React, { useState } from "react";
import { useRouter } from "next/router";
import { IExtendedSong } from "../models/Song";
import { IAuthor } from "../models/Author";
import { ITopic } from "../models/Topic";
import { IBook } from "../models/Book";
import { SongsSection } from "./SongsSection";
import { AuthorsSection } from "./AuthorsSection";
import { TopicsSection } from "./TopicsSection";
import { BooksSection } from "./BooksSection";

interface IHomeScreenProps {
  songs?: IExtendedSong[];
  authors?: IAuthor[];
  topics?: ITopic[];
  books?: IBook[];
}

export const HomeScreen: React.FC<IHomeScreenProps> = ({
  songs: propSongs = [],
  authors: propAuthors = [],
  topics: propTopics = [],
  books: propBooks = [],
}) => {
  const router = useRouter();
  const [songs] = useState<IExtendedSong[]>(propSongs);
  const [authors] = useState<IAuthor[]>(propAuthors);
  const [topics] = useState<ITopic[]>(propTopics);
  const [books] = useState<IBook[]>(propBooks);
  const [language] = useState("en");

  // Navigation handlers
  const handleSongClick = (song: IExtendedSong) => {
    router.push(`/songs/${song.id}`);
  };

  const handleAuthorClick = (author: IAuthor) => {
    console.log("Navigate to author:", author.name);
    // router.push(`/authors/${author.name}`)
  };

  const handleTopicClick = (topic: ITopic) => {
    console.log("Navigate to topic:", topic.name);
    // router.push(`/topics/${encodeURIComponent(topic.name)}`)
  };

  const handleBookClick = (book: IBook) => {
    console.log("Navigate to book:", book.uid);
    // router.push(`/books/${book.uid}`)
  };

  return (
    <div className="w-full max-w-screen-lg pt-4 pb-20 mx-auto">
      {/* Header/Search area would go here */}
        {/* Popular Songs in 2x2 Grid */}
        <SongsSection
          songs={songs}
          title="Popular Songs"
          language={language}
          onSongClick={handleSongClick}
          gridLayout={true}
          limit={4}
          viewAllLink="/songs"
        />

      {/* Topics Section */}
      <div className="mb-8">
        <TopicsSection 
          topics={topics} 
          onTopicClick={handleTopicClick}
          title="Browse by Topics"
          limit={8}
          viewAllLink="/topics"
        />
      </div>
      
      {/* Authors Section */}
      <div className="mb-8">
        <AuthorsSection 
          authors={authors} 
          onAuthorClick={handleAuthorClick}
          title="Popular Authors"
          limit={10}
          viewAllLink="/authors"
        />
      </div>
      
      {/* Books Section */}
      <BooksSection 
        books={books} 
        onBookClick={handleBookClick}
        title="Featured Books"
        viewAllLink="/books"
      />

    </div>
  );
};
