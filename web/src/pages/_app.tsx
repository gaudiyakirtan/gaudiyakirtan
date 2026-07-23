import React from 'react'
import { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Layout from '../components/Layout'
import { ThemeProvider } from '../utils/ThemeContext'
import { SettingsProvider } from '../utils/SettingsContext'
import { PlayerProvider } from '../utils/PlayerContext'
import { ReaderOptionsProvider } from '../utils/ReaderOptionsContext'
import { initObservability, Sentry } from '../utils/observability'
import '../styles/globals.css'

// Start client error monitoring as early as possible (self-guards: no-op on the server and until a
// NEXT_PUBLIC_SENTRY_DSN is configured), so it is listening before the app mounts.
initObservability()

// Minimal, on-theme fallback for a render-time crash — an ErrorBoundary is the only way React
// surfaces those (window.onerror does not catch them), and Sentry reports them from here.
function CrashFallback() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-bold text-[var(--primary)]">Something went wrong</h1>
      <p className="max-w-sm text-sm text-[var(--neutral)]">
        The page hit an unexpected error. Reloading usually fixes it.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-lg bg-[var(--highlight)] px-4 py-2 text-[var(--on-highlight)]"
      >
        Reload
      </button>
    </div>
  )
}

function MyApp({ Component, pageProps, router }: AppProps) {
  // Get page title based on route
  const getPageTitle = () => {
    if (router.pathname === '/') return 'Gaudiya Kirtan - Home'
    if (router.pathname === '/songs') return 'Gaudiya Kirtan - Songs Library'
    if (router.pathname.startsWith('/songs/')) return 'Gaudiya Kirtan - Song Details'
    if (router.pathname === '/authors') return 'Gaudiya Kirtan - Authors'
    if (router.pathname === '/topics') return 'Gaudiya Kirtan - Topics'
    if (router.pathname === '/books') return 'Gaudiya Kirtan - Books'
    if (router.pathname === '/settings') return 'Gaudiya Kirtan - Settings'
    if (router.pathname === '/about') return 'Gaudiya Kirtan - About'
    if (router.pathname === '/contact') return 'Gaudiya Kirtan - Contact'
    return 'Gaudiya Kirtan'
  }

  // Get subtitle for breadcrumb from page props
  // This will be set by individual pages as needed
  const getSubtitle = () => {
    // If the page has set a subtitle in pageProps, use it
    if (pageProps.subtitle) {
      return pageProps.subtitle
    }
    return undefined
  }

  return (
    <Sentry.ErrorBoundary fallback={<CrashFallback />}>
      <ThemeProvider>
        <SettingsProvider>
          {/* Mounted once at the app root so playback survives client-side navigation between
              pages - the "global playback service" required by docs/screens/player.md. */}
          <PlayerProvider>
            {/* Above Layout so the mobile top bar can render the song's Display control, which the
                song screen (a descendant of Layout) publishes on mount. */}
            <ReaderOptionsProvider>
              <Layout title={getPageTitle()} subtitle={getSubtitle()}>
                <Component {...pageProps} />
              </Layout>
            </ReaderOptionsProvider>
          </PlayerProvider>
        </SettingsProvider>
      </ThemeProvider>
      {/* Vercel first-party, privacy-friendly, cookieless — no consent banner needed. Both no-op
          unless enabled for the project in the Vercel dashboard. */}
      <Analytics />
      <SpeedInsights />
    </Sentry.ErrorBoundary>
  )
}

export default MyApp