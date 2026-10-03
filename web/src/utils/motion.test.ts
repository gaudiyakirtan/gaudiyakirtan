import { describe, expect, it } from 'vitest'
import {
  STACK_SPREAD_STEP_PX,
  TAKE_STAGGER_CAP,
  TAKE_STAGGER_S,
  pickerPanelMotion,
  pickerTakeMotion,
  stackSpreadOffset,
} from './motion'

describe('stackSpreadOffset', () => {
  it('keeps a lone face in place', () => {
    expect(stackSpreadOffset(0, 1)).toBe(0)
    expect(stackSpreadOffset(0, 0)).toBe(0)
  })

  it('fans a stack symmetrically about its centre', () => {
    expect([0, 1].map((i) => stackSpreadOffset(i, 2))).toEqual([
      -STACK_SPREAD_STEP_PX / 2,
      STACK_SPREAD_STEP_PX / 2,
    ])
    expect([0, 1, 2].map((i) => stackSpreadOffset(i, 3))).toEqual([
      -STACK_SPREAD_STEP_PX,
      0,
      STACK_SPREAD_STEP_PX,
    ])
  })

  it('sums to zero so the cluster widens in place rather than drifting', () => {
    for (const count of [2, 3]) {
      const total = Array.from({ length: count }, (_, i) => stackSpreadOffset(i, count)).reduce(
        (a, b) => a + b,
        0,
      )
      expect(total).toBe(0)
    }
  })
})

describe('pickerPanelMotion', () => {
  it('springs in with travel and scale when motion is allowed', () => {
    const m = pickerPanelMotion(false)
    expect(m.initial).toMatchObject({ opacity: 0, y: -6, scale: 0.96 })
    expect(m.animate).toMatchObject({ opacity: 1, y: 0, scale: 1 })
    expect(m.animate.transition).toMatchObject({ type: 'spring' })
  })

  it('never bounces on exit', () => {
    for (const reduce of [false, true]) {
      const exit = pickerPanelMotion(reduce).exit
      expect(Object.keys(exit).sort()).toEqual(['opacity', 'transition'])
      expect(exit.transition).not.toHaveProperty('type', 'spring')
    }
  })

  it('removes every spatial property under reduced motion', () => {
    const m = pickerPanelMotion(true)
    for (const state of [m.initial, m.animate, m.exit]) {
      expect(state).not.toHaveProperty('y')
      expect(state).not.toHaveProperty('x')
      expect(state).not.toHaveProperty('scale')
    }
    expect(m.initial).toEqual({ opacity: 0 })
  })
})

describe('pickerTakeMotion', () => {
  it('staggers takes top-down and caps the delay', () => {
    const delay = (i: number) => {
      const m = pickerTakeMotion(i, false)
      // The return type is a normalized union (the reduced branch carries `animate?: undefined`),
      // so `in` does not narrow it; a truthiness check does. A missing `animate` still fails below.
      return m.animate ? m.animate.transition.delay : NaN
    }
    expect(delay(0)).toBe(0)
    expect(delay(1)).toBeCloseTo(TAKE_STAGGER_S)
    expect(delay(TAKE_STAGGER_CAP + 4)).toBeCloseTo(TAKE_STAGGER_CAP * TAKE_STAGGER_S)
    expect(delay(-1)).toBe(0)
  })

  it('renders takes immediately under reduced motion', () => {
    expect(pickerTakeMotion(3, true)).toEqual({ initial: false })
  })
})
