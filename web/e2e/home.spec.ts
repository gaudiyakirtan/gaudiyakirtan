import { expect, test, type Page } from '@playwright/test'

const home = (page: Page) => page.getByTestId('home')
const triggers = (page: Page) => home(page).getByRole('button', { name: /^Choose recording of/ })
const panel = (page: Page) => home(page).getByRole('region', { name: /^Recordings of/ })

async function setup(page: Page, theme = 'gaura', collapsed = false) {
  await page.clock.setFixedTime(new Date('2026-11-14T12:00:00Z'))
  await page.addInitScript(({ theme, collapsed }) => {
    localStorage.setItem('gk-theme', theme)
    localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0')
  }, { theme, collapsed })
}

// Deterministic media events exercise the real PlayerProvider without relying on remote audio.
async function stubMedia(page: Page) {
  await page.addInitScript(() => {
    const state = new WeakMap<HTMLMediaElement, boolean>()
    let active: HTMLMediaElement | null = null
    let blocked = false
    window.addEventListener('test-audio-event', (event) => active?.dispatchEvent(new Event((event as CustomEvent<string>).detail)))
    window.addEventListener('test-audio-block', () => { blocked = true })
    const prototype = HTMLMediaElement.prototype
    Object.defineProperty(prototype, 'src', {
      get() { return this.dataset.testSrc ?? '' },
      set(value: string) { this.dataset.testSrc = value },
    })
    Object.defineProperty(prototype, 'paused', { get() { return state.get(this) !== false } })
    prototype.load = function () { this.dataset.homeAudio = 'true' }
    prototype.play = function () {
      active = this
      if (blocked) return Promise.reject(new DOMException('Autoplay blocked', 'NotAllowedError'))
      state.set(this, false)
      this.dispatchEvent(new Event('playing'))
      return Promise.resolve()
    }
    prototype.pause = function () { state.set(this, true); this.dispatchEvent(new Event('pause')) }
  })
}

for (const theme of ['gaura', 'shyam']) {
  for (const available of [390, 720, 1024]) {
    test(`${theme}: available width ${available} retains the composition and independent shelves`, async ({ page }, testInfo) => {
      const width = available === 1024 ? available + 256 : available
      await page.setViewportSize({ width, height: 1000 })
      await setup(page, theme)
      await page.goto('/')
      await expect(home(page).getByRole('heading', { level: 1 })).toHaveText('Śrī Gaudiya Kirtan')
      await expect(home(page).locator('.home-month-row')).toHaveCount(6)
      const context = await home(page).locator('.home-month-context').boundingBox()
      const songs = await home(page).locator('.home-month-songs').boundingBox()
      const frame = await home(page).locator('.home-frame').boundingBox()
      expect(Math.round((await home(page).boundingBox())!.width)).toBe(available)
      if (available >= 840) {
        expect(Math.abs(context!.y - songs!.y)).toBeLessThan(1)
        expect(context!.width / songs!.width).toBeCloseTo(5 / 7, 2)
        expect(songs!.x - context!.x - context!.width).toBeCloseTo(24, 0)
      } else {
        expect(songs!.y).toBeGreaterThanOrEqual(context!.y + context!.height + (available < 600 ? 16 : 24))
      }
      for (const kind of ['topics', 'books', 'authors']) {
        const shelf = home(page).locator(`.home-shelf-${kind}`)
        const box = await shelf.boundingBox()
        expect(box!.width).toBeCloseTo(frame!.width, 0)
        const link = shelf.locator('li a').first()
        await expect(link).toHaveAttribute('href', /\/(topics|books|songs)/)
        expect(await link.evaluate((el) => getComputedStyle(el).transform)).toBe('none')
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await page.screenshot({ path: testInfo.outputPath(`home-${theme}-${available}.png`), fullPage: true })
    })
  }
}

test('sidebar collapse selects the Home breakpoint from available width', async ({ page }) => {
  await setup(page)
  await page.setViewportSize({ width: 1024, height: 1000 })
  await page.goto('/')
  await expect(home(page).locator('.home-seasonal')).toHaveCSS('grid-template-columns', /px$/)
  const stacked = await home(page).locator('.home-month-songs').boundingBox()
  const context = await home(page).locator('.home-month-context').boundingBox()
  expect(stacked!.y).toBeGreaterThan(context!.y)
  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  await expect.poll(async () => Math.round((await home(page).boundingBox())!.width)).toBe(1024)
  await expect.poll(async () => {
    const songs = await home(page).locator('.home-month-songs').boundingBox()
    const context = await home(page).locator('.home-month-context').boundingBox()
    return Math.round(songs!.y - context!.y)
  }).toBe(0)
})

test('picker opens at current/first take, dismisses without trapping, and keeps playback in place', async ({ page }) => {
  await setup(page)
  await stubMedia(page)
  await page.goto('/')
  const trigger = triggers(page).first()
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(panel(page).getByRole('button').first()).toBeFocused()
  const controlled = await trigger.getAttribute('aria-controls')
  await expect(panel(page)).toHaveAttribute('id', controlled!)
  await page.keyboard.press('Escape')
  await expect(panel(page)).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await trigger.press('Enter')
  await panel(page).getByRole('button').nth(1).press('Enter')
  await expect(trigger).toBeFocused()
  await expect(panel(page)).toHaveCount(0)
  await expect(page).toHaveURL(/\/$/)
  expect(await page.evaluate(() => localStorage.getItem('gk.recents'))).toBeNull()
  await trigger.press('Enter')
  await expect(panel(page).getByRole('button').nth(1)).toBeFocused()
  await expect(panel(page).locator('[aria-current="true"]')).toHaveAttribute('aria-label', /Pause.*current recording, playing/)
  await page.keyboard.press('Escape')
  await trigger.press('Enter')
  await panel(page).getByRole('button').last().focus()
  await page.keyboard.press('Tab')
  await expect(panel(page)).toHaveCount(0)
  await expect(home(page).locator('.home-month-row').nth(1).getByRole('link')).toBeFocused()
  await trigger.click()
  await panel(page).getByRole('button').first().focus()
  await page.keyboard.press('Shift+Tab')
  await expect(trigger).toBeFocused()
  await expect(panel(page)).toHaveCount(0)
  await trigger.click()
  // The anchored panel can cover a following row; keyboard activation still reaches its trigger.
  await triggers(page).nth(1).press('Enter')
  await expect(triggers(page).nth(1)).toHaveAttribute('aria-expanded', 'true')
  await expect(panel(page).getByRole('button').first()).toBeFocused()
  await page.keyboard.press('Control+k')
  await expect(panel(page)).toHaveCount(0)
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('outside pointer, trigger toggle, route changes and the drawer dismiss the picker', async ({ page }) => {
  await setup(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await triggers(page).first().click()
  await triggers(page).first().click()
  await expect(panel(page)).toHaveCount(0)
  await triggers(page).first().click()
  await home(page).getByRole('heading', { level: 1 }).click()
  await expect(panel(page)).toHaveCount(0)
  await triggers(page).first().click()
  await page.getByRole('button', { name: 'Open menu' }).evaluate((el) => (el as HTMLButtonElement).click())
  await expect(panel(page)).toHaveCount(0)
  await page.getByTestId('nav-scrim').click({ position: { x: 380, y: 700 } })
  await triggers(page).first().click()
  await home(page).locator('.home-month-row a').first().click()
  await expect(page).toHaveURL(/\/songs\/K1$/)
  await expect(panel(page)).toHaveCount(0)
})

test('shelf controls page by visible width, preserve end focus, and reveal keyboard destinations', async ({ page }) => {
  await setup(page)
  await page.setViewportSize({ width: 720, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const shelf = home(page).locator('.home-shelf-topics ul')
  const next = home(page).getByRole('button', { name: 'Next topics' })
  const previous = home(page).getByRole('button', { name: 'Previous topics' })
  await expect(previous).toHaveAttribute('aria-disabled', 'true')
  await next.click()
  const metrics = await shelf.evaluate((el) => ({ left: el.scrollLeft, width: el.clientWidth, total: el.scrollWidth }))
  expect(metrics.left).toBe(Math.min(metrics.width, metrics.total - metrics.width))
  for (let i = 0; i < 4; i++) await next.press('Enter')
  await expect(next).toHaveAttribute('aria-disabled', 'true')
  await expect(next).toBeFocused()
  await shelf.locator('a').first().focus()
  await expect.poll(() => shelf.evaluate((el) => el.scrollLeft)).toBe(0)
  const first = shelf.locator('a').first()
  await expect(first).toHaveCSS('outline-width', '2px')
  await expect(first).toHaveCSS('outline-offset', '2px')
})

for (const scale of ['text200', 'zoom400']) {
  test(`${scale}: shelves retain every item and controls reflow without page overflow`, async ({ page }) => {
    await setup(page, 'shyam', true)
    await page.setViewportSize({ width: 1280, height: 1000 })
    await page.goto('/')
    const counts = await home(page).locator('.home-shelf-list').evaluateAll((shelves) => shelves.map((shelf) => shelf.children.length))
    if (scale === 'text200') await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    else await page.setViewportSize({ width: 320, height: 800 })
    await expect(home(page).locator('.home-shelf-list').first()).toHaveCSS('flex-direction', 'column')
    expect(await home(page).locator('.home-shelf-list').evaluateAll((shelves) => shelves.map((shelf) => shelf.children.length))).toEqual(counts)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(home(page).locator('.song-row-title').first()).toHaveCSS('-webkit-line-clamp', 'none')
    const finalLink = home(page).locator('.home-shelf-authors li a').last()
    await finalLink.focus()
    const box = await finalLink.boundingBox()
    expect(box!.y).toBeGreaterThanOrEqual(0)
    expect(box!.y + box!.height).toBeLessThanOrEqual(scale === 'text200' ? 1000 : 800)
  })
}

test('reduced motion uses static loading and immediate state changes; player obstruction is measured', async ({ page }) => {
  await setup(page)
  await stubMedia(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await triggers(page).first().click()
  await panel(page).getByRole('button').first().click()
  const widget = page.getByTestId('player-widget')
  await expect(widget).toBeVisible()
  // PlayerProvider owns the detached Audio element. Capture it through the prototype for events.
  await page.evaluate(() => {
    const original = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function () {
      this.dispatchEvent(new Event('waiting'))
      return Promise.resolve()
    }
    // Keep the previous implementation available for other interactions in this page.
    Object.defineProperty(window, 'testOriginalPlay', { value: original })
  })
  await widget.getByRole('button', { name: 'Pause', exact: true }).click()
  await widget.getByRole('button', { name: 'Play', exact: true }).click()
  await triggers(page).first().click()
  const loading = panel(page).locator('.home-take-icon[data-loading="true"] .home-loading-icon')
  await expect(loading).toBeVisible()
  await expect(loading).toHaveCSS('animation-name', 'none')
  await expect(loading).toHaveCSS('transform', 'none')
  await expect(panel(page)).toHaveCSS('transform', 'none')
  const pickerBox = await panel(page).boundingBox()
  const playerBox = await widget.boundingBox()
  expect(pickerBox!.y + pickerBox!.height).toBeLessThanOrEqual(playerBox!.y - 12)
  expect(pickerBox!.x).toBeGreaterThanOrEqual(16)
  expect(pickerBox!.width).toBeLessThanOrEqual(320)
  const clearance = await home(page).evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue('--home-obstruction')))
  expect(clearance).toBeGreaterThanOrEqual(playerBox!.height)
})

test('recents resolves nonseasonal songs, supports legacy timestamps, and stays separate from shelves', async ({ page }) => {
  await setup(page)
  await page.addInitScript(() => {
    localStorage.setItem('gk.recents', JSON.stringify([
      { uid: 'nonexistent', at: 10 }, { uid: 'A8', at: 9 }, { uid: 'N9', at: 8 },
      { uid: 'A9', lastOpenedAt: 7 }, { uid: 'K1', lastOpenedAt: 6 }, { uid: 'K2', at: 5 },
    ]))
  })
  await page.goto('/')
  const recents = home(page).getByRole('region', { name: 'Recently played' })
  await expect(recents.getByText('Songs you recently opened')).toBeVisible()
  await expect(recents.locator('a')).toHaveCount(4)
  await expect(recents.locator('a').nth(1)).toHaveAttribute('href', '/songs/N9')
  const box = await recents.boundingBox()
  const topics = await home(page).locator('.home-shelf-topics').boundingBox()
  expect(topics!.y).toBeGreaterThanOrEqual(box!.y + box!.height + 32)
  await recents.locator('a').nth(1).click()
  await expect(page).toHaveURL(/\/songs\/N9$/)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('gk.recents')!)[0])).toEqual({ uid: 'N9', lastOpenedAt: new Date('2026-11-14T12:00:00Z').getTime() })
})

for (const [date, expected] of [['2026-05-15', 'Puruṣottama'], ['2027-01-10', 'No songs are specific to this month.'], ['2099-01-01', 'out-of-range']]) {
  test(`calendar state: ${expected}`, async ({ page }) => {
    await setup(page)
    await page.clock.setFixedTime(new Date(`${date}T12:00:00Z`))
    const response = await page.goto('/')
    expect(await response!.text()).toContain('seasonal-placeholder')
    await expect(home(page).getByRole('heading', { level: 1 })).toBeVisible()
    if (expected === 'out-of-range') await expect(home(page).locator('.home-seasonal')).toHaveCount(0)
    else {
      await expect(home(page).getByText(expected, { exact: true })).toBeVisible()
      if (expected === 'Puruṣottama') {
        await expect(home(page).getByText('adhika-māsa', { exact: true })).toBeVisible()
        await expect(home(page).getByText('Puruṣottama (adhika)', { exact: true })).toHaveCount(0)
      }
    }
    await expect(home(page).getByRole('heading', { name: 'Recently played' })).toHaveCount(0)
  })
}

test('calendar changes at local midnight and foreground date refresh', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-23T23:59:59Z') })
  await page.goto('/')
  await expect(home(page).getByText('Kārtika', { exact: true })).toBeVisible()
  await page.clock.runFor(2000)
  await expect(home(page).getByText('Mārgaśīrṣa', { exact: true })).toBeVisible()
  await page.clock.setSystemTime(new Date('2026-12-25T12:00:00Z'))
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(home(page).getByText('Pauṣa', { exact: true })).toBeVisible()
})

test('current-take state follows pauses, external selection, errors and blocked autoplay', async ({ page }) => {
  await setup(page)
  await stubMedia(page)
  await page.goto('/')
  const trigger = triggers(page).first()
  await trigger.click()
  await panel(page).getByRole('button').first().click()
  await trigger.click()
  await expect(panel(page).locator('[aria-current="true"]')).toHaveAttribute('aria-label', /Pause.*playing/)
  await panel(page).locator('[aria-current="true"]').click()
  await trigger.click()
  await expect(panel(page).locator('[aria-current="true"]')).toHaveAttribute('aria-label', /Play.*paused/)
  await page.keyboard.press('Escape')
  const player = page.getByTestId('player-widget')
  await player.getByRole('button', { name: 'Choose recording', exact: true }).click()
  await player.getByRole('button', { name: 'Gaurasundar das', exact: true }).click()
  await trigger.click()
  await expect(panel(page).getByRole('button').nth(1)).toBeFocused()
  await expect(panel(page).getByRole('button').nth(1)).toHaveAttribute('aria-current', 'true')
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('test-audio-event', { detail: 'error' })))
  await expect(panel(page).locator('[aria-current="true"]')).toHaveAttribute('aria-label', /Play.*error/)
  await expect(home(page).locator('[aria-live]')).toHaveCount(0)
  await page.evaluate(() => window.dispatchEvent(new Event('test-audio-block')))
  await panel(page).getByRole('button').first().click()
  await trigger.click()
  await expect(panel(page).locator('[aria-current="true"]')).toHaveAttribute('aria-label', /Play.*paused/)
})

for (const language of ['Beng', 'Deva']) {
  test(`${language} titles and credits survive enlarged text`, async ({ page }) => {
    await setup(page)
    await page.addInitScript((listLanguage) => localStorage.setItem('gk-settings', JSON.stringify({ listLanguage })), language)
    await page.setViewportSize({ width: 720, height: 1000 })
    await page.goto('/')
    const title = home(page).locator('.song-row-title').first()
    await expect(title).toContainText(language === 'Beng' ? 'শ্রীদামোদরাষ্টকম্' : 'श्रीदामोदराष्टकम्')
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    await expect(title).toHaveCSS('-webkit-line-clamp', 'none')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(home(page).locator('.home-month-row').first().getByRole('link')).toHaveAccessibleName(language === 'Beng' ? /শ্রীদামোদরাষ্টকম্/ : /श्रीदामोदराष्टकम्/)
  })
}

test('foreground timezone changes refresh the local month', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-24T00:30:00Z') })
  await page.goto('/')
  await expect(home(page).getByText('Mārgaśīrṣa', { exact: true })).toBeVisible()
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setTimezoneOverride', { timezoneId: 'America/Los_Angeles' })
  await page.clock.runFor(60_100)
  await expect(home(page).getByText('Kārtika', { exact: true })).toBeVisible()
})
