import { createAPIFileRoute } from '@tanstack/start/api'
import fs from 'fs'
import path from 'path'

export const APIRoute = createAPIFileRoute('/widget.js')({
  GET: async () => {
    try {
      const filePath = path.join(process.cwd(), 'public', 'widget.js')
      const content = fs.readFileSync(filePath, 'utf-8')
      return new Response(content, {
        headers: {
          'Content-Type': 'application/javascript',
          'Access-Control-Allow-Origin': '*',
        },
      })
    } catch (e) {
      return new Response('console.error("widget.js not found")', { status: 404 })
    }
  },
})
