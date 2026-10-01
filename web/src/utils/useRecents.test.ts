import { expect, it } from 'vitest'
import { parseRecents } from './useRecents'

it('migrates legacy reading history while retaining the most recent distinct visits', () => {
  expect(parseRecents(JSON.stringify([
    { uid: 'A8', at: 1 }, { uid: 'K1', lastOpenedAt: 3 }, { uid: 'A8', lastOpenedAt: 4 },
    { uid: 'invalid' }, null, { uid: 'bad-time', at: 'yesterday' },
  ]))).toEqual([{ uid: 'A8', lastOpenedAt: 4 }, { uid: 'K1', lastOpenedAt: 3 }])
})
it('unreadable or absent history is empty', () => {
  for (const raw of [null, 'broken', '{}', 'null']) expect(parseRecents(raw)).toEqual([])
})
