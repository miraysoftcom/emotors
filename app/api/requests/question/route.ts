import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, category, question, productName, productId } = body

    // Validate required fields
    if (!name || !email || !question) {
      return NextResponse.json(
        { error: 'Alle erforderlichen Felder müssen ausgefüllt werden' },
        { status: 400 }
      )
    }

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Log to external service

    console.log('[Question Request]', {
      name,
      email,
      phone,
      category,
      question,
      productName,
      productId,
      timestamp: new Date().toISOString(),
    })

    // For now, just return success
    return NextResponse.json(
      {
        success: true,
        message: 'Frage erfolgreich eingereicht',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Question Request Error]', error)
    return NextResponse.json(
      { error: 'Anfrage fehlgeschlagen' },
      { status: 500 }
    )
  }
}
