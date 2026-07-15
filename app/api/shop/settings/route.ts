import { NextResponse } from 'next/server'
import { getShopSettings } from '@/lib/shop-settings-store'
import { getTaxSettings } from '@/lib/tax-settings-store'

export async function GET() {
  const settings = getShopSettings()
  const tax = getTaxSettings()

  return NextResponse.json({
    general: settings.general,
    footer: settings.footer,
    shop: settings.shop,
    tracking: settings.tracking,
    ai: {
      enabled: settings.ai.enabled,
      title: settings.ai.title,
      welcomeMessage: settings.ai.welcomeMessage,
      suggestions: settings.ai.suggestions,
      configured: Boolean(settings.ai.apiKey),
    },
    tax: {
      enabled: tax.enabled,
      priceDisplay: tax.priceDisplay,
      uidNumber: tax.uidNumber,
      exemptionText: tax.exemptionText,
      rates: tax.rates,
      shippingTaxable: tax.shippingTaxable,
      shippingRateId: tax.shippingRateId,
    },
    payments: {
      mode: settings.payments.mode,
      methods: settings.payments.methods
        .filter((method) => method.enabled)
        .sort((a, b) => a.sortOrder - b.sortOrder),
      sumup: {
        merchantCode: settings.payments.sumup.merchantCode,
        checkoutSuccessUrl: settings.payments.sumup.checkoutSuccessUrl,
        instructions: settings.payments.sumup.instructions,
        configured: Boolean(settings.payments.sumup.apiKey && settings.payments.sumup.merchantCode),
      },
      stripe: {
        publishableKey: settings.payments.stripe.publishableKey,
        successUrl: settings.payments.stripe.successUrl,
        cancelUrl: settings.payments.stripe.cancelUrl,
        instructions: settings.payments.stripe.instructions,
        configured: Boolean(settings.payments.stripe.publishableKey && settings.payments.stripe.secretKey),
      },
      paypal: {
        clientId: settings.payments.paypal.clientId,
        merchantEmail: settings.payments.paypal.merchantEmail,
        instructions: settings.payments.paypal.instructions,
        configured: Boolean(settings.payments.paypal.clientId && settings.payments.paypal.clientSecret),
      },
      twint: {
        companyName: settings.payments.twint.companyName,
        phone: settings.payments.twint.phone,
        storeId: settings.payments.twint.storeId,
        qrImageUrl: settings.payments.twint.qrImageUrl,
        instructions: settings.payments.twint.instructions,
        configured: Boolean(settings.payments.twint.apiKey || settings.payments.twint.qrImageUrl || settings.payments.twint.phone),
      },
      bank: settings.payments.bank,
      invoice: settings.payments.invoice,
    },
  })
}
