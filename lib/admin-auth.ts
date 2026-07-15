import crypto from 'crypto'

const PBKDF2_ITERATIONS = 210000

// Hash password with salt
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

// Verify password against hash
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, original] = hash.split(':')
  if (!salt || !original) return false
  const newHash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, 'sha512').toString('hex')
  const expected = Buffer.from(original, 'hex')
  const actual = Buffer.from(newHash, 'hex')
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
}

// Generate session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Session storage in memory (in production, use database or Redis)
export interface AdminSession {
  token: string
  createdAt: number
  expiresAt: number
  loginAttempts?: number
}

const SESSIONS = new Map<string, AdminSession>()
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours
const MAX_LOGIN_ATTEMPTS = 5
const ATTEMPT_WINDOW = 15 * 60 * 1000 // 15 minutes

// Track failed login attempts
const failedAttempts = new Map<string, { count: number; timestamp: number }>()

// Check if account is locked due to failed attempts
export function isAccountLocked(identifier: string): boolean {
  const attempt = failedAttempts.get(identifier)
  if (!attempt) return false

  // Reset if window expired
  if (Date.now() - attempt.timestamp > ATTEMPT_WINDOW) {
    failedAttempts.delete(identifier)
    return false
  }

  return attempt.count >= MAX_LOGIN_ATTEMPTS
}

// Record failed login attempt
export function recordFailedAttempt(identifier: string): void {
  const attempt = failedAttempts.get(identifier)
  if (attempt) {
    attempt.count++
    attempt.timestamp = Date.now()
  } else {
    failedAttempts.set(identifier, { count: 1, timestamp: Date.now() })
  }
}

// Clear failed attempts
export function clearFailedAttempts(identifier: string): void {
  failedAttempts.delete(identifier)
}

// Create session
export function createSession(token: string): AdminSession {
  const session: AdminSession = {
    token,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TIMEOUT,
  }
  SESSIONS.set(token, session)
  return session
}

// Get session
export function getSession(token: string): AdminSession | null {
  const session = SESSIONS.get(token)
  if (!session) return null

  // Check if session expired
  if (Date.now() > session.expiresAt) {
    SESSIONS.delete(token)
    return null
  }

  return session
}

// Destroy session
export function destroySession(token: string): void {
  SESSIONS.delete(token)
}

// Get all sessions (for admin settings)
export function getAllSessions(): AdminSession[] {
  return Array.from(SESSIONS.values())
}

// Cleanup expired sessions
export function cleanupExpiredSessions(): void {
  const now = Date.now()
  for (const [token, session] of SESSIONS.entries()) {
    if (now > session.expiresAt) {
      SESSIONS.delete(token)
    }
  }
}

// Admin credentials storage (in production, use database)
export interface AdminCredentials {
  passwordHash: string
  lastChanged: number
  enabled: boolean
  loginHistory: Array<{ timestamp: number; success: boolean; ip?: string }>
}

let adminCredentials: AdminCredentials = {
  passwordHash: getInitialAdminPasswordHash(),
  lastChanged: Date.now(),
  enabled: true,
  loginHistory: [],
}

function getInitialAdminPasswordHash() {
  if (process.env.ADMIN_PASSWORD_HASH) return process.env.ADMIN_PASSWORD_HASH
  if (process.env.ADMIN_PASSWORD) return hashPassword(process.env.ADMIN_PASSWORD)
  if (process.env.NODE_ENV === 'production') {
    console.warn('[Admin Auth] ADMIN_PASSWORD or ADMIN_PASSWORD_HASH is required in production. Admin login is disabled.')
    return hashPassword(crypto.randomBytes(48).toString('hex'))
  }
  return hashPassword('Blevh4np1@@')
}

// Get admin credentials
export function getAdminCredentials(): AdminCredentials {
  return { ...adminCredentials }
}

// Update admin password
export function updateAdminPassword(newPassword: string): void {
  adminCredentials.passwordHash = hashPassword(newPassword)
  adminCredentials.lastChanged = Date.now()
}

// Toggle password protection
export function togglePasswordProtection(enabled: boolean): void {
  adminCredentials.enabled = enabled
}

// Record login attempt in history
export function recordLoginHistory(success: boolean, ip?: string): void {
  adminCredentials.loginHistory.push({
    timestamp: Date.now(),
    success,
    ip,
  })
  // Keep only last 100 entries
  if (adminCredentials.loginHistory.length > 100) {
    adminCredentials.loginHistory = adminCredentials.loginHistory.slice(-100)
  }
}

// Get login history
export function getLoginHistory(limit: number = 50): AdminCredentials['loginHistory'] {
  return adminCredentials.loginHistory.slice(-limit)
}

export function isAdminRequestAuthorized(token?: string | null): boolean {
  return Boolean(token && getSession(token))
}
