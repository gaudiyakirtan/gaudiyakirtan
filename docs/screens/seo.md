# Screen — SEO & metadata

**Spec version:** 1

**Figma frames:** none — metadata, built behaviorally.

## Purpose

Make every page discoverable and shareable — correct per-page title/description, canonical URL,
social cards, structured data, sitemap and robots — all pointing at the **production apex**, not
whatever host a build happens to be deployed to.

## `<Seo>` component (`components/Seo.tsx`)

Rendered per page with `title`, `description`, site-relative `path`, `type` (`website` | `article`),
optional `image` + `jsonLd`, and `noindex`. Emits `<title>`, description, canonical, Open Graph,
Twitter Card, and any JSON-LD blocks.

- **Keyed tags.** Every tag carries a stable `key`, so a page's `<Seo>` **de-dupes against** the
  site-wide defaults in `Layout`'s `<Head>` (exactly one title / description / canonical / og per
  page). Site-wide constants (`og:site_name`, `twitter:card`, `theme-color`) live in `Layout`; only
  page-specific values live in `<Seo>`.
- **Canonical targets production.** `canonical(path)` resolves against `config.SITE_URL`
  (`NEXT_PUBLIC_SITE_URL`, default `https://www.gaudiyakirtan.com`), **not** the current host — so a
  dev/preview deploy declares production as canonical and isn't indexed as a duplicate.
- **JSON-LD** is serialized with `<` escaped to `<` (the only injection vector in ld+json).
- Song descriptions come from the song's **actual English translation**, not boilerplate.

> There is exactly **one** component, `components/Seo.tsx`, imported by all 10 SEO-bearing pages.
> (An earlier note here claimed a dead uppercase `SEO.tsx` duplicate; that was a false positive —
> macOS/APFS is case-insensitive, so probing `SEO.tsx` resolves to the same file. `git ls-files`
> tracks only `Seo.tsx`.)

## Structured data (JSON-LD)

- **Home:** `WebSite` + `SearchAction`, and `Organization`.
- **Song:** `MusicComposition` → `MusicRecording` → `AudioObject`, plus `BreadcrumbList`.
- **Book / Topic:** `CollectionPage` + breadcrumb.

## Sitemap & robots (`scripts/gen-markdown.mjs`, build-time)

- `public/sitemap.xml` — one `<url>` per page (home, listings, every song/book/topic), `changefreq`
  monthly. Locations use `SITE_URL` (the production apex), so even a preview build's sitemap points at
  production.
- `public/robots.txt` and a branded `og-image.png` (1200×630) are emitted alongside.

## States / caveats

- **`/contact` and utility pages are `noindex`.**
- **Don't submit the sitemap to Search Console until the app is actually on the apex** — it currently
  serves the coming-soon holding page; submitting early indexes the wrong site.

## Per-platform notes

- **Web only** — SEO/social metadata is meaningless for the native apps.

## Verification

- Exactly one `<title>` / description / canonical per page (keyed de-dup holds).
- Canonical / OG / sitemap URLs are the production apex regardless of deploy host.
- A rich-results validator accepts the song / collection JSON-LD; `sitemap.xml` + `robots.txt` build.

## Change log

- **v1** — Initial spec: keyed `<Seo>` (canonical→apex), the JSON-LD graph
  (WebSite/Organization/MusicComposition/CollectionPage), build-time `sitemap.xml` + `robots.txt` +
  og-image, `/contact` noindex, and the "don't submit the sitemap until on the apex" caveat.
