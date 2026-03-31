import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type UserConfig } from 'vite'
import killerInstincts from 'vite-plugin-killer-instincts'
import tsconfigPaths from 'vite-tsconfig-paths'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

function generatePrecacheManifest() {
  return {
    name: 'vite-plugin-generate-precache-manifest',
    closeBundle() {
      const manifestPath = join(__dirname, 'dist/client/.vite/manifest.json')
      const outputPath = join(__dirname, 'dist/client/precache-manifest.json')

      if (existsSync(manifestPath)) {
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
        const assets = Object.values(manifest)
          .flatMap((entry: any) => {
            if (Array.isArray(entry)) {
              return entry.map((e: any) => e.file)
            }
            return entry.file ? [entry.file] : []
          })
          .filter(Boolean)
          .map((file) => {
            if (file.startsWith('/')) return file
            return `/${file}`
          })

        writeFileSync(outputPath, JSON.stringify({ assets }, null, 2))
        console.log(`[precache-manifest] Generated with ${assets.length} assets`)
      }
    }
  }
}

export const appViteConfig = {
  server: {
    port: 4000,
    strictPort: true
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
    tsconfigPaths(),
    killerInstincts({ autoKill: true }),
    generatePrecacheManifest()
  ],
  build: {
    manifest: true
  }
} satisfies UserConfig

export default defineConfig(appViteConfig)
