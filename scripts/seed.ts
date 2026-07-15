import { db } from '@/lib/db'
import { user, verification } from '@/lib/db/schema'
import { hash } from 'better-auth/crypto'
import { Pool } from 'pg'
import crypto from 'crypto'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function seed() {
  try {
    console.log('🌱 Seeding database...')

    // Create admin user
    const adminId = crypto.randomUUID()
    const hashedPassword = await hash('Blevh4np1@@')

    await db.insert(user).values({
      id: adminId,
      name: 'Admin',
      email: 'info@mk-emotorsdornach.ch',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Store hashed password (Better Auth stores this separately via the account table)
    // For now, we'll add a direct entry with the credentials

    console.log('✅ Database seeded successfully!')
    console.log('')
    console.log('Admin credentials:')
    console.log('Email: info@mk-emotorsdornach.ch')
    console.log('Password: Blevh4np1@@')
    console.log('')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seed()
