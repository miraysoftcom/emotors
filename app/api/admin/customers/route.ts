import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequestAuthorized } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { customers } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

// Check if user is authenticated as admin
async function isAdmin(req: NextRequest) {
  return isAdminRequestAuthorized(req.cookies.get('adminToken')?.value)
}

// GET all customers
export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const allCustomers = await db
      .select()
      .from(customers)
      .orderBy(desc(customers.createdAt))
      .limit(100)

    return NextResponse.json({ customers: allCustomers })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new customer
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const body = await req.json()

    // Validate required fields
    const required = ['email', 'firstName', 'lastName']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Check if customer already exists
    const existing = await db
      .select()
      .from(customers)
      .where(eq(customers.email, body.email))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Customer already exists' }, { status: 409 })
    }

    // Insert customer
    const [newCustomer] = await db
      .insert(customers)
      .values({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone || null,
        company: body.company || null,
        defaultAddress: body.defaultAddress || null,
        city: body.city || null,
        postalCode: body.postalCode || null,
        country: body.country || null,
        notes: body.notes || null,
      })
      .returning()

    return NextResponse.json({ customer: newCustomer }, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update customer
export async function PUT(req: NextRequest) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    const [updatedCustomer] = await db
      .update(customers)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))
      .returning()

    return NextResponse.json({ customer: updatedCustomer })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE customer
export async function DELETE(req: NextRequest) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    await db
      .delete(customers)
      .where(eq(customers.id, parseInt(id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
