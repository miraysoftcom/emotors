import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

let handlers: any = null

function getHandlers() {
  if (!handlers) {
    handlers = toNextJsHandler(auth.handler)
  }
  return handlers
}

export async function GET(request: Request, context: any) {
  const { GET } = getHandlers()
  return GET(request, context)
}

export async function POST(request: Request, context: any) {
  const { POST } = getHandlers()
  return POST(request, context)
}
