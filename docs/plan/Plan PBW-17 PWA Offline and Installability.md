## Task Analysis

- **Main objective**: Implement PWA offline and installability for Padel Buddy Web, including a Web App Manifest, vanilla service worker with app-shell precaching, and CSP/security headers for Cloudflare Pages deployment.
- **Identified dependencies**:
  - IndexedDB persistence is already implemented via PBW-12 (`src/lib/current-match/indexed-db.ts`)
  - i18next HTTP backend configured to load from `/locales/{{lng}}.json` (`src/lib/i18n/i18n.ts`)
  - 3 supported locales: en, es, pt
  - TanStack Start SPA mode with prerender enabled (vite.config.ts)
  - Cloudflare Pages deployment via Wrangler action in deploy-production.yml
- **System impact**:
  - New files in `public/` (manifest.json, sw.js)
  - New files in `src/lib/pwa/` (registration.ts)
  - New component in `src/components/DebugPwa/` (developer-only debug panel)
  - Modifications to `src/routes/__root.tsx` (manifest link, PWA meta tags)
  - Modifications to `.github/workflows/deploy-production.yml` (security headers)

## Chosen Approach

- **Proposed solution**: Implement a complete PWA stack using vanilla service worker (no Workbox) with the following characteristics:
  1. **Web App Manifest**: Full manifest with app icons, theme colors, display mode, and start URL
  2. **Service Worker**: Vanilla JS SW with precache strategy for all static assets including all 3 locales
  3. **Silent Updates**: New SW installs in background, activates on next page load via `skipWaiting()` + `clients.claim()`
  4. **Cache Versioning**: SW version number in cache name, old caches cleared on activate
  5. **Debug Panel**: Optional developer-only panel (not user-facing) to inspect SW status and cache state
  6. **Security Headers**: CSP and security headers configured in Cloudflare Pages deployment

- **Justification for simplicity**:
  - Vanilla SW is preferred over Workbox for full control and minimal bundle overhead
  - Precaching entire app on first load is the simplest offline strategy for a client-only SPA
  - Silent updates (no user notification) align with the PRD requirement
  - All locales cached offline ensures language switching works without connection
  - Debug panel is dev-only and won't bloat production bundles

- **Rejected alternatives**:
  - Workbox: Overengineered for this use case, adds dependency complexity
  - Runtime caching per navigation: Unnecessary since entire app is precached
  - Lazy caching: Not appropriate for offline-first requirement
  - User-facing update notifications: Explicitly out of scope per PRD

## Implementation Steps

### Step 1: Create Web App Manifest (`public/manifest.json`)

Create a complete manifest following PWA best practices:

- `name`: "Padel Buddy"
- `short_name`: "Padel Buddy"
- `description`: Match tracking app for padel matches
- `start_url`: "/"
- `scope`: "/"
- `display`: "standalone"
- `orientation`: "portrait"
- `theme_color`: Use project brand color (from design tokens)
- `background_color`: "#FFFFFF"
- `icons`: Provide dedicated PWA icons in `public/` matching the manifest implementation, e.g. 192x192 and 512x512 PNGs (including maskable variants) such as `icon-192x192.png`, `icon-192x192-maskable.png`, `icon-512x512.png`, and `icon-512x512-maskable.png`.
- `categories`: ["sports", "games"]
- `lang`: "en"
- `dir`: "ltr"
- `id`: "padel-buddy-web"

**Pre-implementation checkpoint**: Verify icon.png exists at public/icon.png with proper dimensions

### Step 2: Create Service Worker (`public/sw.js`)

Implement vanilla service worker with precaching:

```javascript
// SW version for cache busting
const SW_VERSION = '1.0.0'
const CACHE_NAME = `padel-buddy-${SW_VERSION}`

// Assets to precache (will be populated at build time or manually listed)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/locales/en.json',
  '/locales/es.json',
  '/locales/pt.json'
  // JS/CSS bundles added at build time
]
```

Key behaviors:

- **Install**: Precache all static assets listed above
- **Activate**: Clear old caches matching pattern `padel-buddy-*`
- **Fetch**: Network-first for navigation (HTML), cache-first for static assets (JS/CSS, images, locales)
- **Skip waiting**: New SW activates immediately in background
- **Clients claim**: New SW takes control of all clients immediately

**Pre-implementation checkpoint**: Confirm Cloudflare Pages serves files from `dist/client` directory

### Step 3: Create SW Registration Module (`src/lib/pwa/registration.ts`)

Create TypeScript module for SW registration with error handling:

- Check for SW support (`'serviceWorker' in navigator`)
- Register `sw.js` from root (`/sw.js`)
- Handle registration errors gracefully (don't break app if SW fails)
- Export `unregisterSW()` for cleanup/testing
- Track registration state for debugging

```typescript
export interface SWRegistrationState {
  supported: boolean
  registered: boolean
  ready: boolean
  error?: Error
}
```

### Step 4: Create DebugPWA Component (`src/components/DebugPwa/`)

Create developer-only debug panel (NOT user-facing):

- Only rendered when `import.meta.env.DEV` is true
- Shows SW registration status
- Shows current cache name and version
- Shows number of cached entries
- Provides manual "Update SW" button to force update
- Provides "Clear Cache" button for testing
- Styled consistently with existing component patterns

Files to create:

- `src/components/DebugPwa/DebugPwa.tsx`
- `src/components/DebugPwa/DebugPwa.module.css`
- `src/components/DebugPwa/index.ts`

### Step 5: Modify `src/routes/__root.tsx`

Add PWA-related elements:

- Add `<link rel="manifest" href="/manifest.json" />` via HeadContent
- Add theme-color meta tag
- Add apple-touch-icon meta tags (for iOS)
- Add apple-mobile-web-app-capable meta tag
- Add SW registration call in useEffect (client-side only)
- Conditionally render `<DebugPwa />` in development only

**Pre-implementation checkpoint**: Ensure HeadContent properly handles link tags

### Step 6: Configure Security Headers in Cloudflare Pages Deployment

Create `public/_headers` file to configure CSP and security headers for Cloudflare Pages:

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/index.html
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; worker-src 'self';

/locales/*
  Cache-Control: public, max-age=86400

/static/*
  Cache-Control: public, max-age=31536000, immutable
```

**Note**: The `_headers` file is served from the `public/` directory and automatically picked up by Cloudflare Pages during deployment. No workflow modification required.| # Create \_headers file for Cloudflare Pages
echo '/static/\*' > dist/client/\_headers
echo ' Cache-Control: public, max-age=31536000, immutable' >> dist/client/\_headers
echo ' X-Content-Type-Options: nosniff' >> dist/client/\_headers
echo ' X-Frame-Options: DENY' >> dist/client/\_headers
echo ' X-XSS-Protection: 1; mode=block' >> dist/client/\_headers
echo ' Referrer-Policy: strict-origin-when-cross-origin' >> dist/client/\_headers

```

Add CSP header in a subsequent deploy or via Cloudflare Pages dashboard:

```

Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; worker-src 'self';

```

**Pre-implementation checkpoint**: Verify Cloudflare Pages project settings allow header configuration

### Step 7: Update Vite Config for SW Build Integration (Optional)

If build-time asset list injection is needed, configure vite-plugin-pwa or manual asset extraction:

- Extract list of built JS/CSS files
- Write to a `sw-assets.json` consumed by sw.js
- Alternatively, hardcode asset list if build is stable

**Note**: This step is optional if assets are manually listed or fetched dynamically

### Step 8: Add Browser Tests for SW Behavior

Add Playwright tests in `test/` directory:

- Test SW registration on app load
- Test offline functionality (navigate with network disabled)
- Test cache contains expected entries
- Test SW update flow (version bump triggers update)

Add vitest browser tests for:

- SW registration error handling
- Cache state inspection

## File Structure

```

public/
├── manifest.json # Web App Manifest (NEW)
├── sw.js # Vanilla Service Worker (NEW)
└── icon.png # Existing app icon

src/
├── lib/
│ └── pwa/
│ ├── index.ts # Barrel export (NEW)
│ └── registration.ts # SW registration logic (NEW)
├── components/
│ └── DebugPwa/ # Dev-only debug panel (NEW)
│ ├── DebugPwa.tsx
│ ├── DebugPwa.module.css
│ └── index.ts
└── routes/
└── \_\_root.tsx # Add manifest link, meta tags (MODIFIED)

.github/workflows/
└── deploy-production.yml # Add security headers (MODIFIED)

````

## Edge Cases and Error Handling

| Scenario                            | Handling                                                     |
| ----------------------------------- | ------------------------------------------------------------ |
| SW registration fails               | Log error, app continues to work without PWA features        |
| Cache add fails during install      | SW install fails, browser retries on next visit              |
| Old cache cleanup fails             | Log warning, continue with new cache active                  |
| Network request fails               | Return cached response (cache-first strategy)                |
| SW not supported (private browsing) | App works normally, PWA features gracefully unavailable      |
| iOS Safari PWA limitations          | Manifest icons and meta tags handle iOS home screen addition |
| Cloudflare Pages header limit       | Move CSP to dashboard if `_headers` file is insufficient     |
| SW update during active use         | Silent update, activates on next page load                   |

## Testing Strategy

### Manual Testing

1. **Installability**: Add to home screen on iOS Safari and Android Chrome, verify icon and splash screen
2. **Offline**: Enable airplane mode, navigate entire app flow
3. **Locale switching**: Switch between en/es/pt while offline
4. **Update flow**: Bump SW_VERSION, refresh, verify silent update on next launch

### Automated Testing

1. **Browser tests** (Playwright):
   - `test/pwa/offline.test.ts` - Offline navigation works
   - `test/pwa/install.test.ts` - PWA installability metadata present

2. **Unit tests** (vitest):
   - `test/lib/pwa/registration.test.ts` - Registration logic
   - `test/lib/pwa/cache.test.ts` - Cache operations

### Validation Commands

```bash
# Run all tests
pnpm test

# Run complete quality gate
pnpm complete-check

# Manual offline test
# 1. Build: pnpm build
# 2. Serve dist/client
# 3. Enable airplane mode in DevTools
# 4. Navigate all routes
````

## CSP Security Headers

For Cloudflare Pages static hosting, configure these headers:

```
# _headers file content
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/index.html
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; worker-src 'self';

/locales/*
  Cache-Control: public, max-age=86400

/static/*
  Cache-Control: public, max-age=31536000, immutable
```

## Acceptance Criteria Verification

| #   | Criterion                                              | Verification Method                                               |
| --- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| 1   | Valid web app manifest and installable PWA             | Chrome DevTools > Application > Manifest, Add to Home Screen test |
| 2   | Cached app shell supports full match lifecycle offline | Airplane mode + complete match flow test                          |
| 3   | IndexedDB-backed match state works offline             | Match created online, resumed offline                             |
| 4   | ALL locales cached offline                             | Switch locale in airplane mode, verify translations load          |
| 5   | SW updates apply silently on next launch               | Console log SW version before/after update                        |
| 6   | Security headers/CSP configured                        | Check response headers on deployed site                           |

## Rollback/Mitigation Notes

- **If Cloudflare Pages headers don't apply**: Configure headers in Cloudflare Pages dashboard directly
- **If SW causes issues**: Add feature flag to disable SW registration via environment variable
- **If cache strategy needs adjustment**: sw.js uses cache-first for all requests, can be changed to network-first for HTML
