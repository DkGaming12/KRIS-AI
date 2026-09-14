import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import agentRouterHandler from './api/chat.js'

// Adapter: lengkapi Node res dengan helper ala Vercel (.status/.json/.send)
// supaya handler api/chat.js bisa dipakai langsung sebagai middleware dev.
function toVercelStyleRes(res) {
  res.status = (code) => {
    res.statusCode = code
    return res
  }
  res.json = (data) => {
    if (!res.headersSent) res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
  }
  res.send = (text) => {
    if (!res.headersSent) res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end(text)
  }
  return res
}

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  // Muat .env (termasuk var non-VITE_) agar handler serverless bisa membacanya saat dev
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        // Jalankan api/chat.js sebagai middleware dev — sama seperti di Vercel
        name: 'agentrouter-dev-proxy',
        configureServer(server) {
          server.middlewares.use('/api/chat', (req, res) => {
            for (const [key, value] of Object.entries(env)) {
              if (process.env[key] === undefined) process.env[key] = value
            }
            agentRouterHandler(req, toVercelStyleRes(res))
          })
        },
      },
    ],
  }
})
