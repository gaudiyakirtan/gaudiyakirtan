import React from 'react'
import { ITopic } from '../models/Topic'
import { getMediaColor, isColorDark } from '../utils/colors'
import { Tag } from './ui/Tag'

interface TopicCardProps {
  topic: ITopic
  onClick?: () => void
  songCount?: number
  className?: string
  gridMode?: boolean
}

export const TopicCard: React.FC<TopicCardProps> = ({ 
  topic, 
  onClick, 
  songCount,
  className = "",
  gridMode = true
}) => {
  const bgColor = getMediaColor(topic.name)
  const isDark = isColorDark(bgColor)
  const textColor = isDark ? 'text-white' : 'text-black'

  // Use background color but allow the container to adapt to parent dimensions
  // with different styles based on grid/horizontal mode
  const containerStyle = { 
    backgroundColor: bgColor,
    width: '100%',
    height: '100%'
  }

  return (
    <div 
      className={`overflow-hidden transition-transform cursor-pointer rounded-xl hover:scale-103 ${className}`}
      style={containerStyle}
      onClick={onClick}
    >
      <div className="flex flex-col justify-between w-full h-full p-4">
        <div className="min-h-[48px]">
          <p 
            className={`text-base font-bold ${textColor} text-left line-clamp-2`}
            style={{ lineHeight: '1.2' }}
          >
            {topic.name}
          </p>
        </div>
        
        {/* Song count badge at the bottom */}
        {songCount !== undefined && (
          <div className="mt-auto">
            <Tag 
              text={`${songCount} songs`} 
              variant="custom"
              size="normal"
              bgColor={`bg-[rgba(255,255,255,0.2)]`}
              textColor="text-white"
              useBlur={true}
              blurBgOpacity={40}
              padding="px-3 py-1.5"
              borderRadius="rounded-xl"
            />
          </div>
        )}
      </div>
    </div>
  )
}