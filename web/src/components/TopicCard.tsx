import React from 'react'
import Link from 'next/link'
import { TopicsIcon } from './icons/SidebarIcons'
import { ISongGroup } from '../models/Collections'
import { getMediaColor, isColorDark } from '../utils/colors'
import { pickScriptText } from '../services/textDisplay'
import { useSettings } from '../utils/SettingsContext'

interface TopicCardProps {
  topic: ISongGroup
  onClick?: () => void
  className?: string
  shelf?: boolean
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onClick, className = '', shelf = false }) => {
  const { settings } = useSettings()
  // Title in the reader's List-language; color seed stays on the fixed Latin title (see BookCard).
  const title = pickScriptText(topic.titles, [settings.listLanguage, 'Latn', 'Beng'])
  const bgColor = topic.color || getMediaColor(pickScriptText(topic.titles, ['Latn', 'Beng']))
  const isDark = isColorDark(bgColor)
  const textColor = isDark ? 'text-white' : 'text-black'

  if (shelf) return (
    <Link href={`/topics/${topic.uid}`} className="home-browse-card home-topic-card utility-target">
      <TopicsIcon className="text-[var(--accent)]" aria-hidden="true" />
      <span className="text-sm/5 font-medium">{title}</span>
      <span className="text-sm/5 text-[var(--tertiary)]">{topic.songUids.length} songs</span>
    </Link>
  )

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
