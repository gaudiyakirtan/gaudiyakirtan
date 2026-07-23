// Pure sleep-timer math (docs/screens/player.md feature 4): countdown + fade-out helpers, kept
// separate from PlayerContext so "when does it fire" and "how far does one fade step move the
// volume" are unit-testable without a DOM <audio> element or a real setInterval.

/** Minute presets offered by the sleep-timer picker. "End of track" is a separate mode below,
 * not a duration - it fires exactly once the current recording ends, whenever that is. */
export const SLEEP_TIMER_MINUTE_OPTIONS = [5, 10, 15, 30, 60] as const

export type SleepTimerMode = { kind: 'duration'; endsAt: number } | { kind: 'end-of-track' }

/** Epoch ms a `minutes`-from-`now` duration timer should fire at. */
export function computeEndsAt(minutes: number, now: number): number {
  return now + Math.max(0, minutes) * 60_000
}

/** Milliseconds left until a duration timer's deadline (0 once it has passed, never negative). */
export function remainingMs(endsAt: number, now: number): number {
  return Math.max(0, endsAt - now)
}

/** `true` once a duration timer's deadline has passed. */
export function isDurationExpired(endsAt: number, now: number): boolean {
  return remainingMs(endsAt, now) <= 0
}

/** mm:ss readout for the remaining-time badge, e.g. `4:32`, `0:05`. */
export function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/** One fade-out tick: moves `current` volume toward silence by `step`, clamped at 0 (never
 * negative - `audio.volume` throws for values outside 0..1). Driven by PlayerContext's interval;
 * a small `step` relative to the tick rate is what makes the stop feel like a fade, not a cut. */
export function fadeVolumeStep(current: number, step: number): number {
  return Math.max(0, current - step)
}
