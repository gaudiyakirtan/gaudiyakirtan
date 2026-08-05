// End-to-end tests for the two search presentations (docs/screens/search.md v9): a full-screen
// search *page* below the 768 px breakpoint, the unchanged centered command-palette card above it.
// Geometry, the background-scroll lock and the close affordances are all browser-only behaviour, so
// this is the layer that can pin them.
import { expect, test, type Page } from '@playwright/test'

const dialog = (page: Page) => page.getByRole('dialog', { name: 'Search' })
const panel = (page: Page) => page.getByTestId('search-panel')
const input = (page: Page) => dialog(page).getByPlaceholder(/Search songs/i)
const rows = (page: Page) => dialog(page).locator('button[data-idx]')
const results = (page: Page) => dialog(page).locator('#search-results')

// The mobile header's Search button only exists once the app has hydrated, so waiting for it is how
// we know the global ⌘K listener is attached (same signal search.spec.ts uses).
async function openSearch(page: Page, path = '/') {
  await page.goto(path)
  await page.getByRole('button', { name: 'Search' }).first().waitFor({ state: 'visible' })
  await page.keyboard.press('ControlOrMeta+k')
  await expect(input(page)).toBeVisible()
}

const bodyOverflowY = (page: Page) => page.evaluate(() => document.body.style.overflowY)

// Tailwind v4 emits `oklab(0 0 0 / 0.5)` where v3 emitted `rgba(0, 0, 0, 0.5)`, so the dimmed
// backdrop is identified by its alpha rather than by a colour-space-specific string.
const backdropIsDimmed = async (page: Page) =>
  /\/\s*0\.5\)$|,\s*0\.5\)$/.test(
    await dialog(page).evaluate((el) => getComputedStyle(el).backgroundColor),
  )

test.describe('mobile search — full-screen page', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('fills the usable viewport edge to edge, with no card chrome', async ({ page }) => {
    await openSearch(page)

    // The surface is the viewport: no gutter, no top offset, no leftover strip of the page.
    expect(await dialog(page).boundingBox()).toEqual({ x: 0, y: 0, width: 390, height: 844 })

    const surface = panel(page)
    expect((await surface.boundingBox())!.width).toBe(390)
    await expect(surface).toHaveCSS('border-top-left-radius', '0px')
    await expect(surface).toHaveCSS('border-bottom-right-radius', '0px')
    // A page has no dimmed backdrop behind it — the surface is opaque all the way out.
    expect(await backdropIsDimmed(page)).toBe(false)

    // The desktop keyboard hints (which name physical keys) are not rendered here.
    await expect(dialog(page).getByText('↑↓ navigate')).toBeHidden()

    // The input keeps its place at the top and the results take the rest of the height.
    const header = (await input(page).boundingBox())!
    const list = (await results(page).boundingBox())!
    expect(header.y).toBeLessThan(60)
    expect(list.y + list.height).toBeGreaterThan(800)
  })

  test('scrolls results internally without moving the page behind it', async ({ page }) => {
    // Open from a scrolled position: the lock must hold the page exactly where it was, and give it
    // back at the same place (the reason it never resorts to `position: fixed` on the body).
    await page.goto('/songs')
    await page.getByRole('button', { name: 'Search' }).first().waitFor({ state: 'visible' })
    await page.evaluate(() => window.scrollTo(0, 400))
    await page.keyboard.press('ControlOrMeta+k')
    await expect(input(page)).toBeVisible()
    expect(await page.evaluate(() => window.scrollY)).toBe(400)
    expect(await bodyOverflowY(page)).toBe('hidden')

    await input(page).fill('radha')
    await expect(rows(page).nth(8)).toBeVisible()

    await results(page).evaluate((list) => list.scrollTo(0, 600))
    expect(await results(page).evaluate((list) => list.scrollTop)).toBeGreaterThan(0)
    expect(await page.evaluate(() => window.scrollY)).toBe(400)

    await page.getByRole('button', { name: 'Close search' }).click()
    await expect(dialog(page)).toHaveCount(0)
    expect(await page.evaluate(() => window.scrollY)).toBe(400)
  })

  test('restores the page scroll style on every close path without clobbering it', async ({ page }) => {
    await openSearch(page)
    expect(await bodyOverflowY(page)).toBe('hidden')

    // 1. the back button
    await page.getByRole('button', { name: 'Close search' }).click()
    await expect(dialog(page)).toHaveCount(0)
    expect(await bodyOverflowY(page)).toBe('')
    // globals.css owns `overflow-x: clip` on body (it is what keeps position: sticky working
    // app-wide); the lock must hand the property back untouched.
    expect(await page.evaluate(() => document.body.getAttribute('style'))).not.toContain('overflow')

    // 2. Escape, from a phone with an attached keyboard
    await page.keyboard.press('ControlOrMeta+k')
    await expect(input(page)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog(page)).toHaveCount(0)
    expect(await bodyOverflowY(page)).toBe('')

    // 3. tapping a result — the surface closes, the page navigates and can scroll again
    await page.keyboard.press('ControlOrMeta+k')
    await input(page).fill('nitai pada kamala')
    await expect(rows(page).first()).toBeVisible()
    await rows(page).first().click()
    await page.waitForURL(/\/songs\/.+/)
    await expect(dialog(page)).toHaveCount(0)
    expect(await bodyOverflowY(page)).toBe('')
  })

  test('focuses the input on open and clears the query from the surface itself', async ({ page }) => {
    await openSearch(page)
    await expect(input(page)).toBeFocused()

    const clear = dialog(page).getByRole('button', { name: 'Clear search' })
    await expect(clear).toBeHidden() // nothing to clear yet

    await input(page).fill('radha')
    await expect(rows(page).first()).toBeVisible()
    await clear.click()
    await expect(input(page)).toHaveValue('')
    await expect(input(page)).toBeFocused() // clearing hands the caret back, keyboard stays up
    await expect(rows(page)).toHaveCount(0)
  })

  test('keeps arrow-key selection announced while focus stays in the input', async ({ page }) => {
    await openSearch(page)
    await input(page).fill('radha')
    await expect(rows(page).first()).toBeVisible()

    await expect(input(page)).toHaveAttribute('aria-activedescendant', 'search-result-0')
    await expect(rows(page).first()).toHaveAttribute('aria-selected', 'true')

    await page.keyboard.press('ArrowDown')
    await expect(input(page)).toHaveAttribute('aria-activedescendant', 'search-result-1')
    await expect(rows(page).nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(input(page)).toBeFocused()

    await page.keyboard.press('Enter')
    await page.waitForURL((url) => url.pathname !== '/')
    await expect(dialog(page)).toHaveCount(0)
  })

  test('closes on a navigation that did not come from a result', async ({ page }) => {
    await page.goto('/songs') // seed history so there is somewhere to go back to
    await openSearch(page, '/')
    expect(await bodyOverflowY(page)).toBe('hidden')

    await page.goBack() // the hardware/browser back button, from outside the surface
    await page.waitForURL('**/songs')
    await expect(dialog(page)).toHaveCount(0)
    expect(await bodyOverflowY(page)).toBe('')
  })
})

test.describe('desktop search — centered command palette', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('keeps the v2 card: centered, capped width, rounded, over a dimmed backdrop', async ({ page }) => {
    await openSearch(page)

    const card = (await panel(page).boundingBox())!
    expect(card.width).toBe(576) // max-w-xl
    expect(Math.round(card.x + card.width / 2)).toBe(640) // centered
    expect(Math.round(card.y)).toBe(96) // 12vh of 800
    expect(card.height).toBeLessThan(600) // an auto-height card, not the viewport

    await expect(panel(page)).toHaveCSS('border-top-left-radius', '16px')
    expect(await backdropIsDimmed(page)).toBe(true)

    // Desktop-only chrome: the Esc cap and the keyboard hint footer.
    await expect(dialog(page).getByText('Esc', { exact: true })).toBeVisible()
    await expect(dialog(page).getByText('↑↓ navigate')).toBeVisible()
    // …and no mobile back/clear buttons.
    await expect(dialog(page).getByRole('button', { name: 'Close search' })).toBeHidden()
    await input(page).fill('radha')
    await expect(dialog(page).getByRole('button', { name: 'Clear search' })).toBeHidden()
  })

  test('caps the results region and dismisses on the backdrop', async ({ page }) => {
    await openSearch(page)
    await input(page).fill('radha')
    await expect(rows(page).first()).toBeVisible()

    const list = (await results(page).boundingBox())!
    expect(list.height).toBeLessThanOrEqual(800 * 0.55 + 1) // max-h-[55vh]
    expect(await results(page).evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true)

    await dialog(page).click({ position: { x: 5, y: 5 } })
    await expect(dialog(page)).toHaveCount(0)
    expect(await bodyOverflowY(page)).toBe('')
  })
})
