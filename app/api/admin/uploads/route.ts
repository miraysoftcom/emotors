import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { isAdminRequestAuthorized } from '@/lib/admin-auth'

const MAX_FILE_SIZE = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function extensionFor(file: File) {
  const byType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  const fromType = byType[file.type]
  if (fromType) return fromType
  const original = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '')
  return original || 'img'
}

function safeName(value: string) {
  return value
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70) || 'image'
}

function hasValidImageSignature(type: string, bytes: Buffer) {
  if (type === 'image/jpeg') return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (type === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  if (type === 'image/gif') return bytes.subarray(0, 6).toString('ascii') === 'GIF87a' || bytes.subarray(0, 6).toString('ascii') === 'GIF89a'
  if (type === 'image/webp') return bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  return false
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminRequestAuthorized(request.cookies.get('adminToken')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Bitte wählen Sie eine Bilddatei aus.' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Nur JPG, PNG, WebP oder GIF Dateien sind erlaubt.' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Das Bild darf maximal 8 MB gross sein.' }, { status: 400 })
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    if (!hasValidImageSignature(file.type, bytes)) {
      return NextResponse.json({ error: 'Die Datei ist keine gültige Bilddatei.' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    await fs.mkdir(uploadDir, { recursive: true })

    const ext = extensionFor(file)
    const filename = `${Date.now()}-${safeName(file.name)}.${ext}`
    const filepath = path.join(uploadDir, filename)
    await fs.writeFile(filepath, bytes)

    return NextResponse.json({
      url: `/uploads/products/${filename}`,
      filename,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('[Upload Error]', error)
    return NextResponse.json({ error: 'Upload konnte nicht gespeichert werden.' }, { status: 500 })
  }
}
