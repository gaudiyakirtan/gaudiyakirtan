import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Gaudiya Kirtan' 
}) => {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Head>
        <title>{title}</title>
        <meta name="description" content="A comprehensive repository of devotional songs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white dark:bg-background-offset border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-xl font-bold text-accent">
              Gaudiya Kirtan
            </Link>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link href="/" className="text-primary hover:text-accent">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/authors" className="text-primary hover:text-accent">
                    Authors
                  </Link>
                </li>
                <li>
                  <Link href="/topics" className="text-primary hover:text-accent">
                    Topics
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-background-offset border-t border-border mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-tertiary text-sm">
            &copy; {new Date().getFullYear()} Gaudiya Kirtan. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout