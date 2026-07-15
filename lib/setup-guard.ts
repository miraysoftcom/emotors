import { NextResponse } from 'next/server'

export function assertSetupAllowed(request: Request) {
  const setupSecret = process.env.SETUP_SECRET
  if (!setupSecret) {
    return NextResponse.json({ error: 'Setup endpoint is disabled. Configure SETUP_SECRET to enable it temporarily.' }, { status: 403 })
  }

  const url = new URL(request.url)
  const provided = request.headers.get('x-setup-secret') || url.searchParams.get('secret') || ''
  if (provided !== setupSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}
