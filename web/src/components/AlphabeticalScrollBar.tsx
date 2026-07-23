import React from 'react'

interface AlphabeticalScrollBarProps {
  /** All A–Z letters; those not in `active` are dimmed and non-interactive. */
  letters: string[]
  active: Set<string>
  onJump: (letter: string) => void
}

/**
 * Vertical A–Z index scrubber (docs/screens/songs-list.md). Tapping an active letter jumps to
 * that section. Fixed to the right edge of the content column.
 */
export const AlphabeticalScrollBar: React.FC<AlphabeticalScrollBarProps> = ({
  letters,
  active,
  onJump,
}) => {
  return (
    <nav
      aria-label="Alphabetical index"
      className="fixed top-1/2 right-2 -translate-y-1/2 z-10 flex flex-col items-center select-none"
    >
      {letters.map((letter) => {
        const isActive = active.has(letter)
        return (
          <button
            key={letter}
            type="button"
            disabled={!isActive}
            onClick={() => onJump(letter)}
            className={`text-[10px] leading-[1.15] font-medium px-1 ${
              isActive
                ? 'text-[var(--highlight)] hover:scale-125 transition-transform cursor-pointer'
                : 'text-[var(--neutral)]/30 cursor-default'
            }`}
          >
            {letter}
          </button>
        )
      })}
    </nav>
  )
}

export default AlphabeticalScrollBar
