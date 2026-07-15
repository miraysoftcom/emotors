import net from 'net'
import tls from 'tls'

export type SmtpSettings = {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
  fromEmail: string
  fromName: string
  replyTo?: string
}

type SmtpSendOptions = {
  to: string
  subject: string
  text: string
  html?: string
}

function encodeHeader(value: string) {
  return /[^\x20-\x7E]/.test(value)
    ? `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`
    : value
}

function escapeLine(value: string) {
  return value.replace(/\r?\n\./g, '\n..')
}

function buildMessage(settings: SmtpSettings, options: SmtpSendOptions) {
  const boundary = `mk-${Date.now()}-${Math.random().toString(16).slice(2)}`
  const from = `${encodeHeader(settings.fromName)} <${settings.fromEmail}>`
  const headers = [
    `From: ${from}`,
    `To: ${options.to}`,
    `Subject: ${encodeHeader(options.subject)}`,
    settings.replyTo ? `Reply-To: ${settings.replyTo}` : '',
    'MIME-Version: 1.0',
    options.html
      ? `Content-Type: multipart/alternative; boundary="${boundary}"`
      : 'Content-Type: text/plain; charset=UTF-8',
  ].filter(Boolean)

  if (!options.html) {
    return `${headers.join('\r\n')}\r\n\r\n${escapeLine(options.text)}\r\n`
  }

  return `${headers.join('\r\n')}\r\n\r\n` +
    `--${boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${escapeLine(options.text)}\r\n` +
    `--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${escapeLine(options.html)}\r\n` +
    `--${boundary}--\r\n`
}

export async function sendSmtpMail(settings: SmtpSettings, options: SmtpSendOptions) {
  let socket = await connect(settings)
  let buffer = ''

  const readResponse = () => new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('SMTP timeout')), 15000)
    const onData = (chunk: Buffer) => {
      buffer += chunk.toString('utf8')
      const lines = buffer.split(/\r?\n/).filter(Boolean)
      const last = lines[lines.length - 1] || ''
      if (/^\d{3}\s/.test(last)) {
        const response = buffer
        buffer = ''
        clearTimeout(timeout)
        socket.off('data', onData)
        resolve(response)
      }
    }
    socket.on('data', onData)
    socket.once('error', reject)
  })

  const command = async (line: string, expected: number[]) => {
    socket.write(`${line}\r\n`)
    const response = await readResponse()
    const code = Number(response.slice(0, 3))
    if (!expected.includes(code)) {
      throw new Error(`SMTP command failed: ${line} -> ${response.trim()}`)
    }
    return response
  }

  const greeting = await readResponse()
  if (![220].includes(Number(greeting.slice(0, 3)))) {
    throw new Error(`SMTP greeting failed: ${greeting.trim()}`)
  }

  await command('EHLO mk-emotors.local', [250])

  if (!settings.secure && settings.port !== 25) {
    await command('STARTTLS', [220])
    socket = tls.connect({ socket, servername: settings.host })
    await new Promise<void>((resolve, reject) => {
      socket.once('secureConnect', () => resolve())
      socket.once('error', reject)
    })
    await command('EHLO mk-emotors.local', [250])
  }

  if (settings.user && settings.password) {
    await command('AUTH LOGIN', [334])
    await command(Buffer.from(settings.user).toString('base64'), [334])
    await command(Buffer.from(settings.password).toString('base64'), [235])
  }

  await command(`MAIL FROM:<${settings.fromEmail}>`, [250])
  await command(`RCPT TO:<${options.to}>`, [250, 251])
  await command('DATA', [354])
  socket.write(`${buildMessage(settings, options)}\r\n.\r\n`)
  const dataResponse = await readResponse()
  if (![250].includes(Number(dataResponse.slice(0, 3)))) {
    throw new Error(`SMTP DATA failed: ${dataResponse.trim()}`)
  }
  await command('QUIT', [221]).catch(() => null)
  socket.end()
}

function connect(settings: SmtpSettings) {
  return new Promise<net.Socket>((resolve, reject) => {
    const socket = settings.secure
      ? tls.connect(settings.port, settings.host, { servername: settings.host })
      : net.connect(settings.port, settings.host)
    socket.setTimeout(20000)
    socket.once(settings.secure ? 'secureConnect' : 'connect', () => resolve(socket))
    socket.once('timeout', () => reject(new Error('SMTP connection timeout')))
    socket.once('error', reject)
  })
}
