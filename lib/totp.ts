import crypto from 'crypto'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function generateTotpSecret(bytes = 20) {
  const buffer = crypto.randomBytes(bytes)
  let bits = ''
  for (const byte of buffer) bits += byte.toString(2).padStart(8, '0')
  let secret = ''
  for (let index = 0; index < bits.length; index += 5) {
    const chunk = bits.slice(index, index + 5).padEnd(5, '0')
    secret += BASE32_ALPHABET[parseInt(chunk, 2)]
  }
  return secret
}

export function buildOtpAuthUri(input: {
  issuer: string
  accountName: string
  secret: string
}) {
  const issuer = input.issuer.trim() || 'MK-eMotors Dornach'
  const label = `${issuer}:${input.accountName}`
  const params = new URLSearchParams({
    secret: input.secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  })
  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`
}

export function verifyTotpCode(secret: string, code: string, window = 1) {
  const normalized = code.replace(/\s+/g, '')
  if (!/^\d{6}$/.test(normalized)) return false
  const currentCounter = Math.floor(Date.now() / 1000 / 30)
  for (let offset = -window; offset <= window; offset += 1) {
    if (generateTotpCode(secret, currentCounter + offset) === normalized) return true
  }
  return false
}

function generateTotpCode(secret: string, counter: number) {
  const key = decodeBase32(secret)
  const counterBuffer = Buffer.alloc(8)
  counterBuffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0)
  counterBuffer.writeUInt32BE(counter >>> 0, 4)
  const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  const binary = ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  return String(binary % 1000000).padStart(6, '0')
}

function decodeBase32(secret: string) {
  const clean = secret.replace(/=+$/g, '').replace(/\s+/g, '').toUpperCase()
  let bits = ''
  for (const char of clean) {
    const value = BASE32_ALPHABET.indexOf(char)
    if (value === -1) throw new Error('Invalid base32 secret')
    bits += value.toString(2).padStart(5, '0')
  }
  const bytes = []
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(parseInt(bits.slice(index, index + 8), 2))
  }
  return Buffer.from(bytes)
}
