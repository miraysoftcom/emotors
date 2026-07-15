import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || ''

let poolInstance: Pool | null = null
let dbInstance: ReturnType<typeof drizzle> | null = null

function initializePool() {
  if (!poolInstance) {
    if (!process.env.DATABASE_URL) {
      return null
    }
    poolInstance = new Pool({ connectionString: process.env.DATABASE_URL })
  }
  return poolInstance
}

function initializeDb() {
  if (!dbInstance) {
    const pool = initializePool()
    if (!pool) return null
    dbInstance = drizzle(pool, { schema })
  }
  return dbInstance
}

export function getPool() {
  return initializePool()
}

export function getDb() {
  return initializeDb()
}

// Lazy export - only initialize if DATABASE_URL is set
export const db = getDb()
export const pool = getPool()
