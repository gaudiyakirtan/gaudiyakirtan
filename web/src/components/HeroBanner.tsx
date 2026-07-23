import React, { useState } from 'react'

interface HeroBannerProps {
  /** Overlaid on the artwork, bottom-left. */
  title: string
  /** Artwork URL to try. Any 404 / load error falls back to the gradient. */
  imageSrc: string
  /** Optional small pill above the title (e.g. an adhika-māsa marker). */
  badge?: string
  /** Optional muted line under the title (e.g. a date, or the Gaudiya month name). */
  subtitle?: string
  /** Optional smaller line under the subtitle (e.g. the month's observances). Clamped to 2 lines
   * — an observance list can run long and must not crowd out the title. */
  caption?: string
}

/**
 * The half-width banner shared by home's two calendar regions (docs/screens/home.md §1 and §2),
 * so "Upcoming festivals" and "This month" read as a matched pair.
 *
 * Artwork is best-effort: most slugs have no image yet, so any load error falls back to a themed
 * gradient — the gradient is a NORMAL path, not a failure (the same degrade-gracefully rule book
 * covers follow, see config.ts). The overlay and text are therefore designed to stay legible
 * against the gradient alone.
 */
export const HeroBanner: React.FC<HeroBannerProps> = ({
  title,
  imageSrc,
  badge,
  subtitle,
  caption,
}) => {
  const [failed, setFailed] = useState(false)

  return (
    <div className="relative h-36 w-full overflow-hidden rounded-lg bg-gradient-to-br from-[var(--accent)]/70 via-[var(--highlight)]/40 to-[var(--background-offset)] sm:h-full sm:min-h-[13rem]">
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt=""
          aria-hidden="true"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-3">
        {badge && (
          <span className="mb-1 inline-block rounded bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            {badge}
          </span>
        )}
        <h3 className="text-lg font-bold leading-tight text-white drop-shadow">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-white/80 drop-shadow">{subtitle}</p>}
        {caption && (
          <p className="mt-1 line-clamp-2 text-xs leading-snug text-white/75 drop-shadow">
            {caption}
          </p>
        )}
      </div>
    </div>
  )
}
