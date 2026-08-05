export const MOBILE_HEADER_HEIGHT = 56
export const MOBILE_HEADER_HIDE_DISTANCE = 12
export const MOBILE_HEADER_REVEAL_DISTANCE = 8
export const MOBILE_HEADER_JITTER_DISTANCE = 1

export type MobileHeaderScrollDirection = 'up' | 'down' | null

export interface IMobileHeaderScrollState {
  hidden: boolean
  lastY: number
  direction: MobileHeaderScrollDirection
  travel: number
}

export function createMobileHeaderScrollState(scrollY = 0): IMobileHeaderScrollState {
  return {
    hidden: false,
    lastY: Math.max(0, scrollY),
    direction: null,
    travel: 0,
  }
}

/**
 * Direction-aware mobile header state machine.
 *
 * Downward travel only starts counting after the viewport has passed the header's own 56 px
 * footprint. Upward travel counts immediately, so the chrome returns promptly without reacting to
 * fractional touch-scroll jitter. The helper is DOM-free to keep the thresholds independently
 * testable from React and the browser.
 */
export function updateMobileHeaderScrollState(
  state: IMobileHeaderScrollState,
  scrollY: number,
): IMobileHeaderScrollState {
  const nextY = Math.max(0, scrollY)

  if (nextY <= 0) return createMobileHeaderScrollState(0)

  const delta = nextY - state.lastY
  if (Math.abs(delta) < MOBILE_HEADER_JITTER_DISTANCE) {
    return { ...state, lastY: nextY }
  }

  const direction: Exclude<MobileHeaderScrollDirection, null> = delta > 0 ? 'down' : 'up'
  const directionChanged = direction !== state.direction
  const countedDelta = direction === 'down'
    ? Math.max(0, nextY - Math.max(state.lastY, MOBILE_HEADER_HEIGHT))
    : Math.abs(delta)
  const travel = (directionChanged ? 0 : state.travel) + countedDelta

  let hidden = state.hidden
  if (!hidden && direction === 'down' && travel >= MOBILE_HEADER_HIDE_DISTANCE) hidden = true
  if (hidden && direction === 'up' && travel >= MOBILE_HEADER_REVEAL_DISTANCE) hidden = false

  return { hidden, lastY: nextY, direction, travel }
}
