import React, { useState } from 'react'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'

interface ReaderOptionsProps {
  showSource: boolean
  onToggleSource: () => void
  showTransliteration: boolean
  onToggleTransliteration: () => void
  showWordToWord: boolean
  onToggleWordToWord: () => void
  showTranslation: boolean
  onToggleTranslation: () => void
  /** Disable the toggles for parts the song doesn't ship at all. */
  hasWordToWord: boolean
  hasTranslation: boolean
}

// A muted (non-accent) switch — the panel deliberately avoids the highlight colour.
const Switch: React.FC<{ on: boolean; onChange: () => void; label: string; disabled?: boolean }> = ({
  on,
  onChange,
  label,
  disabled,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={onChange}
    disabled={disabled}
    className={`flex w-full items-center justify-between gap-6 py-1.5 text-sm ${disabled ? 'opacity-40' : ''}`}
  >
    <span className="text-[var(--primary)]">{label}</span>
    <span
      className={`relative inline-flex h-5 w-9 flex-none items-center rounded-full transition-colors ${
        on ? 'bg-[var(--neutral)]' : 'bg-[var(--border)]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-[var(--background)] shadow transition-transform ${
          on ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </span>
  </button>
)

/**
 * Reader display options (docs/screens/song-detail.md) — a small, outlined, **collapsible** panel in
 * the top-left of the reader (replacing the old centred accent pill-bar). Toggles what the verse
 * shows: source line, transliteration, word-by-word, translation. Writes the same persisted settings
 * the Settings screen owns. Collapsed by default so it stays out of the way.
 */
export const ReaderOptions: React.FC<ReaderOptionsProps> = ({
  showSource,
  onToggleSource,
  showTransliteration,
  onToggleTransliteration,
  showWordToWord,
  onToggleWordToWord,
  showTranslation,
  onToggleTranslation,
  hasWordToWord,
  hasTranslation,
}) => {
  const [open, setOpen] = useState(false)

  // The trigger stays in flow (reserving its own space); the options are an ABSOLUTE dropdown that
  // overlays the page, so opening/closing never reflows/moves the content below.
  return (
    <div className="relative w-fit">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium transition-colors ${
          open ? 'bg-[var(--background-offset)] text-[var(--primary)]' : 'bg-[var(--background)] text-[var(--neutral)] hover:text-[var(--primary)]'
        }`}
      >
        <SlidersHorizontal size={15} />
        <span>Display</span>
        <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 min-w-[14rem] rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 shadow-xl">
          <Switch label="Source script" on={showSource} onChange={onToggleSource} />
          <Switch label="Transliteration" on={showTransliteration} onChange={onToggleTransliteration} />
          <Switch label="Word-by-word" on={showWordToWord} onChange={onToggleWordToWord} disabled={!hasWordToWord} />
          <Switch label="Translation" on={showTranslation} onChange={onToggleTranslation} disabled={!hasTranslation} />
        </div>
      )}
    </div>
  )
}

export default ReaderOptions
