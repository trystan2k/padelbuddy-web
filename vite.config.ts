import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type UserConfig } from 'vite'
import killerInstincts from 'vite-plugin-killer-instincts'
import tsconfigPaths from 'vite-tsconfig-paths'

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
    killerInstincts({ autoKill: true })
  ]
} satisfies UserConfig

export default defineConfig(appViteConfig)
