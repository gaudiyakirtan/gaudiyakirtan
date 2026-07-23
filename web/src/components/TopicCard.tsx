import React from 'react'
import { ISongGroup } from '../models/Collections'
import { getMediaColor, isColorDark } from '../utils/colors'
import { pickScriptText } from '../services/textDisplay'
import { useSettings } from '../utils/SettingsContext'

interface TopicCardProps {
  topic: ISongGroup
  onClick?: () => void
  className?: string
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onClick, className = '' }) => {
  const { settings } = useSettings()
  // Title in the reader's List-language; color seed stays on the fixed Latin title (see BookCard).
  const title = pickScriptText(topic.titles, [settings.listLanguage, 'Latn', 'Beng'])
  const bgColor = topic.color || getMediaColor(pickScriptText(topic.titles, ['Latn', 'Beng']))
  const isDark = isColorDark(bgColor)
  const textColor = isDark ? 'text-white' : 'text-black'

  const containerStyle = {
    backgroundColor: bgColor,
    width: '100%',
    height: '100%',
  }

  return (
    <div
      className={`overflow-hidden transition-transform cursor-pointer rounded-xl hover:scale-103 ${className}`}
      style={containerStyle}
      onClick={onClick}
    >
      <div className="flex flex-col justify-between w-full h-full p-4">
        <div>
          <p
            className={`text-base font-bold ${textColor} text-left line-clamp-2`}
            style={{ lineHeight: '1.2' }}
          >
            {title}
          </p>
        </div>

        {/* Real song count from songUids - never a fabricated placeholder number */}
        {topic.songUids.length > 0 && (
          <div className="mt-auto">
            <span className="px-2.5 py-1 text-xs rounded-full bg-white/30 text-white">
              {topic.songUids.length} songs
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default TopicCard
