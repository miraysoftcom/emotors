import { NextRequest } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { getAdminNotifications } from '@/lib/admin-notifications'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function isAdmin(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  return Boolean(token && getSession(token))
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const encoder = new TextEncoder()
  let closed = false

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        if (closed) return
        const payload = JSON.stringify(getAdminNotifications())
        controller.enqueue(encoder.encode(`event: notifications\ndata: ${payload}\n\n`))
      }

      send()
      const interval = setInterval(send, 3500)

      request.signal.addEventListener('abort', () => {
        closed = true
        clearInterval(interval)
        controller.close()
      })
    },
    cancel() {
      closed = true
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

