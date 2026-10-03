import { expect, test, type Locator, type Page } from '@playwright/test'

// Home interaction feedback (docs/screens/home.md v5, "Interaction feedback"). Each test checks a
// computed style the contract names — never a screenshot — so the checks hold across fonts and
// palettes. Dates are fixed with `setFixedTime`, which fixes Date but keeps timers and rAF running,
// so transitions and Framer springs still finish.

// Śrāvaṇa — the month in the mainline Home screenshots. Its list leads with songs that ship
// recordings, so it always has song rows *and* a recording-picker toggle to exercise. (The visual
// acceptance date, 2026-10-03, is Āśvina; the checks below are about controls, not that month.)
const HOME_DATE = new Date('2026-08-15T12:00:00Z')

/** The first value of the computed `translate` (Tailwind v4's translate utilities set it), in px. */
const translateX = (locator: Locator) =>
  locator.evaluate((el) => {
    const value = getComputedStyle(el).translate
    return value === 'none' ? 0 : parseFloat(value.split(' ')[0])
  })

/** Computed `scale` as a factor (`none` is 1; Chromium may serialize a percentage). */
const scaleOf = (locator: Locator) =>
  locator.evaluate((el) => {
    const value = getComputedStyle(el).scale.split(' ')[0]
    if (value === 'none') return 1
    return value.endsWith('%') ? parseFloat(value) / 100 : parseFloat(value)
  })

const openHome = async (page: Page, date = HOME_DATE) => {
  await page.clock.setFixedTime(date)
  await page.goto('/')
  // The month region resolves after mount; wait for it so the rest of the page has settled.
  await expect(page.getByText('Sung this month')).toBeVisible()
}

/**
 * Focus `target` the way a keyboard user would arrive at it. One real Tab puts the page in keyboard
 * modality; a scripted focus after that matches `:focus-visible` exactly as Tab would, without
 * walking every sidebar control to get there.
 */
const keyboardFocus = async (page: Page, target: Locator) => {
  await page.keyboard.press('Tab')
  await target.focus()
  await expect.poll(() => target.evaluate((el) => el.matches(':focus-visible'))).toBe(true)
}

const monthRow = (page: Page) => page.getByTestId('song-list-item').first()
const topicCard = (page: Page) => page.locator('button:has([data-testid="topic-card-arrow"])').first()

test.describe('home interaction feedback', () => {
  test('song rows and browse cards are native buttons that open on Enter', async ({ page }) => {
    await openHome(page)

    const row = monthRow(page)
    await expect(row).toHaveJSProperty('tagName', 'BUTTON')
    await expect(row).toHaveAttribute('type', 'button')
    await keyboardFocus(page, row)
    await page.keyboard.press('Enter')
    await page.waitForURL(/\/songs\/[^/?#]+$/)

    await openHome(page)
    const topic = topicCard(page)
    await expect(topic).toHaveJSProperty('tagName', 'BUTTON')
    await keyboardFocus(page, topic)
    await page.keyboard.press('Enter')
    await page.waitForURL(/\/topics\/[^/?#]+$/)
  })

  test('a song row tints and travels forward on hover and on keyboard focus', async ({ page }) => {
    await openHome(page)
    const row = monthRow(page)
    const content = row.getByTestId('song-list-item-content')
    const restBox = await row.boundingBox()
    const restBg = await row.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(await translateX(content)).toBe(0)

    await row.hover()
    await expect.poll(() => translateX(content)).toBe(4)
    expect(await row.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(restBg)
    // Travel is on the contents: the row's own box does not move or grow.
    expect(await row.boundingBox()).toEqual(restBox)

    await page.mouse.move(0, 0)
    await expect.poll(() => translateX(content)).toBe(0)

    await keyboardFocus(page, row)
    await expect.poll(() => translateX(content)).toBe(4)
    const ring = await row.evaluate((el) => getComputedStyle(el).boxShadow)
    expect(ring).not.toBe('none')
  })

  test('browse cards reveal their cue without growing, and the focus ring is not clipped', async ({ page }) => {
    await openHome(page)
    const topic = topicCard(page)
    const arrow = topic.getByTestId('topic-card-arrow')
    const restBox = await topic.boundingBox()
    await expect.poll(() => arrow.evaluate((el) => getComputedStyle(el).opacity)).toBe('0')

    await topic.hover()
    await expect.poll(() => arrow.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
    await expect.poll(() => translateX(arrow)).toBe(0)
    expect(await scaleOf(topic)).toBe(1)
    expect(await topic.boundingBox()).toEqual(restBox)

    // The rail scrolls on x and so clips y: its padding box must hold the 4px offset ring.
    await keyboardFocus(page, topic)
    const clip = await topic.evaluate((el) => {
      const rail = el.closest('.overflow-x-auto') as HTMLElement
      const r = rail.getBoundingClientRect()
      const c = el.getBoundingClientRect()
      return { roomAbove: c.top - r.top, roomBelow: r.bottom - c.bottom }
    })
    expect(clip.roomAbove).toBeGreaterThanOrEqual(4)
    expect(clip.roomBelow).toBeGreaterThanOrEqual(4)

    const book = page.locator('button:has([data-testid="book-card-cover"])').first()
    const cover = book.getByTestId('book-card-cover')
    await book.hover()
    await expect.poll(() => scaleOf(cover)).toBeCloseTo(1.05, 2)
    expect(await scaleOf(book)).toBe(1)

    const author = page.locator('button:has([data-testid="author-card-avatar"])').first()
    const avatar = author.getByTestId('author-card-avatar')
    const avatarRestBg = await avatar.evaluate((el) => getComputedStyle(el).backgroundColor)
    await keyboardFocus(page, author)
    await expect
      .poll(() => avatar.evaluate((el) => getComputedStyle(el).backgroundColor))
      .not.toBe(avatarRestBg)
  })

  test('View All links are named for their section and their arrow travels', async ({ page }) => {
    await openHome(page)
    const viewAll = page.getByRole('link', { name: 'View all Topics' })
    await expect(viewAll).toBeVisible()
    await expect(viewAll).toHaveAttribute('href', '/topics')
    await expect(page.getByRole('link', { name: 'View all Books' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'View all Authors' })).toBeVisible()

    const arrow = viewAll.getByTestId('view-all-arrow')
    await viewAll.hover()
    await expect.poll(() => translateX(arrow)).toBe(4)
    const box = await viewAll.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(24)
  })

  test('the recording picker fans its faces, stays fanned while open, and springs open', async ({ page }) => {
    await openHome(page)
    const toggle = page.getByRole('button', { name: /^Choose recording of / }).first()
    await expect(toggle).toBeVisible()
    const faces = toggle.getByTestId('recording-picker-face')
    const count = await faces.count()
    expect(count).toBeGreaterThan(0)

    await toggle.hover()
    if (count > 1) {
      await expect.poll(() => translateX(faces.first())).toBeLessThan(0)
      await expect.poll(() => translateX(faces.last())).toBeGreaterThan(0)
    }

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const panel = page.getByTestId('recording-picker-panel')
    await expect(panel).toBeVisible()
    await expect.poll(() => panel.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')

    // Fanned = open: moving the pointer away does not fold the stack while the picker is open.
    await page.mouse.move(0, 0)
    if (count > 1) {
      await expect.poll(() => translateX(faces.last())).toBeGreaterThan(0)
    }

    await page.keyboard.press('Escape')
    await expect(panel).toHaveCount(0)
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    // Escape hands focus back to the toggle, and the fan also answers keyboard focus — so the
    // closed toggle stays fanned until focus leaves it.
    await expect.poll(() => toggle.evaluate((el) => el.matches(':focus-visible'))).toBe(true)
    if (count > 1) await expect.poll(() => translateX(faces.last())).toBeGreaterThan(0)

    await page.getByRole('link', { name: 'View all Topics' }).focus()
    await expect.poll(() => toggle.evaluate((el) => el === document.activeElement)).toBe(false)
    if (count > 1) await expect.poll(() => translateX(faces.last())).toBe(0)
  })

  test('reduced motion removes spatial movement but keeps state feedback', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openHome(page)

    const row = monthRow(page)
    const content = row.getByTestId('song-list-item-content')
    const restBg = await row.evaluate((el) => getComputedStyle(el).backgroundColor)
    await row.hover()
    await expect.poll(() => row.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(restBg)
    expect(await translateX(content)).toBe(0)

    await keyboardFocus(page, row)
    expect(await row.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none')
    expect(await translateX(content)).toBe(0)

    const topic = topicCard(page)
    const arrow = topic.getByTestId('topic-card-arrow')
    await topic.hover()
    // The cue still appears (opacity is not movement); it just does not travel.
    await expect.poll(() => arrow.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
    expect(await translateX(arrow)).toBe(0)

    const viewAllArrow = page.getByRole('link', { name: 'View all Topics' }).getByTestId('view-all-arrow')
    await page.getByRole('link', { name: 'View all Topics' }).hover()
    expect(await translateX(viewAllArrow)).toBe(0)

    const toggle = page.getByRole('button', { name: /^Choose recording of / }).first()
    await toggle.hover()
    const faces = toggle.getByTestId('recording-picker-face')
    for (let i = 0; i < (await faces.count()); i++) expect(await translateX(faces.nth(i))).toBe(0)
    await toggle.click()
    const panel = page.getByTestId('recording-picker-panel')
    await expect.poll(() => panel.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
    expect(await panel.evaluate((el) => getComputedStyle(el).transform)).toBe('none')
  })

  test('no horizontal page overflow on a phone while a card is hovered', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openHome(page)
    await topicCard(page).hover()
    await monthRow(page).hover()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
