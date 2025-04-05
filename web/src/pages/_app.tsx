import React from 'react'
import { AppProps } from 'next/app'
import Layout from '../components/Layout'
import '../styles/globals.css'

function MyApp({ Component, pageProps, router }: AppProps) {
  // Get page title based on route
  const getPageTitle = () => {
    if (router.pathname === '/') return 'Gaudiya Kirtan - Home'
    if (router.pathname.startsWith('/songs/')) return 'Gaudiya Kirtan - Song Details'
    return 'Gaudiya Kirtan'
  }

  return (
    <Layout title={getPageTitle()}>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp