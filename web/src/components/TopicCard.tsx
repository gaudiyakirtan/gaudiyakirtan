import React from 'react'
import { ITopic } from '../models/Topic'
import { getMediaColor, isColorDark } from '../utils/colors'

interface TopicCardProps {
  topic: ITopic
  onClick?: () => void
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onClick }) => {
  const bgColor = getMediaColor(topic.name)
  const isDark = isColorDark(bgColor)
  const textColor = isDark ? 'text-white' : 'text-black'

  return (
    <div 
      className="mx-2 cursor-pointer rounded-xl overflow-hidden" 
      style={{ 
        backgroundColor: bgColor,
        width: '176px',
        height: '96px' 
      }}
      onClick={onClick}
    >
      <div className="h-full w-full p-0">
        <p 
          className={`text-xl font-bold ${textColor} text-left pl-6 pt-6 line-clamp-2`}
          style={{ 
            maxWidth: '140px',
            lineHeight: '1.2'
          }}
        >
          {topic.name}
        </p>
      </div>
    </div>
  )
}