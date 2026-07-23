import React from 'react'

interface EmptyStateProps {
  /** Small illustrative icon, themed via `currentColor` (e.g. one of the SidebarIcons). */
  icon?: React.ReactNode
  title: string
  message?: string
  className?: string
}

/**
 * Tasteful placeholder for a browse surface with no data yet - used by Books/Topics/Collections
 * (docs/screens/browse.md "Empty-state discipline": these must never render fake/fabricated
 * rows). Themes via the standard tokens so it matches Gaura/Shyam automatically.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, className = '' }) => (
  <div className={`flex flex-col items-center justify-center gap-3 px-4 py-20 text-center ${className}`}>
    {icon && <div className="text-[var(--neutral)] opacity-50 [&_svg]:w-8 [&_svg]:h-8">{icon}</div>}
    <p className="text-base font-medium text-[var(--primary)]">{title}</p>
    {message && <p className="max-w-sm text-sm text-[var(--neutral)]">{message}</p>}
  </div>
)

export default EmptyState
