import { db } from '@/lib/db'
import { emailLogs } from '@/lib/db/schema'
import { getShopSettings } from '@/lib/shop-settings-store'
import { sendSmtpMail } from '@/lib/email/smtp'

interface EmailOptions {
  to: string
  subject: string
  type: 'order_confirmation' | 'payment_confirmation' | 'shipping_notification' | 'status_update' | 'new_order_admin' | 'new_financing_request' | 'customer_request_reply'
  orderId?: number
  financingRequestId?: number
  data?: Record<string, any>
}

/**
 * Send email and log the attempt
 */
export async function sendEmail(options: EmailOptions) {
  try {
    const settings = getShopSettings()
    const smtp = settings.email

    if (!smtp.smtpEnabled) {
      console.log('[EMAIL SMTP DISABLED]', {
        to: options.to,
        subject: options.subject,
        type: options.type,
        data: options.data,
      })
    } else {
      if (!smtp.smtpHost || !smtp.fromEmail) {
        throw new Error('SMTP ist aktiviert, aber Host oder Absender fehlen.')
      }
      const text = renderTextEmail(options)
      const html = renderHtmlEmail(options, text, settings)
      await sendSmtpMail({
        host: smtp.smtpHost,
        port: smtp.smtpPort,
        secure: smtp.smtpSecure,
        user: smtp.smtpUser,
        password: smtp.smtpPassword,
        fromEmail: smtp.fromEmail,
        fromName: smtp.fromName,
        replyTo: smtp.replyTo,
      }, {
        to: options.to,
        subject: options.subject,
        text,
        html,
      })
    }

    // Log email attempt in database
    if (db) {
      await db.insert(emailLogs).values({
        recipientEmail: options.to,
        subject: options.subject,
        emailType: options.type,
        orderId: options.orderId || null,
        financingRequestId: options.financingRequestId || null,
        status: 'sent',
        sentAt: new Date(),
      })
    }

    return { success: true }
  } catch (error) {
    console.error('[EMAIL ERROR]', error)

    // Log failed email attempt
    if (db) {
      await db.insert(emailLogs).values({
        recipientEmail: options.to,
        subject: options.subject,
        emailType: options.type,
        orderId: options.orderId || null,
        financingRequestId: options.financingRequestId || null,
        status: 'failed',
        errorMessage: String(error),
        attemptCount: 1,
      })
    }

    return { success: false, error }
  }
}

function renderTextEmail(options: EmailOptions) {
  if (options.type === 'customer_request_reply') {
    const customerName = String(options.data?.customerName || '').trim()
    const requestSubject = String(options.data?.requestSubject || '').trim()
    return [
      'MK-eMotors Dornach',
      '',
      customerName ? `Guten Tag ${customerName}` : 'Guten Tag',
      '',
      options.subject,
      requestSubject ? `Bezug: ${requestSubject}` : '',
      '',
      stripHtml(String(options.data?.message || '')),
      '',
      'Freundliche Grüsse',
      'Ihr MK-eMotors Dornach Team',
      '',
      'Kontakt: info@mk-emotorsdornach.ch',
    ].join('\n')
  }

  return [
    'MK-eMotors Dornach',
    '',
    options.subject,
    '',
    `Typ: ${options.type}`,
    options.data ? JSON.stringify(options.data, null, 2) : '',
  ].join('\n')
}

function renderHtmlEmail(options: EmailOptions, text: string, settings = getShopSettings()) {
  if (options.type === 'customer_request_reply') {
    const company = settings.general.companyName || 'MK-eMotors Dornach'
    const siteName = settings.general.siteName || 'MK-eMotors Dornach'
    const customerName = String(options.data?.customerName || '').trim()
    const requestSubject = String(options.data?.requestSubject || '').trim()
    const requestType = formatRequestType(String(options.data?.requestType || ''))
    const messageHtml = sanitizeEmailHtml(String(options.data?.message || ''))
    const contactEmail = settings.email.replyTo || settings.email.fromEmail || settings.general.email
    const phone = settings.general.phone
    const address = settings.general.address
    const canonicalUrl = settings.seo.canonicalUrl || 'https://mk-emotorsdornach.ch'

    return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${escapeHtml(options.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#07110d;font-family:Inter,Helvetica,Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#07110d;margin:0;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#ffffff;border-radius:28px;overflow:hidden;border:1px solid rgba(34,197,94,0.32);box-shadow:0 24px 70px rgba(0,0,0,0.35);">
            <tr>
              <td style="background:#050806;padding:34px 34px 28px;border-bottom:1px solid rgba(34,197,94,0.28);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <div style="display:inline-block;padding:9px 14px;border-radius:999px;background:rgba(34,197,94,0.13);border:1px solid rgba(34,197,94,0.36);color:#31e981;font-size:12px;font-weight:800;letter-spacing:2.2px;text-transform:uppercase;">Antwort vom Kundendienst</div>
                      <h1 style="margin:18px 0 8px;color:#ffffff;font-size:32px;line-height:1.08;font-weight:900;letter-spacing:-0.5px;">${escapeHtml(siteName)}</h1>
                      <p style="margin:0;color:#a7b3ad;font-size:15px;line-height:1.6;">Premium E-Mobility Beratung aus Dornach</p>
                    </td>
                    <td align="right" style="vertical-align:top;">
                      <div style="width:58px;height:58px;border-radius:18px;background:#22c55e;color:#04130b;font-size:22px;font-weight:900;line-height:58px;text-align:center;">MK</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:34px;">
                <p style="margin:0 0 10px;color:#111827;font-size:18px;line-height:1.5;font-weight:800;">${customerName ? `Guten Tag ${escapeHtml(customerName)}` : 'Guten Tag'}</p>
                <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:1.7;">Vielen Dank für Ihre Nachricht. Unser Team hat Ihre Anfrage geprüft und Ihnen persönlich geantwortet.</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;border-collapse:separate;border-spacing:0;">
                  <tr>
                    <td style="padding:18px 20px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:18px;">
                      <p style="margin:0 0 6px;color:#6b7280;font-size:12px;font-weight:900;letter-spacing:1.6px;text-transform:uppercase;">Betreff</p>
                      <p style="margin:0;color:#111827;font-size:17px;font-weight:900;line-height:1.45;">${escapeHtml(requestSubject || options.subject)}</p>
                      ${requestType ? `<p style="margin:10px 0 0;color:#16a34a;font-size:13px;font-weight:800;">${escapeHtml(requestType)}</p>` : ''}
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 26px;">
                  <tr>
                    <td style="padding:26px;background:#ffffff;border:1px solid #d1fae5;border-radius:22px;box-shadow:0 14px 34px rgba(15,23,42,0.08);">
                      <div style="color:#111827;font-size:16px;line-height:1.75;">${messageHtml}</div>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 26px;">
                  <tr>
                    <td align="center" style="padding:0 0 10px;">
                      <a href="${escapeAttr(canonicalUrl)}" style="display:inline-block;border-radius:999px;background:#22c55e;color:#04130b;text-decoration:none;font-size:15px;font-weight:900;padding:15px 24px;">Shop & Kundenkonto öffnen</a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.7;">Freundliche Grüsse<br><strong style="color:#111827;">Ihr ${escapeHtml(company)} Team</strong></p>
              </td>
            </tr>

            <tr>
              <td style="background:#f3f4f6;padding:24px 34px;border-top:1px solid #e5e7eb;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="color:#4b5563;font-size:13px;line-height:1.7;">
                      <strong style="color:#111827;">${escapeHtml(company)}</strong><br>
                      ${escapeHtml(address)}<br>
                      ${phone ? `Telefon: ${escapeHtml(phone)}<br>` : ''}
                      ${contactEmail ? `E-Mail: <a href="mailto:${escapeAttr(contactEmail)}" style="color:#16a34a;text-decoration:none;font-weight:800;">${escapeHtml(contactEmail)}</a>` : ''}
                    </td>
                  </tr>
                </table>
                <p style="margin:18px 0 0;color:#9ca3af;font-size:11px;line-height:1.6;">Diese Nachricht wurde über das sichere MK-eMotors Dornach Kunden- und Anfrage-System versendet.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
  }

  return `<pre style="font-family:Arial,sans-serif;white-space:pre-wrap">${escapeHtml(text)}</pre>`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttr(value: string) {
  return escapeHtml(value).replace(/"/g, '&quot;')
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function sanitizeEmailHtml(value: string) {
  const cleaned = value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')

  return cleaned.trim() || '<p style="margin:0;">Vielen Dank für Ihre Anfrage. Wir melden uns gerne bei Ihnen.</p>'
}

function formatRequestType(type: string) {
  const labels: Record<string, string> = {
    support: 'Support Ticket',
    service: 'Serviceanfrage',
    warranty: 'Garantie & Serviceantrag',
    return: 'Rückgabe / Retoure',
    trade_in: 'Secondhand / Tausch',
    estimate: 'Kostenvoranschlag-Termin',
    contact: 'Kontaktanfrage',
    coupon: 'Coupon / Wunschbetrag',
  }
  return labels[type] || ''
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(
  customerEmail: string,
  orderNumber: string,
  orderData: any
) {
  return sendEmail({
    to: customerEmail,
    subject: `Bestellbestätigung - ${orderNumber}`,
    type: 'order_confirmation',
    data: {
      orderNumber,
      ...orderData,
    },
  })
}

/**
 * Send payment confirmation email to customer
 */
export async function sendPaymentConfirmationEmail(
  customerEmail: string,
  orderNumber: string,
  amount: number
) {
  return sendEmail({
    to: customerEmail,
    subject: `Zahlungsbestätigung - ${orderNumber}`,
    type: 'payment_confirmation',
    data: {
      orderNumber,
      amount,
    },
  })
}

/**
 * Send shipping notification email to customer
 */
export async function sendShippingNotificationEmail(
  customerEmail: string,
  orderNumber: string,
  trackingNumber: string,
  trackingUrl: string
) {
  return sendEmail({
    to: customerEmail,
    subject: `Ihre Bestellung wurde versendet - ${orderNumber}`,
    type: 'shipping_notification',
    data: {
      orderNumber,
      trackingNumber,
      trackingUrl,
    },
  })
}

/**
 * Send order status update email to customer
 */
export async function sendOrderStatusUpdateEmail(
  customerEmail: string,
  orderNumber: string,
  status: string
) {
  return sendEmail({
    to: customerEmail,
    subject: `Bestellstatus aktualisiert - ${orderNumber}`,
    type: 'status_update',
    data: {
      orderNumber,
      status,
    },
  })
}

/**
 * Send new order notification to admin
 */
export async function sendNewOrderAdminEmail(adminEmail: string, orderData: any) {
  return sendEmail({
    to: adminEmail,
    subject: `Neue Bestellung eingegangen - ${orderData.orderNumber}`,
    type: 'new_order_admin',
    data: orderData,
  })
}

/**
 * Send new financing request notification to admin
 */
export async function sendNewFinancingRequestAdminEmail(
  adminEmail: string,
  requestData: any
) {
  return sendEmail({
    to: adminEmail,
    subject: `Neue Finanzierungsanfrage - ${requestData.firstName} ${requestData.lastName}`,
    type: 'new_financing_request',
    data: requestData,
  })
}

/**
 * Send financing request approval email to customer
 */
export async function sendFinancingApprovalEmail(
  customerEmail: string,
  customerName: string,
  financingDetails: any
) {
  return sendEmail({
    to: customerEmail,
    subject: 'Ihre Finanzierungsanfrage wurde genehmigt',
    type: 'order_confirmation',
    data: {
      customerName,
      ...financingDetails,
    },
  })
}

/**
 * Send financing request rejection email to customer
 */
export async function sendFinancingRejectionEmail(
  customerEmail: string,
  customerName: string,
  reason: string
) {
  return sendEmail({
    to: customerEmail,
    subject: 'Ihre Finanzierungsanfrage',
    type: 'order_confirmation',
    data: {
      customerName,
      reason,
    },
  })
}
