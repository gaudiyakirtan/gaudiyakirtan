import { RefObject, useEffect, useState } from 'react'

/** Measure actual chrome, including the player's changing height, instead of reserving a guess. */
export function homeVisibleBounds(left: number, right: number) {
  const viewport = window.visualViewport
  const top = viewport?.offsetTop ?? 0
  const bottom = top + (viewport?.height ?? window.innerHeight)
  const header = document.querySelector('[data-testid="mobile-header"]')?.getBoundingClientRect()
  const player = document.querySelector('[data-testid="player-widget"]')?.getBoundingClientRect()
  const overlapsPlayer = player && player.right > left && player.left < right
  return {
    // Upward focus scrolling reveals the sticky header; reserve its measured height even while
    // it is translated out, so the revealed bar cannot cover the newly focused control.
    top: top + (header?.height ?? 0) + 16,
    bottom: Math.min(bottom, overlapsPlayer ? player.top : bottom) - 16,
    obstruction: player?.height ? Math.max(0, bottom - player.top) : 0,
  }
}

export function useHomeLayout(ref: RefObject<HTMLDivElement | null>) {
  const [obscured, setObscured] = useState(false)
  useEffect(() => {
    const home = ref.current
    const main = home?.closest('main')
    if (!home || !main) return
    const probe = home.querySelector('.home-text-probe')!
    let player: Element | null = null
    const update = () => {
      const bounds = homeVisibleBounds(0, window.innerWidth)
      home.style.setProperty('--home-obstruction', `${bounds.obstruction}px`)
      home.dataset.largeText = probe.getBoundingClientRect().height >= 32 ? 'true' : 'false'
      setObscured(main.dataset.overlayOpen === 'true')
      const next = document.querySelector('[data-testid="player-widget"]')
      if (next !== player) {
        if (player) resize.unobserve(player)
        player = next
        if (player) resize.observe(player)
      }
    }
    const resize = new ResizeObserver(update)
    resize.observe(home)
    resize.observe(probe)
    const observer = new MutationObserver(update)
    observer.observe(main, { attributes: true, attributeFilter: ['data-overlay-open'] })
    // Player mounts as a direct child of Layout; avoid observing the whole document subtree.
    observer.observe(main.parentElement!.parentElement!, { childList: true })
    update()
    const reveal = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      if (!home.contains(target) || target.closest('.home-recording-panel')) return
      const rect = target.getBoundingClientRect()
      const bounds = homeVisibleBounds(rect.left, rect.right)
      const delta = rect.bottom > bounds.bottom ? rect.bottom - bounds.bottom : rect.top < bounds.top ? rect.top - bounds.top : 0
      if (delta) window.scrollBy({ top: delta, behavior: 'instant' })
    }
    home.addEventListener('focusin', reveal)
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)
    return () => {
      resize.disconnect()
      observer.disconnect()
      home.removeEventListener('focusin', reveal)
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [ref])
  return obscured
}
