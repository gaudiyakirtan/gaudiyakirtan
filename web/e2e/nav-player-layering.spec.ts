import { expect, test, type Locator, type Page } from '@playwright/test'

/**
 * Layer order between the mobile navigation drawer and the mini-player
 * (docs/screens/navigation.md v3 §"Layer order (web)" + player.md v13).
 *
 * The regression these guard: the player outranked the drawer's scrim, so a loaded mini-player
 * floated lit and clickable above the dim while the menu was open.
 */

const PHONE = { width: 390, height: 844 }

const widget = (page: Page) => page.getByTestId('player-widget')
const scrim = (page: Page) => page.getByTestId('nav-scrim')
const drawer = (page: Page) => page.getByTestId('sidebar')

/** Open the menu without a real mouse press, so the pointer-driven dismissals are not what fires. */
async function openMenuByKeyboard(page: Page) {
  await page.getByRole('button', { name: 'Open menu' }).press('Enter')
  await expect(scrim(page)).toBeVisible()
}

async function openMenu(page: Page) {
  // `evaluate` rather than `click()` so Playwright does not scroll the header into view first.
  await page.getByRole('button', { name: 'Open menu' }).evaluate((b) => (b as HTMLButtonElement).click())
  await expect(scrim(page)).toBeVisible()
}

async function closeMenuViaScrim(page: Page) {
  await scrim(page).click({ position: { x: 370, y: 700 } })
  await expect(scrim(page)).toHaveCount(0)
  // The drawer slides out over 300 ms and overlaps the phone-width card while it does, so wait for
  // it to leave before asserting anything about what the reader can now reach.
  await expect.poll(async () => (await drawer(page).boundingBox())?.x).toBeLessThanOrEqual(-256)
}

const zIndexOf = (locator: Locator) =>
  locator.evaluate((el) => Number(getComputedStyle(el).zIndex))

/**
 * What is actually painted on top of an element. Sampled 8 px inside its right edge rather than at
 * its centre: at 390 px the 256 px-wide drawer overlaps the left half of the player card, so a
 * centre sample would answer "drawer" or "scrim" depending on where the slide-in animation had got
 * to. The right edge of every player state (card, circle, FAB) is clear of the drawer, which makes
 * "the scrim covers the player" the thing being asserted.
 */
const topmostAt = (locator: Locator) =>
  locator.evaluate((el) => {
    const box = el.getBoundingClientRect()
    const hit = document.elementFromPoint(box.right - 8, box.y + box.height / 2)
    if (!hit) return 'nothing'
    if (hit.closest('[data-testid="nav-scrim"]')) return 'scrim'
    if (hit.closest('[data-testid="sidebar"]')) return 'drawer'
    if (hit.closest('[data-testid="player-widget"]')) return 'player'
    return 'page'
  })

/** Everything about the player a reader would notice surviving (or not surviving) the drawer. */
async function playerState(page: Page) {
  const box = await widget(page).boundingBox()
  return {
    x: Math.round(box!.x),
    y: Math.round(box!.y),
    width: Math.round(box!.width),
    height: Math.round(box!.height),
    // Present in both the normal and the "Audio unavailable" card, so this holds either way.
    transport: await widget(page).getByRole('button', { name: /^(Play|Pause)$/ }).first().getAttribute('aria-label'),
    expanded: await widget(page).getByRole('button', { name: 'Collapse player' }).count(),
    elapsed: await widget(page).locator('span.tabular-nums').first().textContent().catch(() => null),
  }
}

/** Load A8 (5 takes) into the global player from its song page. */
async function loadPlayer(page: Page) {
  await page.goto('/songs/A8')
  await page.getByRole('button', { name: 'Play', exact: true }).last().click()
  await expect(widget(page).getByRole('link', { name: /Open song/ })).toBeVisible()
}

test.describe('mobile navigation over the player', () => {
  test.use({ viewport: PHONE })

  test('the drawer covers the loaded mini-player and hands it back unchanged', async ({ page }) => {
    await loadPlayer(page)
    await expect(widget(page)).toBeVisible()
    const before = await playerState(page)

    await openMenu(page)

    // The scale, not source order, decides this.
    const [playerZ, scrimZ, drawerZ] = await Promise.all(
      [widget(page), scrim(page), drawer(page)].map(zIndexOf),
    )
    expect(scrimZ).toBeGreaterThan(playerZ)
    expect(drawerZ).toBeGreaterThan(scrimZ)

    // The dim actually covers the player, and the drawer is not itself dimmed.
    expect(await topmostAt(widget(page))).toBe('scrim')
    await expect(drawer(page)).toHaveClass(/translate-x-0/)
    // Polled: the drawer slides in over 300 ms, so hit-test it once it has arrived.
    await expect.poll(() => topmostAt(drawer(page))).toBe('drawer')

    // Pointer AND focus are intercepted: the widget is inert, so nothing inside it is reachable.
    await expect(widget(page)).toHaveAttribute('inert', '')
    const reachable = await widget(page).evaluate((el) =>
      [...el.querySelectorAll('button, a, input')].some((node) => {
        (node as HTMLElement).focus()
        return document.activeElement === node
      }),
    )
    expect(reachable).toBe(false)

    // A tap on the backdrop still closes it, and the player is exactly as it was.
    await closeMenuViaScrim(page)
    expect(await playerState(page)).toEqual(before)
    await expect(widget(page)).not.toHaveAttribute('inert', '')
    expect(await topmostAt(widget(page))).toBe('player')

    // ...and interactive again.
    await widget(page).getByRole('button', { name: 'Collapse player' }).click()
    await expect(widget(page).getByRole('button', { name: 'Expand player' })).toBeVisible()
  })

  test('covers the collapsed circle and the armed idle FAB too', async ({ page }) => {
    // Armed idle FAB: a song page with nothing loaded yet.
    await page.goto('/songs/A8')
    await expect(widget(page)).toBeVisible()
    await openMenu(page)
    expect(await topmostAt(widget(page))).toBe('scrim')
    await closeMenuViaScrim(page)

    // Collapsed circle: loaded, then minimised.
    await page.getByRole('button', { name: 'Play', exact: true }).last().click()
    await widget(page).getByRole('button', { name: 'Collapse player' }).click()
    await expect(widget(page).getByRole('button', { name: 'Expand player' })).toBeVisible()

    await openMenu(page)
    expect(await topmostAt(widget(page))).toBe('scrim')
    await closeMenuViaScrim(page)

    // Still collapsed — the drawer changed nothing about the player.
    await expect(widget(page).getByRole('button', { name: 'Expand player' })).toBeVisible()
  })

  test('opening the menu closes an open player drop-up', async ({ page }) => {
    await loadPlayer(page)
    await widget(page).getByRole('button', { name: 'Choose recording' }).click()
    await expect(page.getByText('Recordings', { exact: true })).toBeVisible()

    // Keyboard activation: no mousedown, so the widget's outside-press dismissal never fires and
    // this is the documented behavior being tested, not a side effect of the pointer.
    await openMenuByKeyboard(page)
    await expect(page.getByText('Recordings', { exact: true })).toHaveCount(0)

    await closeMenuViaScrim(page)
    await expect(page.getByText('Recordings', { exact: true })).toHaveCount(0)
    await expect(widget(page).getByRole('link', { name: /Open song/ })).toBeVisible()
  })

  test('search stays the top-level modal, and crossing to desktop closes the drawer', async ({ page }) => {
    await loadPlayer(page)
    await openMenu(page)

    // Search from within the drawer replaces it (the drawer closes itself), and the palette is above
    // every other surface.
    await drawer(page).getByRole('button', { name: /^Search/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Search' })
    await expect(dialog).toBeVisible()
    expect(await zIndexOf(dialog)).toBeGreaterThan(await zIndexOf(drawer(page)))
    await dialog.click({ position: { x: 2, y: 2 } })
    await expect(dialog).toHaveCount(0)

    await openMenu(page)
    await page.setViewportSize({ width: 1024, height: 844 })
    await expect(scrim(page)).toHaveCount(0)
    await expect(widget(page)).not.toHaveAttribute('inert', '')
  })
})

test.describe('desktop layering is unchanged', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('no scrim, nothing inert, and the sidebar never overlaps the player', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('sidebar-collapsed', '0'))
    await loadPlayer(page)

    await expect(scrim(page)).toHaveCount(0)
    await expect(widget(page)).not.toHaveAttribute('inert', '')
    expect(await topmostAt(widget(page))).toBe('player')

    const sidebarBox = (await drawer(page).boundingBox())!
    const widgetBox = (await widget(page).boundingBox())!
    expect(sidebarBox.x).toBe(0)
    expect(widgetBox.x).toBeGreaterThan(sidebarBox.x + sidebarBox.width)

    // Collapsed sidebar still slides off-canvas and its floating re-open button stays usable.
    await page.getByRole('button', { name: 'Collapse sidebar' }).click()
    await expect.poll(async () => (await drawer(page).boundingBox())?.x).toBeLessThan(0)
    await page.getByRole('button', { name: 'Open sidebar' }).click()
    await expect.poll(async () => (await drawer(page).boundingBox())?.x).toBe(0)
    expect(await topmostAt(widget(page))).toBe('player')
  })
})
