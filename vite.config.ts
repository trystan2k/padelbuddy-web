import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type UserConfig } from 'vite'
import killerInstincts from 'vite-plugin-killer-instincts'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

interface ManifestEntry {
  file?: string
  css?: string[]
  assets?: string[]
}

function generatePrecacheManifest() {
  return {
    name: 'vite-plugin-generate-precache-manifest',
    closeBundle() {
      const manifestPath = join(__dirname, 'dist/client/.vite/manifest.json')
      const outputPath = join(__dirname, 'dist/client/precache-manifest.json')

      if (existsSync(manifestPath)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const manifestRaw: Record<string, ManifestEntry> = JSON.parse(
          readFileSync(manifestPath, 'utf-8')
        )
        const assets: string[] = []

        for (const entry of Object.values(manifestRaw)) {
          if (entry.file) {
            const file = entry.file.startsWith('/') ? entry.file : `/${entry.file}`
            assets.push(file)
          }
          if (entry.css) {
            for (const css of entry.css) {
              const file = css.startsWith('/') ? css : `/${css}`
              assets.push(file)
            }
          }
          if (entry.assets) {
            for (const asset of entry.assets) {
              const file = asset.startsWith('/') ? asset : `/${asset}`
              assets.push(file)
            }
          }
        }

        const uniqueAssets = [...new Set(assets)]

        writeFileSync(outputPath, JSON.stringify({ assets: uniqueAssets }, null, 2))
        // oxlint-disable-next-line no-console
        console.log(`[precache-manifest] Generated with ${uniqueAssets.length} assets`)
      }
    }
  }
}

export const appViteConfig = {
  server: {
    port: 4000,
    strictPort: true
  },
  resolve: {
    tsconfigPaths: true
  },
  plugins: [
    ...tanstackStart({
      router: {
        routesDirectory: './routes',
        generatedRouteTree: './routeTree.gen.ts',
        enableRouteGeneration: true,
        quoteStyle: 'single',
        semicolons: false,
        addExtensions: false
      },
      spa: {
        enabled: true,
        prerender: {
          outputPath: '/index'
        }
      }
    }),
    react(),
    killerInstincts({ autoKill: true }),
    generatePrecacheManifest()
  ],
  build: {
    manifest: true
  }
} satisfies UserConfig

export default defineConfig(appViteConfig)
