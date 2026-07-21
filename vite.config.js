import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const saveApiPlugin = () => ({
  name: 'save-api-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/save-data' && req.method === 'POST') {
        let body = ''
        req.on('data', chunk => {
          body += chunk.toString()
        })
        req.on('end', () => {
          try {
            const data = JSON.parse(body)
            if (data.products) {
              fs.writeFileSync(
                path.resolve(__dirname, 'public/products.json'),
                JSON.stringify(data.products, null, 2),
                'utf-8'
              )
            }
            if (data.config) {
              fs.writeFileSync(
                path.resolve(__dirname, 'public/config.json'),
                JSON.stringify(data.config, null, 2),
                'utf-8'
              )
            }
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ status: 'success' }))
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ status: 'error', message: err.message }))
          }
        })
      } else {
        next()
      }
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), saveApiPlugin()],
  base: './',
})
