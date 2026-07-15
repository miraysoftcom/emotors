import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    const { firstName, lastName, email, phone, product, price, duration, monthlyPayment } = data

    if (!firstName || !lastName || !email || !phone || !product) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Here you would typically:
    // 1. Save to database
    // 2. Send email to admin
    // 3. Send auto-reply to customer
    // For now, we'll just log and return success

    console.log('[Financing Application]', {
      timestamp: new Date().toISOString(),
      applicant: `${firstName} ${lastName}`,
      email,
      phone,
      product,
      price: `CHF ${price}`,
      duration: `${duration} Monate`,
      monthlyPayment: `CHF ${monthlyPayment}`,
    })

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json(
      { 
        success: true, 
        message: 'Financing application received successfully',
        referenceId: `FIN-${Date.now()}`
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Financing API Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
