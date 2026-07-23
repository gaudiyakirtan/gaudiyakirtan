import React from 'react'
import Head from 'next/head'
import { canonical, DEFAULT_OG_IMAGE, SITE_NAME } from '../config'

/**
 * Per-page SEO: title, description, canonical URL, Open Graph, Twitter Card, and optional JSON-LD.
 *
 * Every tag carries a stable `key` so Next.js de-dupes against the site-wide defaults in Layout's
 * <Head> — a page rendering <Seo> overrides those defaults rather than emitting a second title/og.
 * That is also why the site-wide constants (og:site_name, twitter:card, theme-color) live in Layout
 * and only the page-specific values live here.
 *
 * `path` is site-relative (e.g. `/songs/N9`); canonical/og:url are resolved against the production
 * origin (config.SITE_URL), NOT the current host, so a dev/preview deploy points search engines at
 * production instead of getting indexed as a duplicate.
 */
interface ISeoProps {
  title: string
  description: string
  /** Site-relative path of this page, for canonical + og:url. */
  path: string
  /** og:type — 'website' for listings/home, 'article' for a song/book/topic. */
  type?: 'website' | 'article'
  /** Absolute image URL; defaults to the brand social image. */
  image?: string
  /** One or more JSON-LD objects rendered as ld+json. */
  jsonLd?: object | object[]
  /** Discourage indexing (e.g. utility pages like Settings). */
  noindex?: boolean
}

export const Seo: React.FC<ISeoProps> = ({
  title,
  description,
  path,
  type = 'website',
  image = DEFAULT_OG_IMAGE,
  jsonLd,
  noindex = false,
}) => {
  const url = canonical(path)
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Head>
      <title key="title">{title}</title>
      <meta key="description" name="description" content={description} />
      <link key="canonical" rel="canonical" href={url} />
      {noindex && <meta key="robots" name="robots" content="noindex, follow" />}

      {/* Open Graph */}
      <meta key="og:title" property="og:title" content={title} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:type" property="og:type" content={type} />
      <meta key="og:url" property="og:url" content={url} />
      <meta key="og:image" property="og:image" content={image} />
      <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
      <meta key="og:locale" property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      <meta key="twitter:image" name="twitter:image" content={image} />

      {blocks.map((block, i) => (
        <script
          key={`ld-${i}`}
          type="application/ld+json"
          // JSON.stringify escapes the content; the only injection vector in ld+json is a literal
          // "</script>" inside a string value, which stringify's escaping of "<" (< via replace
          // below) neutralizes.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block).replace(/</g, '\\u003c') }}
        />
      ))}
    </Head>
  )
}

export default Seo
