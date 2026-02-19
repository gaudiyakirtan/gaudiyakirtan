# Todo List

## Verify Builds & Rendering

- [x] **Verify web build compiles and renders** — Run `bun run dev` in `web/` and confirm the app loads without errors
- [x] **Verify iOS build compiles and renders** — Open `ios/gk-ios.xcodeproj` in Xcode, build and run on simulator
- [x] **Verify Android build compiles and renders** — Run `./gradlew assembleDebug` in `andorid/` and launch on emulator

## Emulator Integration

- [ ] **Set up iOS simulator screenshots** — Find a way for Claude Code to interact with the iOS simulator and capture screenshots (e.g. `xcrun simctl`)
- [ ] **Set up Android emulator screenshots** — Find a way for Claude Code to interact with the Android emulator and capture screenshots (e.g. `adb shell screencap`)
- [ ] **Document emulator workflow** — Add emulator interaction commands to CLAUDE.md for future reference

## Screenshot Tests

- [ ] **Add iOS UI/snapshot tests** — Create XCUITest or snapshot tests that capture screenshots via `XCUIScreen.main.screenshot()` so Claude Code can verify UI rendering from test output
- [ ] **Add Android screenshot tests** — Create Compose UI tests or Espresso tests that capture screenshots so Claude Code can verify UI rendering from test output
- [ ] **Add web screenshot/visual tests** — Set up Playwright or similar for capturing web app screenshots from the CLI for visual verification

## Dependency Migration

- [ ] **Update web dependencies** — Migrate Next.js 15 to 16, update React, TailwindCSS, TypeScript, and ESLint to latest versions
- [ ] **Update Android dependencies** — Migrate Compose BOM (2024.04.01 to 2026.02.00), Kotlin (2.0 to 2.3), AGP (8.8 to 9.0), OkHttp (4.x to 5.x)
- [ ] **Update iOS Swift version** — Evaluate migrating from Swift 5.0 to 6.x, address strict concurrency changes
- [ ] **Verify all platforms after migration** — Re-run builds and rendering checks on all three platforms to confirm nothing broke

## Review Previous Plans

- [ ] **Review previous timeline and tasks** — Check the following docs to review what the previous timeline, ideas, and tasks were:
  - https://docs.google.com/document/d/1XTlrwRuGfu9KgiVx8LY6rJ4OUkzZrThElpuu9iDYoJ4/edit?tab=t.0
  - https://docs.google.com/document/d/1bI90KOI-AGhGIHyC8sAaBJSTSkGx2CFCo13WsSAEJpA/edit?tab=t.0

## Song View Enhancements

- [x] **Web song view action icons** — Add the same action bar icons to the web song screen (`SongScreen.tsx`) matching iOS/Android:
  - [x] Queue/List icon — show tracks in a dropdown/modal
  - [x] Aa Font Size — dropdown with font size slider + layer visibility toggles (Original Script, Transliteration, Synonyms, Translation)
  - [x] Bookmark — toggle filled/outline bookmark icon, persist in state
  - [x] Share — copy deep link `https://gaudiyakirtan.com/songs/{uid}` to clipboard or open browser share API
- [ ] **Single verse mode** — Add horizontal swipe mode where user sees one verse at a time (swipe left/right between verses) instead of vertical scroll. Toggle via a view mode button on all platforms.

## Backend System

- [x] **Set up MongoDB Atlas** — Create free-tier cluster, add `MONGODB_URI` to `.env.local`
- [x] **Create GraphQL API** — Next.js API route at `/api/graphql` with Apollo Server, resolvers for songs, authors, books, topics, singers, tracks
- [x] **Import song data** — Create import script to seed MongoDB from existing JSON data
- [x] **Update web to use API** — Replace `sampleData` imports with GraphQL queries in `getStaticProps` across all pages
- [ ] **iOS offline database (SwiftData)** — Pre-populated SQLite bundled with app, background sync via Apollo iOS. Bump deployment target to iOS 17.0
- [ ] **Android offline database (Room)** — Pre-populated Room DB bundled in assets, background sync via Apollo Kotlin + WorkManager
- [ ] **Asset bundling** — Bundle author/book/singer images in app assets for offline access
- [ ] **Build-time data generation** — Script to export MongoDB to pre-populated SQLite/Room DBs for mobile releases

Full plan: `.claude/plans/noble-seeking-cerf.md`

## App Publishing & Deep Links

- [ ] **Set up Apple Developer account** — Get Apple Team ID and configure app bundle ID for Universal Links
- [ ] **Fill in apple-app-site-association** — Replace `TEAM_ID` placeholder in `web/public/.well-known/apple-app-site-association` with real Apple Team ID and bundle ID
- [ ] **Generate Android signing key** — Create a release keystore and extract SHA-256 fingerprint via `keytool -list -v -keystore your.keystore`
- [ ] **Fill in assetlinks.json** — Replace `TODO:ADD_YOUR_SHA256_FINGERPRINT` placeholder in `web/public/.well-known/assetlinks.json` with real fingerprint
- [ ] **Deploy web with .well-known files** — Ensure `gaudiyakirtan.com` serves the verification files over HTTPS with no redirects
- [ ] **Test Universal Links end-to-end** — Verify tapping `https://gaudiyakirtan.com/songs/N3` opens the app on both iOS and Android
