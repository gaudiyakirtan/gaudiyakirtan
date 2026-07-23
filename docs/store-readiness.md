# Store Readiness

Checklist to ship the three platforms. Code/config items can be done in-repo; **submission itself
needs your accounts + credentials and is an irreversible outward step — that's the one gate an agent
won't cross.**

## Web → Vercel
- [x] Static build passes (`pnpm build`, 715 pages).
- [ ] `vercel.json` / project settings (root = `web/`, build = `pnpm build`, output = `.next`).
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
