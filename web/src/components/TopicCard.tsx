import React from 'react'
import { ISongGroup } from '../models/Collections'
import { getMediaColor, isColorDark } from '../utils/colors'
import { pickScriptText } from '../services/textDisplay'
import { useSettings } from '../utils/SettingsContext'
import { BROWSE_CARD_INTERACTION } from '../utils/motion'
import { ArrowUpRightIcon } from './icons/SidebarIcons'

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
    // Native button; hover / focus slides an up-right arrow into the empty corner beside the count
    // ("opens the topic") and lifts the pill's tint (docs/screens/home.md v5). The card's box never
    // grows — a rail clips both axes — so only its contents move.
    <button
      type="button"
      className={`group/card relative block overflow-hidden rounded-xl ${BROWSE_CARD_INTERACTION} ${className}`}
      style={containerStyle}
      onClick={onClick}
    >
      <span className="flex flex-col justify-between w-full h-full p-4">
        <span className="block">
          <span
            className={`block text-base font-bold ${textColor} text-left line-clamp-2`}
            style={{ lineHeight: '1.2' }}
          >
            {title}
          </span>
        </span>

        {/* Real song count from songUids - never a fabricated placeholder number */}
        {topic.songUids.length > 0 && (
          <span className="mt-auto block">
            <span className="px-2.5 py-1 text-xs rounded-full bg-white/30 text-white transition-colors duration-200 ease-standard group-hover/card:bg-white/40 group-focus-visible/card:bg-white/40">
              {topic.songUids.length} songs
            </span>
          </span>
        )}
      </span>

      <span
        aria-hidden="true"
        data-testid="topic-card-arrow"
        className={`pointer-events-none absolute bottom-4 right-4 flex h-6 items-center opacity-0 transition-[opacity,translate] duration-200 ease-standard group-hover/card:opacity-100 group-focus-visible/card:opacity-100 motion-safe:-translate-x-1 motion-safe:translate-y-1 motion-safe:group-hover/card:translate-x-0 motion-safe:group-hover/card:translate-y-0 motion-safe:group-focus-visible/card:translate-x-0 motion-safe:group-focus-visible/card:translate-y-0 ${textColor}`}
      >
        <ArrowUpRightIcon size={16} />
      </span>
    </button>
  )
}

export default TopicCard
