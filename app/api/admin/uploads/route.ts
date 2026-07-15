import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const MAX_FILE_SIZE = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])

function extensionFor(file: File) {
  const byType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Bitte wählen Sie eine Bilddatei aus.' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Nur JPG, PNG, WebP, GIF oder SVG Dateien sind erlaubt.' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Das Bild darf maximal 8 MB gross sein.' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    await fs.mkdir(uploadDir, { recursive: true })

    const ext = extensionFor(file)
    const filename = `${Date.now()}-${safeName(file.name)}.${ext}`
    const filepath = path.join(uploadDir, filename)
    const bytes = Buffer.from(await file.arrayBuffer())
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
