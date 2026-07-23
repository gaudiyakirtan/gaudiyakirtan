// Pure queue-advance logic for "continuous play through a book/topic" (docs/screens/player.md
// feature 2). Kept dependency-free from PlayerContext so the track-end decision (repeat vs.
// next-take vs. advance-to-next-song vs. stop) is unit-testable without a DOM <audio> element.
import { Uid } from '../models/Common'

export type QueueKind = 'book' | 'topic'

/** Which collection the current queue is playing through, for the widget's "Playing from" label. */
export interface IQueueContext {
  kind: QueueKind
  groupUid: Uid
  title: string
}

/** An ordered run of song uids the player advances through when a song's takes are exhausted. */
export interface IPlayerQueue {
  context: IQueueContext
  uids: Uid[]
}

/** The song uid one step before/after `currentUid` in the queue, or null at a boundary or when
 * `currentUid` isn't in the queue (e.g. the reader navigated away from the armed collection). */
export function queueNeighbor(
  queue: IPlayerQueue | null,
  currentUid: Uid,
  direction: 1 | -1
): Uid | null {
  if (!queue) return null
  const index = queue.uids.indexOf(currentUid)
  if (index === -1) return null
  const neighborIndex = index + direction
  return neighborIndex >= 0 && neighborIndex < queue.uids.length ? queue.uids[neighborIndex] : null
}

/** 1-based "3 of 12" position of `currentUid` within the queue. Null when it isn't in the queue. */
export function queuePosition(
  queue: IPlayerQueue | null,
  currentUid: Uid
): { index: number; total: number } | null {
  if (!queue) return null
  const index = queue.uids.indexOf(currentUid)
  return index === -1 ? null : { index: index + 1, total: queue.uids.length }
}

export type TrackEndAction =
  | { type: 'repeat' }
  | { type: 'next-take'; trackUid: Uid }
  | { type: 'advance'; nextSongUid: Uid }
  | { type: 'stop' }

/**
 * What should happen when the current recording finishes (`<audio>`'s `ended` event). Priority
 * order:
 *  1. A sleep timer armed for "end of track" always wins - the reader explicitly asked for
 *     silence soon, so it must not be pre-empted by looping/continuing/advancing.
 *  2. Repeat-one (pre-existing behavior) - must keep winning over both same-song and cross-song
 *     continuation per the brief.
 *  3. Auto-continue to the next *take* of the same song, when one exists (pre-existing
 *     `autoContinue` behavior - other singers' recordings of this song read as one session).
 *  4. Advance the armed book/topic queue to the *next song*, once every take has played.
 *  5. Otherwise, stop.
 */
export function resolveTrackEndAction(params: {
  isLooping: boolean
  sleepEndOfTrack: boolean
  autoContinueNextTrackUid: Uid | null
  queue: IPlayerQueue | null
  currentSongUid: Uid
}): TrackEndAction {
  const { isLooping, sleepEndOfTrack, autoContinueNextTrackUid, queue, currentSongUid } = params
  if (sleepEndOfTrack) return { type: 'stop' }
  if (isLooping) return { type: 'repeat' }
  if (autoContinueNextTrackUid) return { type: 'next-take', trackUid: autoContinueNextTrackUid }
  const nextSongUid = queueNeighbor(queue, currentSongUid, 1)
  if (nextSongUid) return { type: 'advance', nextSongUid }
  return { type: 'stop' }
}
