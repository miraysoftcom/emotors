import { formatMoney } from '@/lib/money'
import { createSwissQrSvg } from '@/lib/qr-code'
import { buildSwissQrBillPayload, normalizeReferenceForType } from '@/lib/swiss-qr-bill'
import type { InvoiceRecord, InvoiceSettings } from '@/lib/invoice-store'
import type { StoredOrder } from '@/lib/orders-store'

export function renderInvoiceHtmlDocument(input: {
  invoice: InvoiceRecord
  order?: StoredOrder | null
  settings: InvoiceSettings
}) {
  const { invoice, order, settings } = input
  const customerName = order
    ? `${order.firstName} ${order.lastName}`.trim()
    : invoice.customerName || [invoice.billingAddress?.firstName, invoice.billingAddress?.lastName].filter(Boolean).join(' ') || 'Peter Muster'
  const customerAddress = [
    order?.billingStreet || invoice.billingAddress?.street || 'Musterstrasse 1',
    `${order?.billingPostalCode || invoice.billingAddress?.postalCode || '1234'} ${order?.billingCity || invoice.billingAddress?.city || 'Musterstadt'}`.trim(),
  ]
  const companyName = settings.companyName || 'SwissQRBill'
  const companyAddress = [
    `${settings.street || 'Musterstrasse'} ${settings.houseNumber || '7'}`.trim(),
    `${settings.postalCode || '1234'} ${settings.city || 'Musterstadt'}`.trim(),
  ]
  const placeAndDate = `${settings.city || 'Musterstadt'} ${formatDate(invoice.createdAt)}`
  const subtotal = order?.subtotal ?? invoice.items?.reduce((sum, item) => sum + item.lineTotal, 0) ?? invoice.amount
  const shipping = order?.shippingCost ?? 0
  const taxLine = invoice.taxSnapshot?.lines?.[0]
  const taxRate = taxLine?.percentage ?? 0
  const taxAmount = invoice.taxSnapshot?.tax ?? order?.tax ?? 0
  const taxEnabled = Boolean(invoice.taxSnapshot?.enabled)
  const total = invoice.amount
  const swissQrSlip = renderSwissQrSlipSafe({ invoice, order, settings, customerName, customerAddress })

  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Rechnung ${escapeHtml(invoice.invoiceNumber)}</title>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      background: #e5e7eb;
      color: #000;
      font-family: Inter, Helvetica, Arial, sans-serif;
      line-height: 1.15;
    }
    body { padding: 1.5rem; }
    .toolbar {
      width: min(100%, 210mm);
      margin: 0 auto 1rem;
      display: flex;
      justify-content: flex-end;
      gap: .75rem;
    }
    .toolbar button {
      border: 1px solid #cfd4dc;
      background: #fff;
      border-radius: .5rem;
      padding: .7rem 1rem;
      font-weight: 800;
      cursor: pointer;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #fff;
      box-shadow: 0 1rem 2.5rem rgba(15, 23, 42, .16);
      overflow: hidden;
    }
    .invoice-main {
      min-height: 192mm;
      padding: 15mm 20mm 10mm;
      display: flex;
      flex-direction: column;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: .55rem;
      min-height: 14mm;
    }
    .brand-mark {
      width: 12mm;
      aspect-ratio: 1;
      position: relative;
      background:
        linear-gradient(90deg, #ff5a5f 18%, transparent 18% 32%, #ff5a5f 32% 48%, transparent 48% 64%, #ff5a5f 64% 82%, transparent 82%),
        linear-gradient(#ff5a5f 16%, transparent 16% 32%, #ff5a5f 32% 44%, transparent 44% 60%, #ff5a5f 60% 76%, transparent 76%),
        repeating-linear-gradient(45deg, #ff5a5f 0 .08rem, #fff .08rem .2rem);
      border: .08rem solid #ff5a5f;
    }
    .brand-name {
      color: #5f6368;
      font-size: 1.45rem;
      font-weight: 500;
      letter-spacing: 0;
    }
    img.brand-mark {
      object-fit: contain;
      background: transparent;
      border: 0;
    }
    .sender {
      margin-top: 12mm;
      font-size: 1rem;
      font-weight: 800;
    }
    .recipient {
      margin-top: 12mm;
      margin-left: auto;
      width: 36%;
      min-width: 14rem;
      font-size: 1rem;
      font-weight: 800;
    }
    .invoice-heading {
      margin-top: 27mm;
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: end;
      gap: 1rem;
    }
    .invoice-heading h1 {
      margin: 0;
      font-size: 1.24rem;
      font-weight: 950;
      letter-spacing: -.03em;
    }
    .invoice-date {
      font-size: .95rem;
      font-weight: 700;
      white-space: nowrap;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6mm;
      font-size: .95rem;
    }
    thead th {
      background: #4f5358;
      color: #fff;
      padding: .35rem .48rem;
      text-align: left;
      font-weight: 900;
    }
    tbody td {
      padding: .48rem .48rem;
      vertical-align: top;
    }
    .col-pos { width: 12%; }
    .col-qty { width: 12%; }
    .col-total { width: 20%; text-align: right; white-space: nowrap; }
    .total-label {
      font-weight: 950;
      padding-top: .7rem;
    }
    .total-value {
      font-weight: 950;
      text-align: right;
      white-space: nowrap;
      padding-top: .7rem;
    }
    .spacer-row td { padding-top: 7mm; }
    .mobile-items { display: none; }
    .qr-slip {
      width: 210mm;
      height: 105mm;
      border-top: .2mm dotted #000;
      position: relative;
      background: #fff;
      color: #000;
      page-break-inside: avoid;
    }
    .cut-top {
      position: absolute;
      inset-inline: 0;
      top: -1.8mm;
      text-align: center;
      font-size: 3.2mm;
      line-height: 1;
    }
    .cut-vertical {
      position: absolute;
      left: 62mm;
      top: 7mm;
      transform: translateX(-50%);
      font-size: 3.2mm;
      line-height: 1;
      background: #fff;
    }
    .qr-grid {
      height: 100%;
      display: grid;
      grid-template-columns: 62mm 1fr;
    }
    .receipt {
      border-right: .2mm dotted #000;
      padding: 5mm;
      display: grid;
      grid-template-rows: auto auto 1fr auto auto;
    }
    .payment-part {
      padding: 5mm 5mm 5mm 5mm;
      display: grid;
      grid-template-columns: 46mm minmax(0, 1fr);
      gap: 10mm;
      min-width: 0;
    }
    .qr-title {
      margin: 0 0 7mm;
      font-size: 4.2mm;
      font-weight: 900;
      line-height: 1.05;
    }
    .qr-label {
      margin-top: 4.6mm;
      margin-bottom: 1.3mm;
      font-size: 2.15mm;
      font-weight: 900;
      line-height: 1.08;
    }
    .qr-text {
      margin: 0;
      font-size: 2.6mm;
      font-weight: 400;
      line-height: 1.22;
    }
    .payment-part .qr-text {
      font-size: 3.15mm;
      font-weight: 400;
      line-height: 1.22;
      overflow-wrap: anywhere;
    }
    .amount-grid {
      display: grid;
      grid-template-columns: 22mm 1fr;
      gap: 4mm;
      align-self: end;
      margin-top: 7mm;
    }
    .amount-grid .qr-text {
      font-size: 3mm;
    }
    .payment-part .amount-grid .qr-text {
      font-size: 4mm;
    }
    .acceptance {
      align-self: end;
      text-align: right;
      font-size: 2mm;
      font-weight: 900;
    }
    .qr-code {
      width: 46mm;
      aspect-ratio: 1;
      margin-top: 0;
      display: block;
    }
    .qr-left {
      min-width: 0;
    }
    .qr-right {
      min-width: 0;
      padding-top: 11.5mm;
    }
    .receipt-body,
    .payment-body {
      min-width: 0;
    }
    @media (max-width: 760px) {
      body { padding: 0; background: #fff; }
      .toolbar { padding: .75rem; margin: 0; width: 100%; }
      .page { width: 100%; min-height: 0; box-shadow: none; }
      .invoice-main { min-height: 0; padding: 1.25rem; }
      .recipient { width: auto; margin-left: 0; }
      .invoice-heading { grid-template-columns: 1fr; margin-top: 2.5rem; }
      table { display: none; }
      .mobile-items { display: grid; gap: .75rem; margin-top: 1rem; }
      .mobile-item { border: .06rem solid #d7d7d7; padding: .85rem; }
      .qr-slip { height: auto; min-height: 105mm; }
      .qr-grid, .payment-part { grid-template-columns: 1fr; }
      .receipt { border-right: 0; border-bottom: .04rem dotted #000; min-height: 95mm; }
      .cut-vertical { display: none; }
      .qr-code { margin-inline: auto; }
    }
    @page { size: A4; margin: 0; }
    @media print {
      html, body { background: #fff; padding: 0; }
      .toolbar { display: none; }
      .page { width: 210mm; min-height: 297mm; box-shadow: none; }
      .invoice-main { height: 192mm; min-height: 192mm; }
      .qr-slip { height: 105mm; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button onclick="window.print()">Drucken / PDF speichern</button>
  </div>
  <article class="page">
    <main class="invoice-main">
      <section class="brand-row">
        ${settings.logoUrl ? `<img class="brand-mark" style="width:${Number(settings.logoWidthMm || 42)}mm;height:${Number(settings.logoHeightMm || 14)}mm" src="${escapeAttr(settings.logoUrl)}" alt="${escapeAttr(companyName)}" />` : '<div class="brand-mark" aria-hidden="true"></div>'}
        <div class="brand-name">${escapeHtml(companyName)}</div>
      </section>

      <section class="sender">
        ${escapeHtml(companyName)}<br>
        ${companyAddress.map(escapeHtml).join('<br>')}
      </section>

      <section class="recipient">
        ${escapeHtml(customerName)}<br>
        ${customerAddress.map(escapeHtml).join('<br>')}
      </section>

      <section class="invoice-heading">
        <h1>Rechnung Nr. ${escapeHtml(invoice.invoiceNumber)}</h1>
        <div class="invoice-date">${escapeHtml(placeAndDate)}</div>
      </section>

      <table aria-label="Rechnungspositionen">
        <thead>
          <tr>
            <th class="col-pos">Position</th>
            <th class="col-qty">Anzahl</th>
            <th>Bezeichnung</th>
            <th class="col-total">Total</th>
          </tr>
        </thead>
        <tbody>
          ${renderClassicRows(order, invoice)}
          <tr>
            <td></td><td></td><td class="total-label">Summe</td><td class="total-value">${formatMoney(subtotal, invoice.currency)}</td>
          </tr>
          ${shipping > 0 ? `<tr><td></td><td></td><td>Versand</td><td class="col-total">${formatMoney(shipping, invoice.currency)}</td></tr>` : ''}
          ${taxEnabled ? `
            <tr class="spacer-row">
              <td></td><td></td><td>MwSt.</td><td class="col-total">${taxRate ? `${taxRate}%` : 'steuerfrei'}</td>
            </tr>
            <tr>
              <td></td><td></td><td>MwSt. Betrag</td><td class="col-total">${formatMoney(taxAmount, invoice.currency)}</td>
            </tr>
          ` : ''}
          <tr>
            <td></td><td></td><td class="total-label">Rechnungstotal</td><td class="total-value">${formatMoney(total, invoice.currency)}</td>
          </tr>
        </tbody>
      </table>

      <section class="mobile-items">
        ${renderMobileRows(order, invoice)}
        <div class="mobile-item"><strong>Rechnungstotal</strong><br>${formatMoney(total, invoice.currency)}</div>
      </section>
    </main>

    ${swissQrSlip}
  </article>
</body>
</html>`
}

function renderClassicRows(order: StoredOrder | null | undefined, invoice: InvoiceRecord) {
  const items = order?.items?.length
    ? order.items.map((item) => ({ name: item.name, quantity: item.quantity, total: item.price * item.quantity, unit: 'Stk.' }))
    : invoice.items?.length
      ? invoice.items.map((item) => ({ name: item.name, quantity: item.quantity, total: item.lineTotal, unit: item.unit || 'Stk.' }))
      : [{ name: invoice.orderNumber ? `Bestellung ${invoice.orderNumber}` : `Rechnung ${invoice.invoiceNumber}`, quantity: 1, total: invoice.amount, unit: 'Stk.' }]
  return items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.quantity} ${escapeHtml(item.unit)}</td>
      <td>${escapeHtml(item.name)}</td>
      <td class="col-total">${formatMoney(item.total, invoice.currency)}</td>
    </tr>
  `).join('')
}

function renderMobileRows(order: StoredOrder | null | undefined, invoice: InvoiceRecord) {
  const items = order?.items?.length
    ? order.items.map((item) => ({ name: item.name, quantity: item.quantity, total: item.price * item.quantity, unit: 'Stk.' }))
    : invoice.items?.length
      ? invoice.items.map((item) => ({ name: item.name, quantity: item.quantity, total: item.lineTotal, unit: item.unit || 'Stk.' }))
      : [{ name: invoice.orderNumber ? `Bestellung ${invoice.orderNumber}` : `Rechnung ${invoice.invoiceNumber}`, quantity: 1, total: invoice.amount, unit: 'Stk.' }]
  return items.map((item, index) => `
    <div class="mobile-item">
      <strong>${index + 1}. ${escapeHtml(item.name)}</strong><br>
      ${item.quantity} ${escapeHtml(item.unit)} · ${formatMoney(item.total, invoice.currency)}
    </div>
  `).join('')
}

function renderSwissQrSlip(input: {
  invoice: InvoiceRecord
  order?: StoredOrder | null
  settings: InvoiceSettings
  customerName: string
  customerAddress: string[]
}) {
  const { invoice, order, settings, customerName, customerAddress } = input
  const creditor = [
    settings.accountHolder || settings.companyName || 'SwissQRBill',
    `${settings.street || 'Musterstrasse'} ${settings.houseNumber || '7'}`.trim(),
    `${settings.postalCode || '1234'} ${settings.city || 'Musterstadt'}`.trim(),
  ]
  const debtor = [customerName, ...customerAddress]
  const account = settings.referenceType === 'QRR' ? settings.qrIban : settings.iban
  const reference = normalizeReferenceForType(invoice.qrReference || settings.standardReference, invoice.orderId || order?.id || 1, settings.referenceType)
  const qrPayload = buildSwissQrBillPayload(settings, {
    orderNumber: invoice.orderNumber,
    totalAmount: invoice.amount,
    currency: invoice.currency,
    customerName,
    customerStreet: order?.billingStreet || customerAddress[0] || '',
    customerPostalCode: order?.billingPostalCode || splitCity(customerAddress[1] || '').postalCode,
    customerCity: order?.billingCity || splitCity(customerAddress[1] || '').city,
    customerCountry: order?.billingCountry || 'CH',
  }, reference)
  const displayReference = reference ? formatReference(reference) : 'Keine Referenz'
  const receiptReference = reference ? `
            <div class="qr-label">Referenz</div>
            <p class="qr-text">${escapeHtml(displayReference)}</p>
  ` : ''
  const paymentReference = reference ? `
            <div class="qr-label">Referenz</div>
            <p class="qr-text">${escapeHtml(displayReference)}</p>
  ` : ''

  return `
    <section class="qr-slip" aria-label="Swiss QR Bill">
      <div class="cut-top">✂</div>
      <div class="cut-vertical">✂</div>
      <div class="qr-grid">
        <section class="receipt">
          <h2 class="qr-title">Empfangsschein</h2>
          <div class="receipt-body">
            <div class="qr-label">Konto / Zahlbar an</div>
            <p class="qr-text">${escapeHtml(account || '-')}<br>${creditor.map(escapeHtml).join('<br>')}</p>
            ${receiptReference}
            <div class="qr-label">Zahlbar durch</div>
            <p class="qr-text">${debtor.map(escapeHtml).join('<br>')}</p>
          </div>
          <div></div>
          <div class="amount-grid">
            <div><div class="qr-label">Währung</div><p class="qr-text">${invoice.currency}</p></div>
            <div><div class="qr-label">Betrag</div><p class="qr-text">${amountOnly(invoice.amount)}</p></div>
          </div>
          <div class="acceptance">Annahmestelle</div>
        </section>

        <section class="payment-part">
          <div class="qr-left">
            <h2 class="qr-title">Zahlteil</h2>
            ${createSwissQrSvg(qrPayload)}
            <div class="amount-grid">
              <div><div class="qr-label">Währung</div><p class="qr-text">${invoice.currency}</p></div>
              <div><div class="qr-label">Betrag</div><p class="qr-text">${amountOnly(invoice.amount)}</p></div>
            </div>
          </div>
          <div class="qr-right payment-body">
            <div class="qr-label" style="margin-top:0">Konto / Zahlbar an</div>
            <p class="qr-text">${escapeHtml(account || '-')}<br>${creditor.map(escapeHtml).join('<br>')}</p>
            ${paymentReference}
            <div class="qr-label">Zahlbar durch</div>
            <p class="qr-text">${debtor.map(escapeHtml).join('<br>')}</p>
          </div>
        </section>
      </div>
    </section>
  `
}

function renderSwissQrSlipSafe(input: {
  invoice: InvoiceRecord
  order?: StoredOrder | null
  settings: InvoiceSettings
  customerName: string
  customerAddress: string[]
}) {
  try {
    return renderSwissQrSlip(input)
  } catch (error) {
    return renderSwissQrSlipError(input, error instanceof Error ? error.message : 'Swiss QR-Bill konnte nicht erstellt werden.')
  }
}

function renderSwissQrSlipError(input: {
  invoice: InvoiceRecord
  settings: InvoiceSettings
}, message: string) {
  const { invoice, settings } = input
  const account = settings.referenceType === 'QRR' ? settings.qrIban : settings.iban
  const creditor = [
    settings.accountHolder || settings.companyName || 'MK-eMotors Dornach',
    `${settings.street || 'Bruggweg'} ${settings.houseNumber || '15'}`.trim(),
    `${settings.postalCode || '4143'} ${settings.city || 'Dornach'}`.trim(),
  ]

  return `
    <section class="qr-slip" aria-label="Swiss QR Bill Fehler">
      <div class="cut-top">✂</div>
      <div class="cut-vertical">✂</div>
      <div class="qr-grid">
        <section class="receipt">
          <h2 class="qr-title">Empfangsschein</h2>
          <div>
            <div class="qr-label">Konto / Zahlbar an</div>
            <p class="qr-text">${escapeHtml(account || '-')}<br>${creditor.map(escapeHtml).join('<br>')}</p>
            <div class="qr-label">Hinweis</div>
            <p class="qr-text">${escapeHtml(message)}</p>
          </div>
          <div></div>
          <div class="amount-grid">
            <div><div class="qr-label">Währung</div><p class="qr-text">${invoice.currency}</p></div>
            <div><div class="qr-label">Betrag</div><p class="qr-text">${amountOnly(invoice.amount)}</p></div>
          </div>
          <div class="acceptance">Annahmestelle</div>
        </section>

        <section class="payment-part">
          <div>
            <h2 class="qr-title">Zahlteil</h2>
            <div style="width:46mm;height:46mm;margin-top:7mm;border:.08rem solid #111;display:grid;place-items:center;text-align:center;padding:4mm;font-size:.7rem;font-weight:900;">
              QR-Bill Einstellungen prüfen
            </div>
            <div class="amount-grid">
              <div><div class="qr-label">Währung</div><p class="qr-text">${invoice.currency}</p></div>
              <div><div class="qr-label">Betrag</div><p class="qr-text">${amountOnly(invoice.amount)}</p></div>
            </div>
          </div>
          <div>
            <div class="qr-label" style="margin-top:0">Konto / Zahlbar an</div>
            <p class="qr-text">${escapeHtml(account || '-')}<br>${creditor.map(escapeHtml).join('<br>')}</p>
            <div class="qr-label">Swiss QR-Bill Fehler</div>
            <p class="qr-text">${escapeHtml(message)}</p>
            <div class="qr-label">Korrektur</div>
            <p class="qr-text">QRR braucht eine echte QR-IBAN. Mit normaler IBAN bitte NON oder SCOR verwenden.</p>
          </div>
        </section>
      </div>
    </section>
  `
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('de-CH')
}

function amountOnly(value: number) {
  return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char] || char))
}

function splitCity(value: string) {
  const match = String(value || '').trim().match(/^(\S+)\s+(.+)$/)
  return {
    postalCode: match?.[1] || '',
    city: match?.[2] || value,
  }
}

function formatReference(value: string | null) {
  const reference = String(value || '').replace(/\s+/g, '')
  if (!reference) return ''
  if (/^[0-9]{27}$/.test(reference)) return reference.replace(/(.{5})/g, '$1 ').trim()
  return reference.replace(/(.{4})/g, '$1 ').trim()
}

function escapeAttr(value: string | number | null | undefined) {
  return escapeHtml(value).replace(/`/g, '&#096;')
}
