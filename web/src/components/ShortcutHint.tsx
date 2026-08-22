import React from 'react'

interface ShortcutHintProps {
  label: string
  visible: boolean
  className?: string
  compact?: boolean
  testId?: string
}

/** Visual-only keycap. `aria-keyshortcuts` belongs on the actionable control, not this label. */
export const ShortcutHint: React.FC<ShortcutHintProps> = ({
  label,
  visible,
  className = '',
  compact = false,
  testId,
}) => (
  <kbd
    aria-hidden="true"
    data-shortcut-hint="true"
    data-shortcut-visible={visible ? 'true' : 'false'}
    data-testid={testId}
    className={`pointer-events-none inline-flex items-center justify-center whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--background)] font-sans font-medium leading-none text-[var(--neutral)] shadow-sm transition-[opacity,transform] duration-150 motion-reduce:transition-none ${
      compact ? 'min-h-4 px-1 py-0.5 text-[9px]' : 'min-h-5 px-1.5 py-1 text-[10px]'
    } ${visible ? 'translate-y-0 opacity-100' : 'translate-y-0.5 opacity-0'} ${className}`}
  >
    {label}
  </kbd>
)
