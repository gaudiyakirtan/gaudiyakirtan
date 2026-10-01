import { expect, test, type Page } from '@playwright/test'

// Keep offline-cache interception from bypassing deterministic media and page-data fixtures.
test.use({ serviceWorkers: 'block' })

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
    test(`${theme}: available width ${available} renders the Singing Page composition`, async ({ page }, testInfo) => {
      const width = available === 1024 ? available + 256 : available
      await page.setViewportSize({ width, height: 1000 })
      await setup(page, theme)
      await page.goto('/')
      await expect(home(page).getByRole('heading', { level: 1 })).toHaveText('Śrī Gaudiya Kirtan')
      await expect(home(page).locator('.home-month-row')).toHaveCount(6)
      await expect(home(page).locator('.home-feature')).toBeVisible()
      await expect(home(page).locator('.home-month-context')).toBeVisible()
      await expect(home(page).locator('.home-month-songs')).toBeVisible()
      await expect(home(page).locator('.home-shelf-books')).toBeVisible()
      await expect(home(page).locator('.home-authors')).toBeVisible()
      await expect(home(page).locator('.home-topic-links')).toBeVisible()
      const month = await home(page).locator('.home-season').boundingBox()
      const listen = await home(page).locator('.home-feature').boundingBox()
      const songs = await home(page).locator('.home-month-songs').boundingBox()
      expect(Math.round((await home(page).boundingBox())!.width)).toBe(available)
      if (available >= 1021) {
        expect(listen!.x).toBeLessThan(month!.x)
        expect(month!.x).toBe(songs!.x)
        expect(Math.round(month!.y)).toBe(Math.round(listen!.y))
      } else {
        expect(month!.y).toBeGreaterThan(listen!.y)
        if (available < 701) expect(listen!.y).toBeLessThan(songs!.y)
      }
      await expect(home(page).locator('.home-shelf-books .home-shelf-list a').first()).toHaveAttribute('href', /\/books\//)
      await expect(home(page).locator('.home-topic-links a').first()).toHaveAttribute('href', /\/topics\//)
      await expect(home(page).getByRole('link', { name: /All topics/ })).toHaveAttribute('href', '/topics')
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await page.screenshot({ path: testInfo.outputPath(`home-${theme}-${available}.png`), fullPage: true })
    })
  }
}

test('sidebar collapse selects the Home breakpoint from available width', async ({ page }) => {
  await setup(page)
  await page.setViewportSize({ width: 1200, height: 1000 })
  await page.goto('/')
  const initialMonth = await home(page).locator('.home-season').boundingBox()
  const initialListen = await home(page).locator('.home-feature').boundingBox()
  expect(initialMonth!.y).toBeGreaterThan(initialListen!.y)
  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  await expect.poll(async () => Math.round((await home(page).boundingBox())!.width)).toBe(1200)
  await expect.poll(async () => {
    const month = await home(page).locator('.home-season').boundingBox()
    const listen = await home(page).locator('.home-feature').boundingBox()
    return month!.x > listen!.x
  }).toBe(true)
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

test('an open picker follows page scroll without pulling its anchor back into view', async ({ page }) => {
  await setup(page)
  await page.setViewportSize({ width: 720, height: 700 })
  await page.goto('/')
  await triggers(page).first().click()
  await expect(panel(page)).toBeVisible()
  const start = await page.evaluate(() => scrollY)
  // Wheel over the page gutter, not the panel's own scrollable take list.
  await page.mouse.move(8, 200)
  await page.mouse.wheel(0, 800)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(start + 400)
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(start + 400)
  await expect(panel(page)).toBeVisible()
})

test('outside pointer, trigger toggle, route changes and the drawer dismiss the picker', async ({ page }) => {
  await setup(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await triggers(page).first().click()
  await triggers(page).first().click()
  await expect(panel(page)).toHaveCount(0)
  await triggers(page).first().click()
  await home(page).locator('.home-month-context').click({ position: { x: 12, y: 12 } })
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

test('compact discovery links remain keyboard reachable and keep real destinations', async ({ page }) => {
  await setup(page)
  await page.setViewportSize({ width: 720, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const topic = home(page).locator('.home-topic-links a').first()
  const book = home(page).locator('.home-shelf-books .home-shelf-list a').first()
  const author = home(page).locator('.home-authors ul a').first()
  await expect(topic).toHaveAttribute('href', /\/topics\//)
  await expect(book).toHaveAttribute('href', /\/books\//)
  await expect(author).toHaveAttribute('href', /\/songs\?author=/)
  await topic.focus()
  await expect(topic).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

for (const scale of ['text200', 'zoom400']) {
test(`${scale}: modules reflow without page overflow`, async ({ page }) => {
    await setup(page, 'shyam', true)
    await page.setViewportSize({ width: 1280, height: 1000 })
    await page.goto('/')
    const topicCount = await home(page).locator('.home-topic-links a').count()
    const coverCount = await home(page).locator('.home-shelf-books .home-shelf-list a').count()
    if (scale === 'text200') await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    else await page.setViewportSize({ width: 320, height: 800 })
    expect(await home(page).locator('.home-topic-links a').count()).toBe(topicCount)
    expect(await home(page).locator('.home-shelf-books .home-shelf-list a').count()).toBe(coverCount)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const finalLink = home(page).locator('.home-authors a').last()
    await finalLink.focus()
    await expect(finalLink).toBeFocused()
    const box = await finalLink.boundingBox()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(scale === 'text200' ? 1280 : 320)
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
  const recents = home(page).locator('.home-recent')
  await expect(recents.getByText('Recently opened')).toBeVisible()
  await expect(recents.locator('a')).toHaveCount(4)
  await expect(recents.locator('a').nth(1)).toHaveAttribute('href', '/songs/N9')
  const box = await recents.boundingBox()
  const topics = await home(page).locator('.home-topics').boundingBox()
  expect(topics!.y).toBeGreaterThanOrEqual(box!.y + box!.height + 32)
  await recents.locator('a').nth(1).click()
  await expect(page).toHaveURL(/\/songs\/N9$/)
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('gk.recents')!)[0]))
    .toEqual({ uid: 'N9', lastOpenedAt: new Date('2026-11-14T12:00:00Z').getTime() })
})

for (const [date, expected] of [
  ['2026-05-15', 'Puruṣottama'],
  ['2026-06-15', 'Jyeṣṭha'],
  ['2026-09-01', 'Bhādrapada'],
  ['2027-01-10', 'No songs are specific to this month.'],
  ['2099-01-01', 'out-of-range'],
]) {
  test(`calendar state: ${expected}`, async ({ page }) => {
    await setup(page)
    await page.clock.setFixedTime(new Date(`${date}T12:00:00Z`))
    const response = await page.goto('/')
    expect(await response!.text()).toContain('seasonal-placeholder')
    await expect(home(page).getByRole('heading', { level: 1 })).toBeVisible()
    if (expected === 'out-of-range') {
      await expect(home(page).locator('.home-month-context')).toHaveCount(0)
      await expect(home(page).locator('.home-feature')).toBeVisible()
    }
    else {
      await expect(home(page).getByText(expected, { exact: true })).toBeVisible()
      if (expected === 'Puruṣottama') {
        await expect(home(page).getByText('adhika-māsa', { exact: true })).toBeVisible()
        await expect(home(page).getByText('Puruṣottama (adhika)', { exact: true })).toHaveCount(0)
      }
      await expect(home(page).getByRole('region', { name: 'Season context' })).toBeVisible()
    }
    await expect(home(page).locator('.home-recent')).toHaveCount(0)
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
  await expect(home(page).locator('.home-play-action')).toHaveAccessibleName(/Retry/)
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

test('featured reading stays primary while matching and unrelated playback change', async ({ page }) => {
  await setup(page)
  await stubMedia(page)
  await page.goto('/')
  const feature = home(page).locator('.home-feature')
  const read = feature.getByRole('link', { name: /^Read & sing/ })
  const playback = feature.getByRole('button')
  await expect(read).toHaveAttribute('href', '/songs/K1')
  await expect(playback).toHaveAccessibleName(/^Play recording/)
  await playback.click()
  await expect(playback).toHaveAccessibleName(/^Pause/)
  await playback.click()
  await expect(playback).toHaveAccessibleName(/^Resume/)
  await expect(page.getByTestId('player-widget').getByRole('button', { name: 'Play', exact: true })).toBeVisible()
  await triggers(page).nth(1).click()
  await panel(page).getByRole('button').first().click()
  await expect(read).toHaveAttribute('href', '/songs/K1')
  await expect(playback).toHaveAccessibleName(/^Play recording/)
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('test-audio-event', { detail: 'waiting' })))
  await expect(playback).toHaveAccessibleName(/^Play recording/)
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('test-audio-event', { detail: 'error' })))
  await expect(playback).toHaveAccessibleName(/^Play recording/)
  await playback.click()
  await expect(playback).toHaveAccessibleName(/^Pause/)
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('test-audio-event', { detail: 'waiting' })))
  await expect(playback).toHaveAccessibleName(/^Loading recording/)
  await expect(feature.locator('.home-play-icon')).toHaveAttribute('data-state', 'loading')
  await expect(feature.locator('[data-glyph="loading"]')).toHaveCSS('animation-name', 'none')
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('test-audio-event', { detail: 'error' })))
  await expect(playback).toHaveAccessibleName(/^Retry recording/)
  await expect(read).toBeEnabled()
  await playback.click()
  await expect(playback).toHaveAccessibleName(/^Pause/)
  await read.click()
  await expect(page).toHaveURL(/\/songs\/K1$/)
})

test('Home search opens the existing palette and restores focus', async ({ page }) => {
  await setup(page)
  await page.goto('/')
  const search = home(page).getByRole('button', { name: 'Find a song' })
  await search.focus()
  await search.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(search).toBeFocused()
})

test('complete covers, continuation edge and keyboard shelf controls', async ({ page }) => {
  await setup(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const shelf = home(page).locator('.home-shelf-books')
  const rail = shelf.locator('ul')
  const covers = shelf.locator('.home-book-cover')
  await expect(covers.first().locator('img')).toHaveCSS('object-fit', 'contain')
  const bounds = (await rail.boundingBox())!
  const second = (await covers.nth(1).boundingBox())!
  const third = (await covers.nth(2).boundingBox())!
  expect(second.x + second.width).toBeLessThan(bounds.x + bounds.width)
  expect(third.x).toBeLessThan(bounds.x + bounds.width)
  expect(third.x + third.width).toBeGreaterThan(bounds.x + bounds.width)
  await shelf.getByRole('button', { name: 'Next books' }).click()
  await expect.poll(() => rail.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
  const lastBook = shelf.locator('li a').last()
  await lastBook.focus()
  const last = (await lastBook.boundingBox())!
  expect(last.x).toBeGreaterThanOrEqual(bounds.x - 4)
  expect(last.x + last.width).toBeLessThanOrEqual(bounds.x + bounds.width + 4)
})

for (const [width, height] of [[1440, 900], [1024, 768], [390, 844], [320, 568]]) {
  for (const theme of ['gaura', 'shyam']) {
    test(`visual review ${width}x${height} ${theme}`, async ({ page }, testInfo) => {
      await setup(page, theme)
      await stubMedia(page)
      await page.route('https://gaudiyakirtan.s3.amazonaws.com/**', (route) => route.abort())
      await page.setViewportSize({ width, height })
      await page.goto('/')
      const feature = home(page).locator('.home-feature')
      await expect(feature).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      await expect(home(page).getByRole('heading', { level: 1 })).toBeVisible()
      expect(await page.evaluate(() => document.fonts.check('24px "5th Avenue"'))).toBe(true)
      await page.mouse.move(0, 0)
      await page.waitForFunction(() => [...document.images].every((img) => img.complete))
      await page.waitForTimeout(250)
      await page.screenshot({ path: testInfo.outputPath(`home-v7-${width}x${height}-${theme}-initial.png`) })
      await feature.getByRole('button').click()
      await expect(feature.getByRole('button')).toHaveAccessibleName(/^Pause/)
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await page.mouse.move(0, 0)
      await page.waitForFunction(() => [...document.images].every((img) => img.complete))
      // Complete the initial grouped reveal and existing player appearance before capture.
      await page.waitForTimeout(350)
      await page.screenshot({ path: testInfo.outputPath(`home-v7-${width}x${height}-${theme}-playing.png`) })
      await page.screenshot({ path: testInfo.outputPath(`home-v7-${width}x${height}-${theme}-full.png`), fullPage: true })
      const read = (await feature.getByRole('link').boundingBox())!
      const player = (await page.getByTestId('player-widget').boundingBox())!
      const second = (await home(page).locator('.home-month-row').nth(1).boundingBox())!
      if (width === 390) {
        expect(read.y + read.height).toBeLessThan(player.y)
        expect(second.y + second.height).toBeLessThan(player.y)
      }
      if (width === 1440) {
        expect(second.y + second.height).toBeLessThan(height)
        expect((await home(page).locator('.home-shelf-books').boundingBox())!.y).toBeLessThan(height - 80)
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    })
  }
}

for (const theme of ['gaura', 'shyam']) {
  test(`${theme}: source order, focus, hover and complete observance disclosure`, async ({ page }, testInfo) => {
    await setup(page, theme)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    const read = home(page).getByRole('link', { name: /^Read & sing/ })
    await home(page).getByRole('button', { name: 'Find a song' }).focus()
    await page.keyboard.press('Tab')
    await expect(read).toBeFocused()
    await expect(read).toHaveCSS('outline-width', '2px')
    await expect(read).toHaveCSS('outline-offset', '2px')
    await page.screenshot({ path: testInfo.outputPath(`home-v7-${theme}-focus.png`) })
    await read.hover()
    await expect(read.locator('.home-arrow')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 2, 0)')
    await page.keyboard.press('Tab')
    await expect(home(page).locator('.home-play-action')).toBeFocused()
    await page.keyboard.press('Tab')
    const disclosure = home(page).locator('.home-observances summary')
    await expect(disclosure).toBeFocused()
    await disclosure.press('Enter')
    await expect(home(page).locator('.home-observances p')).toBeVisible()
    await expect(home(page).locator('.home-observances p')).toContainText('Bhīṣma-pañcaka')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`home-v7-${theme}-observances.png`) })
    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
    await read.focus()
    await expect(read).toHaveCSS('outline-style', 'solid')
    await expect(read.locator('.home-arrow')).toHaveCSS('transform', 'none')
    await expect(home(page).locator('.home-rhythm-field')).toBeHidden()
  })
}

test('empty Home data omits discovery and keeps song browsing available', async ({ page }) => {
  await setup(page)
  await page.route('**/_next/data/**/index.json', async (route) => {
    if (route.request().method() !== 'GET') return route.continue()
    const response = await route.fetch({ headers: { ...route.request().headers(), 'if-none-match': '', 'if-modified-since': '' } })
    const data = await response.json()
    Object.assign(data.pageProps, { referenceListings: [], trackSongsByUid: {}, trackAuthors: {}, books: [], topics: [], authors: [] })
    await route.fulfill({ response, json: data })
  })
  await page.goto('/about')
  await page.getByRole('link', { name: 'Gaudiya Kirtan home', exact: true }).click()
  await expect(home(page).getByRole('link', { name: 'Browse songs' })).toHaveAttribute('href', '/songs')
  await expect(home(page).locator('.home-play-action')).toHaveCount(0)
  await expect(home(page).locator('.home-discovery > *')).toHaveCount(0)
  await expect(home(page).getByText('No songs are specific to this month.')).toBeVisible()
})

test('long featured titles and missing covers survive narrow reflow', async ({ page }, testInfo) => {
  await setup(page)
  await page.setViewportSize({ width: 320, height: 568 })
  const title = 'śrī-rādhā-kṛṣṇa-pada-kamala-bhajana — a song with a long title for reading and singing'
  await page.route('**/_next/data/**/index.json', async (route) => {
    if (route.request().method() !== 'GET') return route.continue()
    const response = await route.fetch({ headers: { ...route.request().headers(), 'if-none-match': '', 'if-modified-since': '' } })
    const data = await response.json()
    data.pageProps.trackSongsByUid.K1.titleMain = [{ scriptCode: 'Latn', text: title }]
    await route.fulfill({ response, json: data })
  })
  await page.route('**/covers/**', (route) => route.abort())
  await page.goto('/about')
  await page.getByTestId('mobile-header').getByRole('link').click()
  await page.evaluate(() => document.fonts.ready)
  await expect(home(page).getByRole('heading', { name: title })).toBeVisible()
  const read = home(page).getByRole('link', { name: `Read & sing ${title}` })
  await read.focus()
  const rect = (await read.boundingBox())!
  expect(rect.y).toBeGreaterThanOrEqual(56)
  expect(rect.y + rect.height).toBeLessThanOrEqual(568)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(home(page).locator('.home-book-fallback').first()).not.toBeEmpty()
  await home(page).locator('.home-opening').evaluate((el) => Promise.all(el.getAnimations().map((animation) => animation.finished)))
  await page.screenshot({ path: testInfo.outputPath('home-v7-long-title.png') })
})
