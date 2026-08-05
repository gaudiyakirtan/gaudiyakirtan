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
