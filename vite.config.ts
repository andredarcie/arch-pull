import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  base: '/arch-pull/',
  plugins: [
    react(),
    {
      name: 'api-mock',
      configureServer(server) {
        server.middlewares.use('/api/theme', (_req, res) => {
          const today = new Date().toISOString().slice(0, 10)
          const themesDir = join(process.cwd(), 'content', 'themes')
          let theme = null
          try {
            const files = readdirSync(themesDir)
            const file = files.find((f) => f.startsWith(today))
            if (file) {
              theme = JSON.parse(readFileSync(join(themesDir, file), 'utf-8'))
            }
          } catch {
            // no file for today
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(theme))
        })
      },
    },
  ],
})
