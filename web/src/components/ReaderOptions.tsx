import React, { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import { useSettings } from '../utils/SettingsContext'
import { useReaderOptions } from '../utils/ReaderOptionsContext'

interface ReaderOptionsProps {
  /**
   * `button` — the labelled "Display" trigger used on the desktop reader.
   * `icon`   — a bare icon for the mobile top bar, where it sits beside the search icon and has
   *            only a tap target's worth of room.
   */
  variant?: 'button' | 'icon'
  /** Which edge the dropdown hangs from — the top-bar icon is at the right, so it opens leftward. */
  align?: 'left' | 'right'
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
 * Reader display options (docs/screens/song-detail.md) — toggles what each verse shows: source line,
 * transliteration, word-by-word, translation. Writes the same persisted settings the Settings screen
 * owns, and is collapsed by default so it stays out of the way.
 *
 * Rendered in two places, never both at once: a **sticky** labelled button floating over the desktop
 * reader (it used to consume a full row above the title), and a bare **icon in the mobile top bar**
 * beside search, where there is no room for a floating control. Returns null unless a song screen
 * has published its capabilities, so it is inert everywhere else.
 */
export const ReaderOptions: React.FC<ReaderOptionsProps> = ({
  variant = 'button',
  align = 'left',
}) => {
  const { settings, updateSetting } = useSettings()
  // Song-specific capabilities are published by the song screen (ReaderOptionsContext), so this
  // component can be rendered from the top bar - which sits above the screen and cannot see it.
  const { capabilities } = useReaderOptions()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // A dropdown pinned in a sticky/top-bar chrome must close on an outside tap; on mobile it
  // otherwise sits over the verses with no obvious way to dismiss it.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!capabilities) return null
  const { hasWordToWord, hasTranslation } = capabilities

  const trigger =
    variant === 'icon' ? (
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Display options"
        title="Display options"
        className={`transition-colors ${open ? 'text-[var(--primary)]' : 'text-[var(--neutral)]'}`}
      >
        <SlidersHorizontal size={21} />
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title="Display options"
        className={`flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium shadow-sm transition-colors ${
          open ? 'bg-[var(--background-offset)] text-[var(--primary)]' : 'bg-[var(--background)] text-[var(--neutral)] hover:text-[var(--primary)]'
        }`}
      >
        <SlidersHorizontal size={15} />
        <span>Display</span>
        <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
    )

  return (
    <div ref={rootRef} className="relative w-fit">
      {trigger}
      {open && (
        <div
          className={`absolute top-full z-40 mt-1 min-w-[14rem] rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 shadow-xl ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <Switch label="Source script" on={settings.showSource} onChange={() => updateSetting('showSource', !settings.showSource)} />
          <Switch label="Transliteration" on={settings.showTransliteration} onChange={() => updateSetting('showTransliteration', !settings.showTransliteration)} />
          <Switch label="Word-by-word" on={settings.showWordToWord} onChange={() => updateSetting('showWordToWord', !settings.showWordToWord)} disabled={!hasWordToWord} />
          <Switch label="Translation" on={settings.showTranslation} onChange={() => updateSetting('showTranslation', !settings.showTranslation)} disabled={!hasTranslation} />
        </div>
      )}
    </div>
  )
}

export default ReaderOptions
