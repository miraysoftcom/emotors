import qrcodeModule from '../vendor/qrcode/lib/browser.js'

type QrCodeModule = {
  toString: (text: string, options: Record<string, unknown>) => Promise<string>
  create: (text: string, options: Record<string, unknown>) => {
    modules: {
      size: number
      data: boolean[]
    }
  }
}

const qrcode = qrcodeModule as QrCodeModule

export async function createQrSvgDataUrl(text: string) {
  const svg = await qrcode.toString(text, {
    type: 'svg',
    margin: 2,
    width: 256,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  })

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

export type QrMatrix = {
  size: number
  data: boolean[]
}

export function createQrMatrix(text: string): QrMatrix {
  const qr = qrcode.create(text, {
    errorCorrectionLevel: 'M',
    margin: 0,
  })

  return {
    size: qr.modules.size,
    data: qr.modules.data,
  }
}

export function createSwissQrSvg(text: string, className = 'qr-code') {
  const matrix = createQrMatrix(text)
  const quietZone = 4
  const viewSize = matrix.size + quietZone * 2
  const rects: string[] = []

  matrix.data.forEach((filled, index) => {
    if (!filled) return
    const row = Math.floor(index / matrix.size)
    const col = index % matrix.size
    rects.push(`<rect x="${col + quietZone}" y="${row + quietZone}" width="1" height="1" />`)
  })

  const crossSize = Math.max(5.6, matrix.size * 0.14)
  const crossX = viewSize / 2 - crossSize / 2
  const crossY = viewSize / 2 - crossSize / 2
  const plusThickness = crossSize * 0.18
  const plusLong = crossSize * 0.62
  const plusX = viewSize / 2 - plusThickness / 2
  const plusY = viewSize / 2 - plusLong / 2
  const plusHorizontalX = viewSize / 2 - plusLong / 2
  const plusHorizontalY = viewSize / 2 - plusThickness / 2

  return `
    <svg class="${className}" viewBox="0 0 ${viewSize} ${viewSize}" role="img" aria-label="Swiss QR Code" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <rect width="${viewSize}" height="${viewSize}" fill="#fff" />
      <g fill="#000">${rects.join('')}</g>
      <rect x="${crossX.toFixed(3)}" y="${crossY.toFixed(3)}" width="${crossSize.toFixed(3)}" height="${crossSize.toFixed(3)}" fill="#111" />
      <rect x="${plusX.toFixed(3)}" y="${plusY.toFixed(3)}" width="${plusThickness.toFixed(3)}" height="${plusLong.toFixed(3)}" fill="#fff" />
      <rect x="${plusHorizontalX.toFixed(3)}" y="${plusHorizontalY.toFixed(3)}" width="${plusLong.toFixed(3)}" height="${plusThickness.toFixed(3)}" fill="#fff" />
    </svg>
  `
}
