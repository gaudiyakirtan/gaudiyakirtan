import { expect, test, type Page } from '@playwright/test'

const shortcutHints = (page: Page) => page.locator('[data-shortcut-hint="true"]')
const revealedHints = (page: Page) => page.locator('[data-shortcut-visible="true"]')

test.describe('hold-to-reveal keyboard shortcuts', () => {
  test('reveals the actual held modifier at the desktop Search control without reflow', async ({ page }) => {
    await page.goto('/')

    const searchButton = page.getByTestId('sidebar').getByRole('button', { name: 'Search' })
    const hint = page.getByTestId('sidebar-search-shortcut')
    const before = await searchButton.boundingBox()

    await expect(searchButton).toHaveAttribute('aria-keyshortcuts', 'Meta+K Control+K')
    await expect(revealedHints(page)).toHaveCount(0)

    await page.keyboard.down('Control')
    await expect(hint).toHaveAttribute('data-shortcut-visible', 'true')
    await expect(hint).toHaveText('Ctrl K')
    expect(await searchButton.boundingBox()).toEqual(before)

    await page.keyboard.up('Control')
    await expect(revealedHints(page)).toHaveCount(0)

    await page.keyboard.down('Meta')
    await expect(hint).toHaveAttribute('data-shortcut-visible', 'true')
    await expect(hint).toHaveText('⌘ K')

    // A focus-taking OS/browser shortcut can swallow key-up; blur is the required escape hatch.
    await page.evaluate(() => window.dispatchEvent(new Event('blur')))
    await expect(revealedHints(page)).toHaveCount(0)
    await page.keyboard.up('Meta')
  })

  test('reveals Search-local keys at the controls they affect without resizing the palette', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Control+k')

    const panel = page.getByTestId('search-panel')
    const input = page.getByRole('combobox', { name: 'Search' })
    await input.fill('narada')
    await expect(page.getByRole('option').first()).toBeVisible()

    const before = await panel.boundingBox()
    await page.keyboard.down('Control')

    await expect(page.getByTestId('desktop-search-close-shortcut')).toHaveAttribute('data-shortcut-visible', 'true')
    await expect(page.getByTestId('search-navigate-shortcut')).toHaveAttribute('data-shortcut-visible', 'true')
    await expect(page.getByTestId('search-open-shortcut')).toHaveAttribute('data-shortcut-visible', 'true')
    await expect(page.getByTestId('search-open-shortcut')).toHaveText('Enter')
    expect(await panel.boundingBox()).toEqual(before)

    await page.keyboard.up('Control')
    await expect(revealedHints(page)).toHaveCount(0)
    await expect(shortcutHints(page)).not.toHaveCount(0)
  })

  test('supports an attached keyboard on the full-screen mobile Search surface', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.keyboard.press('Control+k')

    const panel = page.getByTestId('search-panel')
    await page.getByRole('combobox', { name: 'Search' }).fill('narada')
    await expect(page.getByRole('option').first()).toBeVisible()

    const before = await panel.boundingBox()
    await page.keyboard.down('Control')

    await expect(page.getByTestId('mobile-search-close-shortcut')).toHaveAttribute('data-shortcut-visible', 'true')
    await expect(page.getByTestId('search-navigate-shortcut')).toHaveAttribute('data-shortcut-visible', 'true')
    await expect(page.getByTestId('search-open-shortcut')).toHaveAttribute('data-shortcut-visible', 'true')
    expect(await panel.boundingBox()).toEqual(before)

    await page.keyboard.up('Control')
  })
})
