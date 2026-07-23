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
 */
interface IBrandWordmarkProps {
  /** Size/colour utilities for the wordmark text (e.g. `text-xl`). */
  className?: string
}

const TEXT = 'Gaudiya Kirtan'

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

export const BrandWordmark: React.FC<IBrandWordmarkProps> = ({ className = '' }) => {
  const reduceMotion = useReducedMotion()

  return (
    <motion.span
      className={`font-display inline-flex select-none whitespace-pre leading-none ${className}`}
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
