import React from 'react'
import Link from 'next/link'

interface IViewAllLinkProps {
  href: string
  /** The section it expands (e.g. "Topics") — completes the accessible name, "View all Topics". */
  section: string
}

/**
 * A section heading's "View All →" link (docs/screens/home.md v5, Interaction feedback).
 *
 * The label underlines on hover / keyboard focus and the arrow travels 4px right — "more of this
 * section, that way". The arrow is decorative (`aria-hidden`), so the link is named for its section
 * rather than three identical "View All" links (plus a spoken "right arrow") on one page. `py-1`
 * brings the target to 28px without moving the heading row, which is already that tall.
 */
export const ViewAllLink: React.FC<IViewAllLinkProps> = ({ href, section }) => (
  <Link
    href={href}
    aria-label={`View all ${section}`}
    className="group/viewall inline-flex items-center gap-1 rounded-md py-1 text-sm text-[var(--highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--highlight)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
  >
    <span className="group-hover/viewall:underline group-focus-visible/viewall:underline">
      View All
    </span>
    <span
      aria-hidden="true"
      data-testid="view-all-arrow"
      className="inline-block transition-transform duration-200 ease-standard group-active/viewall:duration-100 motion-safe:group-hover/viewall:translate-x-1 motion-safe:group-focus-visible/viewall:translate-x-1 motion-safe:group-active/viewall:translate-x-0.5"
    >
      →
    </span>
  </Link>
)

export default ViewAllLink
