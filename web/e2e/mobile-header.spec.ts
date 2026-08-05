import { expect, test, type Page } from '@playwright/test'

const mobileHeader = (page: Page) => page.getByTestId('mobile-header')

async function expectHeaderState(page: Page, state: 'visible' | 'hidden') {
  await expect(mobileHeader(page)).toHaveAttribute('data-scroll-state', state)
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
