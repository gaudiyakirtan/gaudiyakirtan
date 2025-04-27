import React from 'react'
import { ITopic, Topic } from '../models/Topic'
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

  // Get song count from the topic model or generate one based on the name
  const getSongCount = (topic: ITopic, index: number) => {
    // Generate a pseudo-random count based on the topic name length
    return Math.floor((topic.name.length * 3) % 20 + 1);
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
      
      {gridLayout ? (
        // Grid layout with responsive sizing
        <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {displayTopics.map((topic, index) => (
            <div key={`topic-${index}-${topic.name}`} className="aspect-[1.66/1]">
              <TopicCard
                topic={topic}
                onClick={() => onTopicClick && onTopicClick(topic)}
                songCount={getSongCount(topic, index)}
                className="h-full"
                gridMode={true}
              />
            </div>
          ))}
        </div>
      ) : (
        // Horizontal scroll layout
        <div className="flex pt-1 pb-4 overflow-x-auto no-scrollbar">
          <div className="pl-4"></div>
          {displayTopics.map((topic, index) => (
            <div 
              key={`topic-${index}-${topic.name}`}
              className="flex-shrink-0 w-44 mr-3 aspect-[1.66/1]"
            >
              <TopicCard
                topic={topic}
                onClick={() => onTopicClick && onTopicClick(topic)}
                songCount={getSongCount(topic, index)}
                className="h-full"
                gridMode={false}
              />
            </div>
          ))}
          <div className="pr-4"></div>
        </div>
      )}
    </div>
  )
}