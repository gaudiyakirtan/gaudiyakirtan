# Store Readiness

Checklist to ship the three platforms. Code/config items can be done in-repo; **submission itself
needs your accounts + credentials and is an irreversible outward step — that's the one gate an agent
won't cross.**

## Web → Vercel
- [x] Static build passes (`pnpm build`, 736 pages).
- [x] `web/vercel.json` pins the Next.js framework and `pnpm run build`. Its
      `outputDirectory: null` override deliberately restores the Next.js framework default instead
      of publishing `public/`; `public/` contains Markdown twins and is an input to the Next.js app,
      not the deployment output.
- [ ] Vercel project root directory = `web/`. The repository configuration owns the framework,
      build command, and output directory so dashboard overrides cannot silently turn the project
      into a static `public/` deployment.
- [ ] Env: none required at runtime (fully static + public S3 audio). Confirm S3 CORS allows the
      site origin for `<audio>` range requests (the bucket already serves `206` publicly).
- [ ] 🚀 **Deploy** (`vercel --prod`) — needs your Vercel login. **(outward step — your call)**
- [ ] Custom domain (gaudiyakirtan.com) DNS.

## Android → Play Store
- [x] `assembleDebug` builds; unit tests present.
- [ ] `assembleRelease` + signing config (upload keystore) — **keystore is a secret you provide**.
- [ ] App icons / adaptive icon, splash, `versionCode`/`versionName`.
- [ ] Store listing: title, short/full description, screenshots, feature graphic, privacy policy URL,
      content rating, data-safety form.
- [ ] 🚀 **Play Console** internal-testing → production. **(needs your Play account + signing key)**

## iOS → App Store
- [x] Code typechecks; real build/test runs on CI macOS runners (see `.github/workflows/ci.yml`).
- [ ] Signing & capabilities (team, provisioning) — **your Apple Developer account**.
- [ ] App icon set, launch screen, `Info.plist` (usage strings if any), version/build.
- [ ] App Store Connect listing: name, subtitle, description, keywords, screenshots (per device),
      privacy nutrition labels, support URL.
- [ ] 🚀 **Archive → TestFlight → App Store** via Xcode/altool. **(needs your Apple credentials)**

## Deployment notes (Vercel + Cloudflare)

Hard-won during the `dev.gaudiyakirtan.com` bring-up — the order matters; each gate masked the next:

- **The Next.js version is a security gate.** Vercel **hard-blocks** deploying a Next with a critical
  CVE; `next@15.2.4` (GHSA-9qr9-h5gf-34mp, RCE) was rejected. Pinned to **`15.5.21`** — latest
  maintained 15.x, clears the critical *and* the high DoS advisories, same major, no Next-16 breaks.
- **Framework preset must be Next.js.** If Vercel serves `web/public/` as a plain static dir, `/`
  falls to `public/index.md` and every route 404s. `web/vercel.json` pins `"framework": "nextjs"` +
  `buildCommand` (so the markdown-twin `prebuild` runs) + `outputDirectory: null` — deterministic,
  survives redeploys, beats dashboard state.
- **No symlinks under `web/public/`.** `public/assets` was a git symlink → `../../assets`; Vercel's
  static collector can't reproduce it (`ENOENT mkdir …/static/assets`). The real files are
  **materialized** into `web/public/assets/` (0 symlinks under `web/`).
- **Cloudflare fronts the domain DNS-only (grey cloud):** `CNAME dev → cname.vercel-dns.com`; attach
  *only* `dev.gaudiyakirtan.com` to the project (a domain can't sit on two Vercel projects); purge
  cache after cutover.
- **Canonical is the apex.** `NEXT_PUBLIC_SITE_URL` (default `https://www.gaudiyakirtan.com`) drives
  canonical/OG/sitemap so the dev subdomain isn't indexed ([`screens/seo.md`](screens/seo.md)); don't
  submit the sitemap until the app is on the apex.

## CI, lint & dependencies
- [x] **Lint gate on.** `next.config.js` no longer sets `ignoreDuringBuilds`, and `pnpm lint` runs in
      CI — so a Vercel build now blocks on lint (`react/no-unescaped-entities` disabled as cosmetic;
      real issues fixed).
- [x] **Dependabot** (`.github/dependabot.yml`): **one grouped PR per ecosystem, monthly**
      (npm/gradle/pip/github-actions) so routine bumps don't flood; **security updates enabled**
      separately as the low-volume CVE protection — this is what would surface the next Next.js RCE as
      a bump PR instead of a deploy block.
- [x] **CI consolidated to one workflow.** Five overlapping workflows (CI + All/Web/Android/iOS Build
      Verification) each fired on every push and PR — ~5× the runs, and 73 of the last 100 failed
      because the native jobs ran on web/docs-only commits. Now a single `ci.yml` that **skips
      Dependabot PRs** (`github.actor != 'dependabot[bot]'`), **path-gates** the iOS/Android jobs to
      `ios/**` / `andorid/**`, and cancels superseded runs (`concurrency`).

## Cross-cutting
- [ ] App icons + splash from the brand assets (`assets/`, `icons/`) — generate per-platform sizes.
- [ ] Privacy policy (no accounts, no tracking; audio streamed from public S3) — a short page.
- [ ] Legal: the songbook content is CC-BY-ND 4.0 (Gaudiya Vedanta Publications) — keep attribution;
      confirm redistribution terms for bundling the corpus + streaming audio.
- [ ] Bump the shared `versionName`/marketing version consistently across platforms.

## Known follow-ups (non-blocking, from the build)
- Package-manager consistency: done (CLAUDE.md now says pnpm/Gradle/Xcode, not bun).
- Dead code flagged during the browse pass: iOS `SettingsView.swift` (legacy), `appPrimary` colorset
  dup, android stray `.MainActivity` dotfile, web unused `Tag`/dormant Topic/Book cards, the
  `notes` decode dropping `language_code`. Cleanup candidates.
- Nav active-state: Figma shows a subtle pill; spec says accent — needs a visual decision.
- Song-groups coverage is ~70% of the abridged-edition songs (185 matched); the rest are ungrouped
  (fine). Could raise coverage using audio `src` section paths later.
