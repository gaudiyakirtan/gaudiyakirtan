import { useCallback, useEffect, useRef, useState } from 'react'
import type { NextRouter } from 'next/router'
import {
  createMobileHeaderScrollState,
  updateMobileHeaderScrollState,
} from './mobileHeaderScroll'

const MOBILE_HEADER_QUERY = '(max-width: 767px)'

export function useMobileHeaderVisibility(router: NextRouter) {
  const stateRef = useRef(createMobileHeaderScrollState())
  const [hidden, setHidden] = useState(false)

  const reveal = useCallback(() => {
    const currentY = typeof window === 'undefined' ? 0 : window.scrollY
    stateRef.current = createMobileHeaderScrollState(currentY)
    setHidden(false)
  }, [])

  useEffect(() => {
    const media = window.matchMedia(MOBILE_HEADER_QUERY)

    const onScroll = () => {
      const next = updateMobileHeaderScrollState(stateRef.current, window.scrollY)
      stateRef.current = next
      setHidden((current) => current === next.hidden ? current : next.hidden)
    }

    const syncBreakpoint = () => {
      window.removeEventListener('scroll', onScroll)
      reveal()
      if (media.matches) window.addEventListener('scroll', onScroll, { passive: true })
    }

    syncBreakpoint()
    media.addEventListener('change', syncBreakpoint)
    router.events.on('routeChangeComplete', reveal)

    return () => {
      window.removeEventListener('scroll', onScroll)
      media.removeEventListener('change', syncBreakpoint)
      router.events.off('routeChangeComplete', reveal)
    }
  }, [reveal, router.events])

  return { hidden, reveal }
}
