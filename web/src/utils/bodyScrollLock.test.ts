import { describe, expect, it } from 'vitest'
import { isScrollLocked, lockScroll, type IScrollLockTarget } from './bodyScrollLock'

// The helper is deliberately DOM-free, so a plain object stands in for `document.body`. `overflowY`
// starting as '' is what a real element reports when the value comes from a stylesheet rather than
// an inline style — which is the case the lock must restore.
const target = (overflowY = ''): IScrollLockTarget => ({ style: { overflowY } })

describe('body scroll lock', () => {
  it('locks and restores the previous inline value', () => {
    const body = target()

    const release = lockScroll(body)
    expect(body.style.overflowY).toBe('hidden')
    expect(isScrollLocked(body)).toBe(true)

    release()
    expect(body.style.overflowY).toBe('')
    expect(isScrollLocked(body)).toBe(false)
  })

  it('does not clobber an inline overflow the page already set', () => {
    const body = target('scroll')

    const release = lockScroll(body)
    expect(body.style.overflowY).toBe('hidden')

    release()
    expect(body.style.overflowY).toBe('scroll')
  })

  it('stays locked until every holder releases, and saves only the outermost value', () => {
    const body = target()

    const first = lockScroll(body)
    const second = lockScroll(body)

    first()
    expect(body.style.overflowY).toBe('hidden')
    expect(isScrollLocked(body)).toBe(true)

    second()
    expect(body.style.overflowY).toBe('')
    expect(isScrollLocked(body)).toBe(false)
  })

  it('ignores a repeated release instead of unlocking someone else', () => {
    const body = target()

    const first = lockScroll(body)
    const second = lockScroll(body)

    first()
    first() // an effect cleanup that runs twice must not release the second holder's lock
    expect(body.style.overflowY).toBe('hidden')

    second()
    expect(body.style.overflowY).toBe('')
  })

  it('relocks cleanly after a full release', () => {
    const body = target()

    lockScroll(body)()
    const release = lockScroll(body)
    expect(body.style.overflowY).toBe('hidden')

    release()
    expect(body.style.overflowY).toBe('')
  })

  it('tracks targets independently', () => {
    const a = target()
    const b = target('auto')

    const releaseA = lockScroll(a)
    expect(isScrollLocked(b)).toBe(false)

    const releaseB = lockScroll(b)
    releaseA()
    expect(a.style.overflowY).toBe('')
    expect(b.style.overflowY).toBe('hidden')

    releaseB()
    expect(b.style.overflowY).toBe('auto')
  })
})
