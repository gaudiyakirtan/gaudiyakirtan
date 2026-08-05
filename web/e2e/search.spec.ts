// End-to-end tests for search (docs/screens/search.md v5–v6): the ⌘K command palette and the 404
// URL rescuer, exercised in a real browser against a production build. These pin the behaviour the
// unit tests cannot — the palette actually opening, the content index lazy-loading, and the 404 page
// resolving and redirecting client-side.
import { test, expect, type Page } from '@playwright/test'

const palette = (page: Page) => page.getByRole('dialog', { name: 'Search' })
const input = (page: Page) => palette(page).getByPlaceholder(/Search songs/i)
const rows = (page: Page) => palette(page).locator('button[data-idx]')
// The Search button is a DOM element that works the moment it renders, unlike the global ⌘K
// listener which is only attached after hydration — so it doubles as a hydration signal and a
// robust way to open the palette.
const searchButton = (page: Page) => page.getByRole('button', { name: 'Search' }).first()

async function openPalette(page: Page) {
  await page.goto('/')
  await searchButton(page).waitFor({ state: 'visible' }) // hydration done → the ⌘K listener is live
  await page.keyboard.press('ControlOrMeta+k')
  await expect(input(page)).toBeVisible()
  // The content index loads lazily on open; the result assertions auto-retry while it arrives, so no
  // explicit wait is needed (and waiting on the response races a cached one).
}

test('⌘K opens the palette once the app is interactive', async ({ page }) => {
  await page.goto('/')
  await searchButton(page).waitFor({ state: 'visible' }) // hydration done → the ⌘K listener is live
  await page.keyboard.press('ControlOrMeta+k')
  await expect(input(page)).toBeVisible()
})

test('the palette finds a song by its title', async ({ page }) => {
  await openPalette(page)
  await input(page).fill('nitai pada kamala')
  await expect(rows(page).first()).toContainText('nitāi-pada-kamala')
})

test('a page is found from a typo', async ({ page }) => {
  await openPalette(page)
  await input(page).fill('setings')
  await expect(rows(page).first()).toContainText('Settings')
})

test('a song is found by a line of its verse text, badged "in text"', async ({ page }) => {
  await openPalette(page)
  await input(page).fill('radhika charana renu')
  // The row that matched on content (not title) carries the "in text" badge.
  const inText = rows(page).filter({ hasText: /in text/i }).first()
  await expect(inText).toBeVisible()
})

test('a Bengali query returns the same top hit as its Latin spelling', async ({ page }) => {
  await openPalette(page)

  await input(page).fill('radhika')
  // The 673 KB entity index lands a moment after open; until it does the palette can only rank the
  // dozen bundled *page* entries, and reading the top hit right away races that (it would compare a
  // pre-index Latin hit against a post-index Bengali one). Every entity row carries a non-"page"
  // type badge, so waiting for one is waiting for the index — with the retry `innerText` lacks.
  await expect(rows(page).first()).not.toContainText('page')
  const latinTop = (await rows(page).first().innerText()).split('\n')[0].trim()

  await input(page).fill('') // clear
  await input(page).fill('রাধিকা') // Bengali "rādhikā"
  const bengaliTop = (await rows(page).first().innerText()).split('\n')[0].trim()

  expect(bengaliTop).toBe(latinTop)
})

test('a Devanagari query finds its song', async ({ page }) => {
  await openPalette(page)
  await input(page).fill('जय जय गुरुदेव') // "jaya jaya gurudeba…"
  await expect(rows(page).first()).toContainText('jaya jaya gurudeba')
})

test('results render in the reader\'s listLanguage script, not always romanized', async ({ page }) => {
  // Reader has Bengali selected — the merge with defaults means a partial stored setting is enough.
  await page.addInitScript(() => localStorage.setItem('gk-settings', JSON.stringify({ listLanguage: 'Beng' })))
  await page.goto('/')
  await searchButton(page).waitFor({ state: 'visible' })
  await page.keyboard.press('ControlOrMeta+k')
  await expect(input(page)).toBeVisible()
  await input(page).fill('akrodah') // matches on the romanized label, but the title must DISPLAY in Bengali
  const title = rows(page).first().locator('.text-sm').first()
  await expect(title).toHaveText(/[ঀ-৿]/) // a Bengali-block character
  await expect(title).not.toHaveText(/akrodha/i) // not the romanized label
})

test('the 404 page rescues a misspelled path client-side', async ({ page }) => {
  await page.goto('/setings')
  await page.waitForURL('**/settings', { timeout: 5000 })
  expect(new URL(page.url()).pathname).toBe('/settings')
})

test('the 404 page leaves a genuinely ambiguous path on 404', async ({ page }) => {
  await page.goto('/xyzzy')
  // Nothing to resolve to — the URL stays put and the not-found copy shows.
  await expect(page.getByText(/wandered off/i).first()).toBeVisible({ timeout: 5000 })
  expect(new URL(page.url()).pathname).toBe('/xyzzy')
})
