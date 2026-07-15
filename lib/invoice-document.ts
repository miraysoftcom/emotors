import { formatMoney } from '@/lib/money'
import { createSwissQrSvg } from '@/lib/qr-code'
import type { InvoiceRecord, InvoiceSettings } from '@/lib/invoice-store'
import type { StoredOrder } from '@/lib/orders-store'

export function renderInvoiceHtmlDocument(input: {
  invoice: InvoiceRecord
  order?: StoredOrder | null
  settings: InvoiceSettings
}) {
  const { invoice, order, settings } = input
  const customerName = order ? `${order.firstName} ${order.lastName}`.trim() : 'Peter Muster'
  const customerAddress = [
    order?.billingStreet || 'Musterstrasse 1',
    `${order?.billingPostalCode || '1234'} ${order?.billingCity || 'Musterstadt'}`.trim(),
  ]
  const companyName = settings.companyName || 'SwissQRBill'
  const companyAddress = [
    `${settings.street || 'Musterstrasse'} ${settings.houseNumber || '7'}`.trim(),
    `${settings.postalCode || '1234'} ${settings.city || 'Musterstadt'}`.trim(),
  ]
  const placeAndDate = `${settings.city || 'Musterstadt'} ${formatDate(invoice.createdAt)}`
  const subtotal = order?.subtotal ?? invoice.amount
  const shipping = order?.shippingCost ?? 0
  const taxLine = invoice.taxSnapshot?.lines?.[0]
  const taxRate = taxLine?.percentage ?? 0
  const taxAmount = invoice.taxSnapshot?.tax ?? order?.tax ?? 0
  const taxEnabled = Boolean(invoice.taxSnapshot?.enabled)
  const total = invoice.amount

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
      width: min(100%, 210mm);
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
      height: 105mm;
      border-top: .04rem dotted #000;
      position: relative;
      background: #fff;
      color: #000;
      page-break-inside: avoid;
    }
    .cut-top {
      position: absolute;
      inset-inline: 0;
      top: -.64rem;
      text-align: center;
      font-size: .86rem;
      line-height: 1;
    }
    .cut-vertical {
      position: absolute;
      left: 62mm;
      top: 8mm;
      transform: translateX(-50%);
      font-size: .86rem;
      line-height: 1;
      background: #fff;
    }
    .qr-grid {
      height: 100%;
      display: grid;
      grid-template-columns: 62mm 1fr;
    }
    .receipt {
      border-right: .04rem dotted #000;
      padding: 4.5mm 5mm;
      display: grid;
      grid-template-rows: auto auto auto 1fr auto;
    }
    .payment-part {
      padding: 4.5mm 5mm;
      display: grid;
      grid-template-columns: 52mm 1fr;
      gap: 8mm;
      min-width: 0;
    }
    .qr-title {
      margin: 0 0 4mm;
      font-size: 1rem;
      font-weight: 950;
    }
    .qr-label {
      margin-top: 4mm;
      margin-bottom: 1mm;
      font-size: .52rem;
      font-weight: 950;
    }
    .qr-text {
      margin: 0;
      font-size: .72rem;
      font-weight: 700;
      line-height: 1.12;
    }
    .payment-part .qr-text {
      font-size: .95rem;
      font-weight: 500;
      line-height: 1.15;
      overflow-wrap: anywhere;
    }
    .amount-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4mm;
      align-self: end;
      margin-top: 9mm;
    }
    .amount-grid .qr-text {
      font-size: .72rem;
    }
    .payment-part .amount-grid .qr-text {
      font-size: .95rem;
    }
    .acceptance {
      align-self: end;
      text-align: right;
      font-size: .55rem;
      font-weight: 950;
    }
    .qr-code {
      width: 48mm;
      aspect-ratio: 1;
      margin-top: 7mm;
      display: block;
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

    ${renderSwissQrSlip({ invoice, order, settings, customerName, customerAddress })}
  </article>
</body>
</html>`
}

function renderClassicRows(order: StoredOrder | null | undefined, invoice: InvoiceRecord) {
  const items = order?.items?.length ? order.items : [{ name: `Bestellung ${invoice.orderNumber}`, quantity: 1, price: invoice.amount }]
  return items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.quantity} Stk.</td>
      <td>${escapeHtml(item.name)}</td>
      <td class="col-total">${formatMoney(item.price * item.quantity, invoice.currency)}</td>
    </tr>
  `).join('')
}

function renderMobileRows(order: StoredOrder | null | undefined, invoice: InvoiceRecord) {
  const items = order?.items?.length ? order.items : [{ name: `Bestellung ${invoice.orderNumber}`, quantity: 1, price: invoice.amount }]
  return items.map((item, index) => `
    <div class="mobile-item">
      <strong>${index + 1}. ${escapeHtml(item.name)}</strong><br>
      ${item.quantity} Stk. · ${formatMoney(item.price * item.quantity, invoice.currency)}
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
  const { invoice, settings, customerName, customerAddress } = input
  const creditor = [
    settings.accountHolder || settings.companyName || 'SwissQRBill',
    `${settings.street || 'Musterstrasse'} ${settings.houseNumber || '7'}`.trim(),
    `${settings.postalCode || '1234'} ${settings.city || 'Musterstadt'}`.trim(),
  ]
  const debtor = [customerName, ...customerAddress]
  const account = settings.referenceType === 'QRR' ? settings.qrIban : settings.iban
  const reference = invoice.qrReference || settings.standardReference || invoice.orderNumber
  const qrPayload = invoice.swissQrPayload || buildSwissQrPayloadForDocument({
    invoice,
    settings,
    account,
    reference,
    creditor,
    debtor,
  })

  return `
    <section class="qr-slip" aria-label="Swiss QR Bill">
      <div class="cut-top">✂</div>
      <div class="cut-vertical">✂</div>
      <div class="qr-grid">
        <section class="receipt">
          <h2 class="qr-title">Empfangsschein</h2>
          <div>
            <div class="qr-label">Konto / Zahlbar an</div>
            <p class="qr-text">${escapeHtml(account || '-')}<br>${creditor.map(escapeHtml).join('<br>')}</p>
            <div class="qr-label">Referenz</div>
            <p class="qr-text">${escapeHtml(reference)}</p>
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
          <div>
            <h2 class="qr-title">Zahlteil</h2>
            ${createSwissQrSvg(qrPayload)}
            <div class="amount-grid">
              <div><div class="qr-label">Währung</div><p class="qr-text">${invoice.currency}</p></div>
              <div><div class="qr-label">Betrag</div><p class="qr-text">${amountOnly(invoice.amount)}</p></div>
            </div>
          </div>
          <div>
            <div class="qr-label" style="margin-top:0">Konto / Zahlbar an</div>
            <p class="qr-text">${escapeHtml(account || '-')}<br>${creditor.map(escapeHtml).join('<br>')}</p>
            <div class="qr-label">Referenz</div>
            <p class="qr-text">${escapeHtml(reference)}</p>
            <div class="qr-label">Zahlbar durch</div>
            <p class="qr-text">${debtor.map(escapeHtml).join('<br>')}</p>
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

function buildSwissQrPayloadForDocument(input: {
  invoice: InvoiceRecord
  settings: InvoiceSettings
  account: string
  reference: string
  creditor: string[]
  debtor: string[]
}) {
  const { invoice, settings, account, reference, creditor, debtor } = input
  const creditorStreet = splitStreet(creditor[1])
  const debtorStreet = splitStreet(debtor[1] || '')
  const creditorCity = splitCity(creditor[2])
  const debtorCity = splitCity(debtor[2] || '')

  return [
    'SPC',
    settings.swissQrVersion || '0200',
    '1',
    normalizeIbanForDocument(account),
    'K',
    creditor[0] || '',
    creditorStreet.street,
    creditorStreet.houseNumber,
    creditorCity.postalCode,
    creditorCity.city,
    settings.country || 'CH',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    amountOnly(invoice.amount),
    invoice.currency || settings.currency || 'CHF',
    'K',
    debtor[0] || '',
    debtorStreet.street,
    debtorStreet.houseNumber,
    debtorCity.postalCode,
    debtorCity.city,
    'CH',
    settings.referenceType || 'QRR',
    reference || '',
    `Bestellung ${invoice.orderNumber}`,
    'EPD',
  ].join('\n')
}

function normalizeIbanForDocument(value: string) {
  return String(value || '').replace(/\s+/g, '').toUpperCase()
}

function splitCity(value: string) {
  const match = String(value || '').trim().match(/^(\S+)\s+(.+)$/)
  return {
    postalCode: match?.[1] || '',
    city: match?.[2] || value,
  }
}

function splitStreet(value: string) {
  const match = String(value || '').trim().match(/^(.+?)\s+([\w./-]+)$/)
  return {
    street: match?.[1] || value,
    houseNumber: match?.[2] || '',
  }
}

function escapeAttr(value: string | number | null | undefined) {
  return escapeHtml(value).replace(/`/g, '&#096;')
}
