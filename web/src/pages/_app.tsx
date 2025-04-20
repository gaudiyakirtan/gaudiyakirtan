import React from 'react'
import { AppProps } from 'next/app'
import Layout from '../components/Layout'
import '../styles/globals.css'

function MyApp({ Component, pageProps, router }: AppProps) {
  // Get page title based on route
  const getPageTitle = () => {
    if (router.pathname === '/') return 'Gaudiya Kirtan - Home'
    if (router.pathname === '/songs') return 'Gaudiya Kirtan - Songs Library'
    if (router.pathname.startsWith('/songs/')) return 'Gaudiya Kirtan - Song Details'
    if (router.pathname === '/authors') return 'Gaudiya Kirtan - Authors'
    if (router.pathname === '/topics') return 'Gaudiya Kirtan - Topics'
    if (router.pathname === '/books') return 'Gaudiya Kirtan - Books'
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
    <Layout title={getPageTitle()} subtitle={getSubtitle()}>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp