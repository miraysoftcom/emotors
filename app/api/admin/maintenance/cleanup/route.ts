import fs from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredSessions, getSession } from '@/lib/admin-auth'

type CleanupTarget = {
  label: string
  displayPath: string
  absolutePath: string
}

const PROJECT_ROOT = /* turbopackIgnore: true */ process.cwd()

const CLEANUP_TARGETS: CleanupTarget[] = [
  { label: 'Next.js Build Cache', displayPath: '.next/cache', absolutePath: `${PROJECT_ROOT}/.next/cache` },
  { label: 'Next.js Dev Cache', displayPath: '.next/dev/cache', absolutePath: `${PROJECT_ROOT}/.next/dev/cache` },
  { label: 'Next.js Dev Logs', displayPath: '.next/dev/logs', absolutePath: `${PROJECT_ROOT}/.next/dev/logs` },
  { label: 'Temporäre App Dateien', displayPath: '.tmp', absolutePath: `${PROJECT_ROOT}/.tmp` },
  { label: 'Test Coverage', displayPath: 'coverage', absolutePath: `${PROJECT_ROOT}/coverage` },
]

function assertAdmin(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  return Boolean(token && getSession(token))
}

function safeTargetPath(targetPath: string) {
  if (!targetPath.startsWith(`${PROJECT_ROOT}/`)) {
    throw new Error('Ungültiger Cleanup-Pfad.')
  }
  return targetPath
}

function getPathSize(targetPath: string): number {
  if (!fs.existsSync(targetPath)) return 0
  const stats = fs.lstatSync(targetPath)
  if (stats.isSymbolicLink()) return 0
  if (stats.isFile()) return stats.size
  if (!stats.isDirectory()) return 0

  return fs.readdirSync(targetPath).reduce((total, entry) => {
    return total + getPathSize(`${targetPath}/${entry}`)
  }, 0)
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

export async function POST(request: NextRequest) {
  if (!assertAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cleaned = CLEANUP_TARGETS.map((target) => {
      const targetPath = safeTargetPath(target.absolutePath)
      const existed = fs.existsSync(targetPath)
      const bytes = existed ? getPathSize(targetPath) : 0

      if (existed) {
        fs.rmSync(targetPath, { recursive: true, force: true })
      }

      return {
        label: target.label,
        path: target.displayPath,
        existed,
        bytes,
        formattedSize: formatBytes(bytes),
      }
    })

    cleanupExpiredSessions()

    const totalBytes = cleaned.reduce((sum, item) => sum + item.bytes, 0)

    return NextResponse.json({
      success: true,
      cleaned,
      totalBytes,
      totalSize: formatBytes(totalBytes),
      message: `Cache und unnötige temporäre Inhalte wurden bereinigt (${formatBytes(totalBytes)}).`,
    })
  } catch (error) {
    console.error('[Admin Cleanup Error]', error)
    return NextResponse.json(
      { error: 'Cleanup konnte nicht abgeschlossen werden.' },
      { status: 500 }
    )
  }
}
