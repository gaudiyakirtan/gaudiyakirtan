// Regression: the mobile search surface must stay opaque **past** the usable visual viewport
// (docs/screens/search.md v10).
//
// Reported from real iOS Safari: with the keyboard up, the strip between the search results and the
// keyboard — where iOS floats its password/autofill accessory bar — showed the *song page* through
// it (blue Devanagari verse text). The search content correctly stopped above the keyboard, but so
// did the opaque coverage, and iOS draws that accessory strip over the page rather than over
// browser chrome.
//
// The condition is modelled by faking `window.visualViewport`: a visual viewport shorter than the
// layout viewport is exactly what iOS reports while the keyboard is up, and it drives the real
// `useSearchViewport` → CSS-variable path rather than any test-only selector. Everything below the
// visual viewport (the "accessory gap") is then screenshotted and read back pixel by pixel: that is
// the ground truth the user photographed, and it is blind to which element does the covering.
import { expect, test, type Page } from '@playwright/test'

const PHONE = { width: 390, height: 844 }
/** What iOS takes for keyboard + accessory bar on an iPhone-14-class device, in CSS pixels. */
const KEYBOARD = 380
const USABLE = PHONE.height - KEYBOARD

/** A song whose reader is full of coloured verse/gloss text, so the gap has something to leak. */
const SONG = '/songs/A8'

const dialog = (page: Page) => page.getByRole('dialog', { name: 'Search' })
const panel = (page: Page) => page.getByTestId('search-panel')
const underlay = (page: Page) => page.getByTestId('search-underlay')
const input = (page: Page) => dialog(page).getByPlaceholder(/Search songs/i)
const rows = (page: Page) => dialog(page).locator('button[data-idx]')
const results = (page: Page) => dialog(page).locator('#search-results')

/**
 * Replaces `window.visualViewport` with a controllable stand-in before the app boots. Headless
 * Chromium has no software keyboard, and this is the only observable iOS uses to report one: the
 * layout viewport (and `100dvh`) stay tall while `visualViewport.height` shrinks.
 */
async function fakeVisualViewport(page: Page) {
  await page.addInitScript(() => {
    const target = new EventTarget()
    let height = window.innerHeight
    let offsetTop = 0
    Object.defineProperties(target, {
      height: { get: () => height },
      width: { get: () => window.innerWidth },
      offsetTop: { get: () => offsetTop },
      offsetLeft: { get: () => 0 },
      pageTop: { get: () => offsetTop },
      pageLeft: { get: () => 0 },
      scale: { get: () => 1 },
    })
    Object.defineProperty(window, '__gkViewport', {
      value: (nextHeight: number, nextOffsetTop: number) => {
        height = nextHeight
        offsetTop = nextOffsetTop
        target.dispatchEvent(new Event('resize'))
        target.dispatchEvent(new Event('scroll'))
      },
    })
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => target })
  })
}

/** Raises/lowers the simulated keyboard and waits for the surface to have taken the new metrics. */
async function setVisualViewport(page: Page, height: number, offsetTop = 0) {
  await page.evaluate(
    ([h, t]) => (window as unknown as { __gkViewport: (h: number, t: number) => void }).__gkViewport(h, t),
    [height, offsetTop],
  )
  await expect.poll(async () => (await panel(page).boundingBox())?.height).toBe(height)
}

interface IBandReading {
  total: number
  distinct: number
  dominant: string
  dominantCount: number
  /** Pixels that are not the dominant colour — text bleeding through, if any. */
  offDominant: number
}

/**
 * Screenshots a band of the viewport and reads every pixel back through a canvas. Pixels, not
 * elements: `pointer-events` and stacking are irrelevant to what the reader actually sees, and the
 * report was a photograph.
 */
async function readBand(page: Page, clip: { x: number; y: number; width: number; height: number }): Promise<IBandReading> {
  // The clip is viewport-relative arithmetic; a scrolled document would silently shift it.
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  const shot = await page.screenshot({ clip })
  return page.evaluate(async (png: string) => {
    const img = new Image()
    img.src = png
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const counts = new Map<string, number>()
    for (let i = 0; i < data.length; i += 4) {
      const key = `rgb(${data[i]}, ${data[i + 1]}, ${data[i + 2]})`
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    const [dominant, dominantCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
    const total = width * height
    return { total, distinct: counts.size, dominant, dominantCount, offDominant: total - dominantCount }
  }, `data:image/png;base64,${shot.toString('base64')}`)
}

/** The band iOS fills with the keyboard and its translucent accessory bar. */
const accessoryGap = { x: 0, y: USABLE, width: PHONE.width, height: KEYBOARD }

async function openSearchOverSong(page: Page, theme: 'shyam' | 'gaura') {
  await fakeVisualViewport(page)
  await page.addInitScript((chosen) => {
    localStorage.setItem('gk-theme', chosen)
    // Devanagari, as in the report — the leaked glyphs were the reader's native-script line.
    localStorage.setItem('gk-settings', JSON.stringify({ listLanguage: 'Deva' }))
  }, theme)
  await page.goto(SONG)
  await page.getByRole('button', { name: 'Search' }).first().waitFor({ state: 'visible' })
}

test.describe('mobile search with the iOS keyboard up', () => {
  test.use({ viewport: PHONE })

  for (const theme of ['shyam', 'gaura'] as const) {
    test(`no page pixels survive in the accessory gap — ${theme}`, async ({ page }) => {
      await openSearchOverSong(page, theme)

      // 1. The gap is a meaningful place to look: with search closed the song page paints text
      //    there. Without this the "uniform background" assertion below could pass over a blank
      //    page and prove nothing.
      const pageOnly = await readBand(page, accessoryGap)
      expect(pageOnly.distinct).toBeGreaterThan(1)
      expect(pageOnly.offDominant).toBeGreaterThan(500)

      // 2. Open search and raise the keyboard.
      await page.keyboard.press('ControlOrMeta+k')
      await expect(input(page)).toBeVisible()
      await input(page).fill('hamare')
      await expect(rows(page).first()).toBeVisible()
      await setVisualViewport(page, USABLE)

      // 3. Every pixel below the usable viewport must be the search surface's own background —
      //    exactly one colour, and the same colour the panel is painted in.
      const covered = await readBand(page, accessoryGap)
      const surfaceColour = await panel(page).evaluate((el) => getComputedStyle(el).backgroundColor)
      expect(covered.dominant).toBe(surfaceColour)
      expect(covered.offDominant).toBe(0)
      expect(covered.distinct).toBe(1)

      // 4. And the topmost element there belongs to search, not to the reader underneath.
      const owner = await page.evaluate(([x, y]) => {
        const el = document.elementFromPoint(x, y)
        const modal = document.querySelector('[role="dialog"][aria-label="Search"]')
        return { insideSearch: !!el && !!modal && modal.contains(el), tag: el?.tagName ?? 'none' }
      }, [PHONE.width / 2, USABLE + KEYBOARD / 2])
      expect(owner.insideSearch).toBe(true)
    })
  }

  test('keeps the interactive panel and its scroller above the keyboard', async ({ page }) => {
    await openSearchOverSong(page, 'shyam')
    await page.keyboard.press('ControlOrMeta+k')
    await expect(input(page)).toBeVisible()
    await input(page).fill('radha')
    await expect(rows(page).first()).toBeVisible()
    await setVisualViewport(page, USABLE)

    // The panel is what the reader touches, so it stops where the keyboard starts…
    const panelBox = (await panel(page).boundingBox())!
    expect(panelBox.y + panelBox.height).toBeCloseTo(USABLE, 0)

    // …and so does the scroller, so no result can be typed at but not seen.
    const listBox = (await results(page).boundingBox())!
    expect(listBox.y + listBox.height).toBeLessThanOrEqual(USABLE + 1)
    expect(await results(page).evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true)

    // The covering underlay is decoration only: it must not take taps or be announced.
    await expect(underlay(page)).toHaveAttribute('aria-hidden', 'true')
    await expect(underlay(page)).toHaveCSS('pointer-events', 'none')
  })

  test('follows the visual viewport up, down and offset', async ({ page }) => {
    await openSearchOverSong(page, 'shyam')
    await page.keyboard.press('ControlOrMeta+k')
    await expect(input(page)).toBeVisible()
    await input(page).fill('radha')
    await expect(rows(page).first()).toBeVisible()

    // Keyboard up, then dismissed, then up again: the panel tracks, the gap stays covered.
    await setVisualViewport(page, USABLE)
    expect((await readBand(page, accessoryGap)).distinct).toBe(1)

    await setVisualViewport(page, PHONE.height)
    expect((await panel(page).boundingBox())!.height).toBe(PHONE.height)

    await setVisualViewport(page, USABLE)
    expect((await readBand(page, accessoryGap)).distinct).toBe(1)

    // iOS also pushes the page up around a focused input, reported as `offsetTop`. The panel moves
    // down with the visible area; the underlay has to reach past the layout viewport by at least as
    // much, or the bottom of the screen is uncovered again.
    const OFFSET = 60
    await setVisualViewport(page, USABLE, OFFSET)
    const panelBox = (await panel(page).boundingBox())!
    expect(panelBox.y).toBe(OFFSET)
    expect(panelBox.height).toBe(USABLE)

    const underlayBox = (await underlay(page).boundingBox())!
    expect(underlayBox.y).toBeLessThanOrEqual(0)
    expect(underlayBox.y + underlayBox.height).toBeGreaterThanOrEqual(PHONE.height + OFFSET)
  })

  test('is unchanged when no keyboard is up', async ({ page }) => {
    await openSearchOverSong(page, 'shyam')
    await page.keyboard.press('ControlOrMeta+k')
    await expect(input(page)).toBeVisible()

    expect(await dialog(page).boundingBox()).toEqual({ x: 0, y: 0, ...PHONE })
    expect((await panel(page).boundingBox())!.height).toBe(PHONE.height)
    // Nothing of the reader shows anywhere, keyboard or no keyboard.
    expect((await readBand(page, { x: 0, y: 0, ...PHONE })).dominant).toBe(
      await panel(page).evaluate((el) => getComputedStyle(el).backgroundColor),
    )
  })
})

test.describe('desktop palette', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('renders no opaque underlay over the dimmed backdrop', async ({ page }) => {
    await fakeVisualViewport(page)
    await page.goto(SONG)
    await page.getByRole('button', { name: 'Search' }).first().waitFor({ state: 'visible' })
    await page.keyboard.press('ControlOrMeta+k')
    await expect(input(page)).toBeVisible()

    await expect(underlay(page)).toBeHidden()
    // The card is still a card: measured height, not a viewport-filling page.
    const card = (await panel(page).boundingBox())!
    expect(card.width).toBe(576)
    expect(Math.round(card.y)).toBe(96)
    expect(card.height).toBeLessThan(600)
  })
})
