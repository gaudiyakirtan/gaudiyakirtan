import { expect, test, type Page } from '@playwright/test'

const mobileHeader = (page: Page) => page.getByTestId('mobile-header')

async function expectHeaderState(page: Page, state: 'visible' | 'hidden') {
  await expect(mobileHeader(page)).toHaveAttribute('data-scroll-state', state)
}

/**
 * Where the wordmark's *ink* actually lands, which is not where its box lands: the brand face
 * overflows its em box, so a box-only assertion would happily pass on a header that shaves the
 * ascenders and the `y` tail. Ink is derived from the baseline (recovered from a letter box plus
 * the face's own half-leading) and the rasterizer's own bounds for the string.
 */
async function measureWordmarkInk(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  return page.evaluate(() => {
    const header = document.querySelector('[data-testid="mobile-header"]')!
    const clip = header.querySelector('a[href="/"]')!
    const mark = clip.querySelector('[role="img"]')!
    const style = getComputedStyle(mark)

    const ctx = document.createElement('canvas').getContext('2d')!
    ctx.font = `${style.fontSize} ${style.fontFamily}`
    const string = ctx.measureText(mark.getAttribute('aria-label') ?? '')
    const cap = ctx.measureText('G')

    // The letters are flex items whose boxes are one line box tall, so the baseline sits a
    // half-leading plus an ascent below the first letter's top — and, unlike the mark's own box,
    // that is unaffected by any centering pad the mark carries.
    const letter = mark.firstElementChild!.getBoundingClientRect()
    const content = string.fontBoundingBoxAscent + string.fontBoundingBoxDescent
    const baseline = letter.top + (parseFloat(style.lineHeight) - content) / 2 + string.fontBoundingBoxAscent

    const clipBox = clip.getBoundingClientRect()
    return {
      clip: { top: clipBox.top, bottom: clipBox.bottom, height: clipBox.height },
      inkTop: baseline - string.actualBoundingBoxAscent,
      inkBottom: baseline + string.actualBoundingBoxDescent,
      // Cap-height band: what a reader perceives as the mark, descender space excluded.
      capCenter: baseline - cap.actualBoundingBoxAscent / 2,
      overflowsEmBox: content < string.actualBoundingBoxAscent + string.actualBoundingBoxDescent,
    }
  })
}

test.describe('mobile header', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('uses symmetric control slots and keeps the optional reader action aligned', async ({ page }) => {
    await page.goto('/songs/A8')

    const header = mobileHeader(page)
    const menu = header.getByRole('button', { name: 'Open menu' })
    const display = header.getByRole('button', { name: 'Display options' })
    const search = header.getByRole('button', { name: 'Search' })
    await expect(display).toBeVisible()

    const geometry = await Promise.all([header, menu, display, search].map((locator) => locator.boundingBox()))
    const [headerBox, menuBox, displayBox, searchBox] = geometry

    expect(headerBox).not.toBeNull()
    expect(headerBox!.height).toBe(56)
    const controlCenter = menuBox!.y + menuBox!.height / 2
    for (const box of [menuBox, displayBox, searchBox]) {
      expect(box).not.toBeNull()
      expect(box!.width).toBe(40)
      expect(box!.height).toBe(40)
      expect(box!.y + box!.height / 2).toBe(controlCenter)
    }
    expect(menuBox!.x).toBe(12)
    expect((await header.locator('a[href="/"]').boundingBox())!.x - (menuBox!.x + menuBox!.width)).toBe(4)
    expect(searchBox!.x + searchBox!.width).toBe(378)
    expect(searchBox!.x - (displayBox!.x + displayBox!.width)).toBe(4)

    // A non-reader route renders no placeholder for Display: Search remains in the final slot.
    await page.goto('/tracks')
    await expect(display).toHaveCount(0)
    const searchOnlyBox = await search.boundingBox()
    expect(searchOnlyBox).not.toBeNull()
    expect(searchOnlyBox!.x + searchOnlyBox!.width).toBe(378)
  })

  test('draws the wordmark unclipped and optically centered on the control axis', async ({ page }) => {
    await page.goto('/songs/A8')

    const header = mobileHeader(page)
    const brand = header.locator('a[href="/"]')
    const menu = header.getByRole('button', { name: 'Open menu' })
    await expect(header.getByRole('button', { name: 'Display options' })).toBeVisible()
    await expect(brand).toHaveAccessibleName('Gaudiya Kirtan')

    // The brand link is a control-sized slot on the control axis, not a box the height of its text.
    const menuBox = (await menu.boundingBox())!
    const brandBox = (await brand.boundingBox())!
    const controlCenter = menuBox.y + menuBox.height / 2
    expect(brandBox.height).toBe(40)
    expect(brandBox.y + brandBox.height / 2).toBe(controlCenter)

    for (const route of ['/songs/A8', '/tracks']) {
      await page.goto(route)
      const ink = await measureWordmarkInk(page)

      // The premise: this face's ink is taller than its em box. If that ever stops being true the
      // assertions below stop meaning anything, so fail loudly rather than pass vacuously.
      expect(ink.overflowsEmBox, `wordmark ink should overflow its em box on ${route}`).toBe(true)

      // …so the clip box must be taller than the ink: it trims width, never glyphs.
      expect(ink.inkTop, `wordmark top clipped on ${route}`).toBeGreaterThan(ink.clip.top)
      expect(ink.inkBottom, `wordmark tail clipped on ${route}`).toBeLessThan(ink.clip.bottom)

      // Optically centered: the cap-height band shares the axis, within a sub-pixel of rounding.
      expect(Math.abs(ink.capCenter - controlCenter), `wordmark off-axis on ${route}`).toBeLessThan(1)
    }
  })

  test('hides down, reveals up, resets at the top and reveals before menu or search opens', async ({ page }) => {
    await page.goto('/tracks')
    await expectHeaderState(page, 'visible')

    await page.evaluate(() => window.scrollTo(0, 56))
    await expectHeaderState(page, 'visible')
    await page.evaluate(() => window.scrollTo(0, 67))
    await expectHeaderState(page, 'visible')
    await page.evaluate(() => window.scrollTo(0, 68))
    await expectHeaderState(page, 'hidden')

    // A small reversal cannot reveal it; the complete 8 px upward threshold can.
    await page.evaluate(() => window.scrollTo(0, 66))
    await expectHeaderState(page, 'hidden')
    await page.evaluate(() => window.scrollTo(0, 60))
    await expectHeaderState(page, 'visible')

    await page.evaluate(() => window.scrollTo(0, 100))
    await expectHeaderState(page, 'hidden')
    await page.keyboard.press('Control+k')
    await expectHeaderState(page, 'visible')
    const searchDialog = page.getByRole('dialog', { name: 'Search' })
    await expect(searchDialog).toBeVisible()
    await searchDialog.click({ position: { x: 2, y: 2 } })
    await expect(searchDialog).toHaveCount(0)

    await page.evaluate(() => window.scrollTo(0, 140))
    await expectHeaderState(page, 'hidden')
    await page.getByRole('button', { name: 'Open menu' }).evaluate((button) =>
      (button as HTMLButtonElement).click(),
    )
    await expectHeaderState(page, 'visible')
    await expect(page.locator('aside')).toHaveClass(/translate-x-0/)
    await page.locator('div[aria-hidden="true"].fixed.inset-0').click({ position: { x: 380, y: 400 } })

    await page.evaluate(() => window.scrollTo(0, 0))
    await expectHeaderState(page, 'visible')
  })

  test('route navigation and breakpoint changes reset it without affecting desktop', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('sidebar-collapsed', '0'))
    await page.goto('/tracks')
    await page.evaluate(() => window.scrollTo(0, 160))
    await expectHeaderState(page, 'hidden')

    // Invoke a real Next Link without Playwright auto-scrolling it into view first.
    await page.locator('a[href^="/songs/"]').first().evaluate((link: HTMLAnchorElement) => link.click())
    await page.waitForURL(/\/songs\/.+/)
    await expectHeaderState(page, 'visible')

    await page.evaluate(() => window.scrollTo(0, 160))
    await expectHeaderState(page, 'hidden')
    await page.setViewportSize({ width: 768, height: 844 })
    await expectHeaderState(page, 'visible')
    await expect(mobileHeader(page)).toBeHidden()

    const desktopSidebar = page.locator('aside')
    await expect.poll(async () => (await desktopSidebar.boundingBox())?.x).toBe(0)
    const sidebarBefore = await desktopSidebar.boundingBox()
    await page.evaluate(() => window.scrollTo(0, 320))
    const sidebarAfter = await desktopSidebar.boundingBox()
    expect(sidebarAfter).toEqual(sidebarBefore)
  })

  test('reduced motion removes the transition without removing scroll behavior', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/tracks')

    await expect(mobileHeader(page)).toHaveCSS('transition-property', 'none')
    await page.evaluate(() => window.scrollTo(0, 68))
    await expectHeaderState(page, 'hidden')
    await page.evaluate(() => window.scrollTo(0, 60))
    await expectHeaderState(page, 'visible')
  })
})
