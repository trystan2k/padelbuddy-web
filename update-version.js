import fs from 'node:fs'
import path from 'node:path'

const manifestPath = path.resolve(process.cwd(), 'release-please-manifest.json')
const swPath = path.resolve(process.cwd(), 'public/sw.js')
const srcVersionPath = path.resolve(process.cwd(), 'src/version.ts')

try {
  // Read the version from the manifest
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const version = manifest['.']

  if (!version) {
    console.error('Could not find version "." in release-please-manifest.json')
    process.exit(1)
  }

  // Read the service worker file
  let swContent = fs.readFileSync(swPath, 'utf8')

  // Replace the version string
  swContent = swContent.replace(/const SW_VERSION = '.*'/, `const SW_VERSION = '${version}'`)

  // Write back to the service worker file
  fs.writeFileSync(swPath, swContent)

  // Write the version to src/version.ts
  fs.writeFileSync(
    srcVersionPath,
    `// This file is auto-generated during the build process.\nexport const APP_VERSION = '${version}'\n`
  )

  // oxlint-disable-next-line no-console
  console.log(`[Version Build] Successfully updated Service Worker and App version to: ${version}`)
} catch (error) {
  console.error('[Version Build] Failed to update versions:', error)
  process.exit(1)
}
