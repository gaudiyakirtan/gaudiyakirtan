/**
 * Interaction-motion constants for Home's feedback contract (docs/screens/home.md v5,
 * "Interaction feedback"). One expressive area — the recording picker — springs; every repeated
 * browse control uses the CSS `ease-standard` curve (globals.css) and never overshoots.
 *
 * Kept as plain data + pure functions so the values the spec names are unit-tested, and so a
 * reduced-motion reader gets the same structure with the spatial parts removed rather than a
 * second code path at each call site.
 */

/** M3's standard curve, as a Framer Motion cubic-bezier. Mirrors `--ease-standard` in globals.css. */
export const STANDARD_EASE = [0.2, 0, 0, 1] as const

/** The picker panel's entrance. Same family as the mini-player's morph spring (PlayerWidget). */
export const EXPRESSIVE_SPRING = { type: 'spring', stiffness: 560, damping: 32, mass: 0.9 } as const

/**
 * Press-release spring for the picker toggle — under-damped (ζ ≈ 0.46) so the release visibly
 * passes 100 % once and settles, which is the tactile "spring" the expressive budget pays for.
 */
export const PRESS_SPRING = { type: 'spring', stiffness: 600, damping: 20, mass: 0.8 } as const

/** How far the picker toggle shrinks while pressed. */
export const PRESS_SCALE = 0.94

/** Horizontal step, in px, between adjacent singer faces when the stack fans out. */
export const STACK_SPREAD_STEP_PX = 3

/** Delay between consecutive takes entering the picker, and the index after which it stops growing. */
export const TAKE_STAGGER_S = 0.025
export const TAKE_STAGGER_CAP = 5

/** The picker's quick fade — its exit, and its whole entrance under reduced motion. */
const FADE = { duration: 0.12, ease: STANDARD_EASE }

/**
 * Shared by every browse card (Topic / Book / Author): a native-button reset, the offset focus ring
 * (a --background gap, then --highlight, so it reads on any card colour), and the quiet press — a
 * 97 % shrink on the standard curve, faster in than out. A shrink can only move inward, so it is the
 * one transform allowed on a card's own box. `motion-safe:` drops it for reduced motion.
 */
export const BROWSE_CARD_INTERACTION =
  'cursor-pointer text-left transition-transform duration-200 ease-standard active:duration-100 motion-safe:active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--highlight)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]'

/**
 * Where face `index` of a `count`-face stack travels when the stack fans out: symmetric about the
 * stack's centre, so the cluster widens in place instead of drifting toward the count badge. A lone
 * face has nowhere to spread and stays put.
 */
export function stackSpreadOffset(
  index: number,
  count: number,
  step: number = STACK_SPREAD_STEP_PX,
): number {
  if (count < 2) return 0
  return (index - (count - 1) / 2) * step
}

/**
 * The picker panel's enter/exit. It rises out of the toggle it is anchored under (the caller sets a
 * top-right transform origin) on the expressive spring; it always leaves on a short fade, because a
 * dismissal that bounces reads as the panel refusing to go. Reduced motion keeps the fade only.
 */
export function pickerPanelMotion(reduceMotion: boolean) {
  if (reduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: FADE },
      exit: { opacity: 0, transition: FADE },
    }
  }
  return {
    initial: { opacity: 0, y: -6, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { ...EXPRESSIVE_SPRING, opacity: FADE } },
    exit: { opacity: 0, transition: FADE },
  }
}

/**
 * One take's entrance inside the picker: 4 px in from the trailing edge, staggered so the list
 * reads top-down, with the delay capped so a long list never makes the reader wait for its tail.
 * Reduced motion returns `initial: false` — the take simply renders, inside the panel's fade.
 */
export function pickerTakeMotion(index: number, reduceMotion: boolean) {
  if (reduceMotion) return { initial: false as const }
  return {
    initial: { opacity: 0, x: 4 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        ease: STANDARD_EASE,
        delay: Math.min(Math.max(index, 0), TAKE_STAGGER_CAP) * TAKE_STAGGER_S,
      },
    },
  }
}
