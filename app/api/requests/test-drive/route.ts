import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, date, message, productName, productId } = body

    // Validate required fields
    if (!name || !email || !phone || !date) {
      return NextResponse.json(
        { error: 'Alle erforderlichen Felder müssen ausgefüllt werden' },
        { status: 400 }
      )
    }

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Log to external service

    console.log('[Test Drive Request]', {
      name,
      email,
      phone,
      date,
      productName,
      productId,
      message,
      timestamp: new Date().toISOString(),
    })

    // For now, just return success
    return NextResponse.json(
      {
        success: true,
        message: 'Probefahrt-Anfrage erfolgreich eingereicht',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Test Drive Request Error]', error)
    return NextResponse.json(
      { error: 'Anfrage fehlgeschlagen' },
      { status: 500 }
    )
  }
}
