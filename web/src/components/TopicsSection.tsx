import React from 'react'
import { ITopic } from '../models/Topic'
import { TopicCard } from './TopicCard'

interface TopicsSectionProps {
  topics: ITopic[]
  title?: string
  onTopicClick?: (topic: ITopic) => void
}

export const TopicsSection: React.FC<TopicsSectionProps> = ({ 
  topics,
  title = 'Topics',
  onTopicClick
}) => {
  if (!topics.length) return null

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[var(--primary)] mb-4 px-4">{title}</h2>
      <div className="flex pt-1 pb-4 overflow-x-auto no-scrollbar">
        <div className="pl-4"></div>
        {topics.map((topic, index) => (
          <TopicCard
            key={`topic-${index}-${topic.name}`}
            topic={topic}
            onClick={() => onTopicClick && onTopicClick(topic)}
          />
        ))}
        <div className="pr-4"></div>
      </div>
    </div>
  )
}