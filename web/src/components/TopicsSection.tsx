import React from 'react'
import Link from 'next/link'
import { ISongGroup } from '../models/Collections'
import { TopicCard } from './TopicCard'

interface TopicsSectionProps {
  topics: ISongGroup[]
  title?: string
  onTopicClick?: (topic: ISongGroup) => void
  className?: string
  limit?: number
  viewAllLink?: string
  /** Render as one horizontally-scrollable row instead of a wrapping grid (home). */
  singleRow?: boolean
}

export const TopicsSection: React.FC<TopicsSectionProps> = ({
  topics,
  title = 'Topics',
  onTopicClick,
  className = '',
  limit,
  viewAllLink,
  singleRow = false,
}) => {
  if (!topics.length) return null

  const displayTopics = limit ? topics.slice(0, limit) : topics

  return (
    <div className={className}>
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="text-xl font-bold text-[var(--primary)]">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-sm text-[var(--highlight)] hover:underline">
            View All →
          </Link>
        )}
      </div>
      <div
        className={
          singleRow
            ? 'flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none]'
            : 'grid grid-cols-2 gap-4 px-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5'
        }
      >
        {displayTopics.map((topic) => (
          <div
            key={topic.uid}
            className={singleRow ? 'aspect-[1.86/1] w-44 flex-none' : 'aspect-[1.86/1]'}
          >
            <TopicCard
              topic={topic}
              onClick={() => onTopicClick && onTopicClick(topic)}
              className="h-full"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
