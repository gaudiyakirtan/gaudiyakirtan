import { describe, expect, it } from 'vitest'
import {
  createMobileHeaderScrollState,
  MOBILE_HEADER_HEIGHT,
  updateMobileHeaderScrollState,
} from './mobileHeaderScroll'

const move = (state: ReturnType<typeof createMobileHeaderScrollState>, ...positions: number[]) =>
  positions.reduce(updateMobileHeaderScrollState, state)

describe('mobile header scroll state', () => {
  it('waits for 12 px of downward travel beyond the header before hiding', () => {
    const start = createMobileHeaderScrollState()
    const atBarEnd = move(start, MOBILE_HEADER_HEIGHT)
    const beforeThreshold = move(atBarEnd, MOBILE_HEADER_HEIGHT + 11)
    const atThreshold = move(beforeThreshold, MOBILE_HEADER_HEIGHT + 12)

    expect(atBarEnd.hidden).toBe(false)
    expect(beforeThreshold.hidden).toBe(false)
    expect(atThreshold.hidden).toBe(true)
  })

  it('reveals after 8 px upward and ignores smaller reverse movement', () => {
    const hidden = move(createMobileHeaderScrollState(), MOBILE_HEADER_HEIGHT + 12)
    const jitter = move(hidden, MOBILE_HEADER_HEIGHT + 11.5)
    const beforeThreshold = move(jitter, MOBILE_HEADER_HEIGHT + 5)
    const atThreshold = move(beforeThreshold, MOBILE_HEADER_HEIGHT + 3)

    expect(hidden.hidden).toBe(true)
    expect(jitter.hidden).toBe(true)
    expect(beforeThreshold.hidden).toBe(true)
    expect(atThreshold.hidden).toBe(false)
  })

  it('resets accumulated travel on a meaningful direction change', () => {
    const start = createMobileHeaderScrollState(MOBILE_HEADER_HEIGHT)
    const almostHidden = move(start, MOBILE_HEADER_HEIGHT + 11)
    const reverse = move(almostHidden, MOBILE_HEADER_HEIGHT + 9)
    const downAgain = move(reverse, MOBILE_HEADER_HEIGHT + 18)

    expect(almostHidden.travel).toBe(11)
    expect(reverse.direction).toBe('up')
    expect(downAgain.hidden).toBe(false)
    expect(downAgain.travel).toBe(9)
  })

  it('always reveals and clears its accumulator at the top', () => {
    const hidden = move(createMobileHeaderScrollState(), MOBILE_HEADER_HEIGHT + 20)
    const top = move(hidden, 0)

    expect(top).toEqual(createMobileHeaderScrollState())
  })
})
