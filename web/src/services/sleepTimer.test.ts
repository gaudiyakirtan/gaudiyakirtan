// Unit tests for the sleep-timer math (src/services/sleepTimer.ts).
import { describe, expect, it } from 'vitest'
import {
  computeEndsAt,
  fadeVolumeStep,
  formatRemaining,
  isDurationExpired,
  remainingMs,
} from './sleepTimer'

describe('computeEndsAt / remainingMs / isDurationExpired', () => {
  const now = 1_000_000

  it('computes a future deadline `minutes` from now', () => {
    expect(computeEndsAt(10, now)).toBe(now + 10 * 60_000)
  })

  it('clamps a negative minute value to "now" rather than the past', () => {
    expect(computeEndsAt(-5, now)).toBe(now)
  })

  it('remainingMs counts down and floors at 0, never negative', () => {
    const endsAt = computeEndsAt(5, now)
    expect(remainingMs(endsAt, now)).toBe(5 * 60_000)
    expect(remainingMs(endsAt, endsAt - 1_000)).toBe(1_000)
    expect(remainingMs(endsAt, endsAt + 5_000)).toBe(0)
  })

  it('isDurationExpired flips exactly at the deadline', () => {
    const endsAt = computeEndsAt(1, now)
    expect(isDurationExpired(endsAt, endsAt - 1)).toBe(false)
    expect(isDurationExpired(endsAt, endsAt)).toBe(true)
    expect(isDurationExpired(endsAt, endsAt + 1)).toBe(true)
  })
})

describe('formatRemaining', () => {
  it('formats as mm:ss, seconds zero-padded', () => {
    expect(formatRemaining(4 * 60_000 + 32_000)).toBe('4:32')
    expect(formatRemaining(5_000)).toBe('0:05')
  })

  it('rounds up to the next whole second so a countdown never flashes 0:00 early', () => {
    expect(formatRemaining(500)).toBe('0:01')
  })

  it('never goes negative', () => {
    expect(formatRemaining(-1_000)).toBe('0:00')
  })
})

describe('fadeVolumeStep', () => {
  it('steps volume down toward silence', () => {
    expect(fadeVolumeStep(1, 0.1)).toBeCloseTo(0.9)
  })

  it('clamps at 0 rather than going negative (audio.volume rejects out-of-range values)', () => {
    expect(fadeVolumeStep(0.05, 0.1)).toBe(0)
    expect(fadeVolumeStep(0, 0.1)).toBe(0)
  })
})
