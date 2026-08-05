import { expect, test } from '@playwright/test'

test('open-song action returns to the loaded song instead of the differently armed page', async ({ page }) => {
  await page.goto('/songs/A8')
  await expect(page.getByRole('link', { name: /Open song/i })).toHaveCount(0)

  // A song page arms its idle player circle. Starting it loads A8 into the global player; playback
  // itself may succeed or reach the supported error state without changing this navigation test.
  await page.getByRole('button', { name: 'Play', exact: true }).last().click()
  const openLoadedSong = page.getByRole('link', { name: 'Open song “yaśomatī-nandana”' })
  await expect(openLoadedSong).toBeVisible()
  await expect(openLoadedSong).toHaveAttribute('title', 'Open song “yaśomatī-nandana”')

  await page.getByRole('button', { name: 'Collapse player' }).click()
  await expect(openLoadedSong).toHaveCount(0)
  await page.getByRole('button', { name: 'Expand player' }).click()
  await expect(openLoadedSong).toBeVisible()

  // Both hops are app interactions (`Link`/router.push), so PlayerProvider stays mounted. Opening
  // A9 arms that page while A8 remains the song actually loaded in the mini-player.
  await page.getByRole('link', { name: 'Songs', exact: true }).first().click()
  await page.waitForURL('**/songs')
  await page.getByText('A9', { exact: true }).click()
  await page.waitForURL('**/songs/A9')
  await expect(page.getByText(/Play “bhaja bhakata-batsala/i)).toBeVisible()

  await page.getByRole('button', { name: 'Choose recording' }).click()
  await expect(page.getByText('Recordings', { exact: true })).toBeVisible()
  await openLoadedSong.click()
  await page.waitForURL('**/songs/A8')
  expect(new URL(page.url()).pathname).toBe('/songs/A8')
  await expect(page.getByText('Recordings', { exact: true })).toHaveCount(0)

  // The same action is still present: navigation preserved the loaded player session rather than
  // replacing it with the destination page's armed song or remounting the provider.
  await expect(page.getByRole('link', { name: 'Open song “yaśomatī-nandana”' })).toBeVisible()
})

test('open-song arrow follows the final line of a wrapped title and animates in place', async ({ page }) => {
  // Match the phone-width acceptance screenshot and exercise the two-line hyphenated-title case.
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/songs/NK31')
  await page.getByRole('button', { name: 'Play', exact: true }).last().click()

  const openSong = page.getByRole('link', { name: 'Open song “aṅga-upāṅga-astra-pārṣada-saṅge”' })
  const title = page.getByTestId('player-song-title-text')
  await expect(openSong).toBeVisible()
  await expect(title).toHaveText('aṅga-upāṅga-astra-pārṣada-saṅge')

  const measureInlineLayout = () => page.evaluate(() => {
    const titleNode = document.querySelector<HTMLElement>('[data-testid="player-song-title-text"]')
    const link = document.querySelector<HTMLElement>('[aria-label="Open song “aṅga-upāṅga-astra-pārṣada-saṅge”"]')
    const suffixNode = document.querySelector<HTMLElement>('[data-testid="player-song-title-suffix"]')
    const text = suffixNode?.firstChild
    if (!titleNode || !link || !text?.textContent) return null

    const finalGlyph = document.createRange()
    finalGlyph.setStart(text, text.textContent.length - 1)
    finalGlyph.setEnd(text, text.textContent.length)
    const glyphRect = finalGlyph.getBoundingClientRect()
    const linkRect = link.getBoundingClientRect()

    return {
      titleLineCount: titleNode.getClientRects().length,
      horizontalGap: linkRect.left - glyphRect.right,
      verticalCenterDelta: Math.abs(
        (linkRect.top + linkRect.height / 2) - (glyphRect.top + glyphRect.height / 2),
      ),
    }
  })
  const inlineLayout = await measureInlineLayout()

  expect(inlineLayout).not.toBeNull()
  expect(inlineLayout!.titleLineCount).toBeGreaterThan(1)
  expect(inlineLayout!.horizontalGap).toBeGreaterThanOrEqual(0)
  expect(inlineLayout!.horizontalGap).toBeLessThanOrEqual(8)
  expect(inlineLayout!.verticalCenterDelta).toBeLessThanOrEqual(4)

  const arrowViewport = openSong.getByTestId('open-song-arrow-viewport')
  const arrowGlyph = openSong.getByTestId('open-song-arrow-glyph')
  await expect(arrowViewport).toHaveCSS('overflow', 'hidden')
  await openSong.hover()
  await expect.poll(async () => arrowGlyph.evaluate((node) => getComputedStyle(node).transform)).not.toBe('none')
  await expect.poll(async () => arrowGlyph.evaluate((node) => getComputedStyle(node).transform))
    .toMatch(/none|matrix\(1, 0, 0, 1, 0, 0\)/)
  await expect(arrowGlyph).toHaveCSS('opacity', '1')
  const layoutAfterAnimation = await measureInlineLayout()
  expect(layoutAfterAnimation).not.toBeNull()
  expect(layoutAfterAnimation!.horizontalGap).toBeLessThanOrEqual(8)
  expect(layoutAfterAnimation!.verticalCenterDelta).toBeLessThanOrEqual(4)
})
