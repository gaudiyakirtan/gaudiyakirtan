import React from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'

/**
 * The "Gaudiya Kirtan" wordmark, set as live text in the brand display face rather than the
 * `sri-gaudiya-kirtan.svg` bitmap-ish asset it replaces.
 *
 * Text over image buys real things here: it inherits `currentColor` (so it follows the Gaura/Shyam
 * palettes without the `.brand-logo { filter: invert(1) }` hack the SVG needed), stays crisp at any
 * zoom/DPI, costs no extra request beyond the font the heading already loads, and is selectable and
 * translatable.
 *
 * On hover each letter lifts in a staggered wave and warms to the accent. The letters are split
 * only for that animation, so the visible glyphs are marked `aria-hidden` and the accessible name
 * comes from a single `aria-label` on the wrapper — otherwise assistive tech would announce the
 * mark one letter at a time.
 *
 * One constraint the face imposes on every call site: **its ink overflows its em box** — the
 * ascenders of `d`/`i` reach 0.761 em and the `y` tail 0.249 em, against the face's 0.754/0.246 em
 * ascent/descent — so `leading-none` here is a line box, not a bounding box. An ancestor that clips
 * (for width, say) must therefore be taller than the text, or it shaves the tops and the tail.
 */
interface IBrandWordmarkProps {
  /** Size/colour utilities for the wordmark text (e.g. `text-xl`). */
  className?: string
  /**
   * Center the mark on its **cap-height band** rather than its em box. Opt-in, and only meaningful
   * under a *centering* parent that gives the mark a fixed-height slot — see `OPTICAL_CENTER`.
   */
  opticalCenter?: boolean
}

const TEXT = 'Gaudiya Kirtan'

/**
 * The face's descender space is not visual weight. Centering its em box puts the baseline
 * `(ascent - descent) / 2` = 0.254 em below the slot's axis; centering the band a reader actually
 * reads — baseline up to the cap top (0.756 em) — wants it 0.378 em below. The 0.124 em difference
 * is why the em-box-centered mark reads high next to an icon. A top pad of twice that shifts the
 * text down by exactly that much when the parent centers the (now taller) box, and unlike a
 * transform it keeps box and ink in agreement, so a clipping ancestor still measures what it draws.
 */
const OPTICAL_CENTER = 'pt-[0.248em]'

const container: Variants = {
  rest: {},
  hover: { transition: { staggerChildren: 0.03 } },
}

const letter: Variants = {
  rest: { y: 0, color: 'var(--primary)' },
  hover: {
    y: -3,
    color: 'var(--highlight)',
    transition: { type: 'spring', stiffness: 500, damping: 14 },
  },
}

export const BrandWordmark: React.FC<IBrandWordmarkProps> = ({ className = '', opticalCenter = false }) => {
  const reduceMotion = useReducedMotion()

  return (
    <motion.span
      className={`font-display inline-flex select-none whitespace-pre leading-none${opticalCenter ? ` ${OPTICAL_CENTER}` : ''} ${className}`}
      aria-label={TEXT}
      role="img"
      initial="rest"
      // A reader who asked for less motion still gets the colour shift via CSS hover on the
      // wrapper, just not the per-letter springing.
      whileHover={reduceMotion ? undefined : 'hover'}
      animate="rest"
      variants={container}
    >
      {TEXT.split('').map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          aria-hidden="true"
          className="inline-block"
          variants={reduceMotion ? undefined : letter}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}

export default BrandWordmark
