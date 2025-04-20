import React from 'react'
import { ITopic } from '../models/Topic'
import { TopicCard } from './TopicCard'

interface TopicsSectionProps {
  topics: ITopic[]
  title?: string
  onTopicClick?: (topic: ITopic) => void
  gridLayout?: boolean
  className?: string
  limit?: number
  viewAllLink?: string
}

export const TopicsSection: React.FC<TopicsSectionProps> = ({ 
  topics,
  title = 'Topics',
  onTopicClick,
  gridLayout = false,
  className = "",
  limit,
  viewAllLink
}) => {
  if (!topics.length) return null

  // Generate random song counts for display purposes
  // In a real app, these would come from the API
  const getRandomSongCount = (index: number) => {
    // Use a seed based on the index for consistent results
    return Math.floor((index + 1) * 3.7) % 20 + 1;
  }

  // Limit the number of topics if limit is provided
  const displayTopics = limit ? topics.slice(0, limit) : topics
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="text-xl font-bold text-[var(--primary)]">{title}</h2>
        {viewAllLink && (
          <a 
            href={viewAllLink}
            className="text-sm text-[var(--highlight)] hover:underline"
          >
            View All →
          </a>
        )}
      </div>
      
      {/* Grid layout with consistent sizing */}
      <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {displayTopics.map((topic, index) => (
          <div className="h-[108px]" key={`topic-${index}-${topic.name}`}>
            <TopicCard
              topic={topic}
              onClick={() => onTopicClick && onTopicClick(topic)}
              songCount={getRandomSongCount(index)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}