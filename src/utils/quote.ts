import type { Currency, Quote, QuoteStatus, ServiceItem } from '../types'

const CURRENCY_MAP: Record<Currency, string> = {
  USD: 'USD',
  PKR: 'PKR',
  EUR: 'EUR',
  GBP: 'GBP',
}

export function getCurrencySymbol(currency: Currency): string {
  const map: Record<Currency, string> = {
    USD: '$',
    PKR: '₨',
    EUR: '€',
    GBP: '£',
  }

  return map[currency]
}

export function formatCurrency(value: number, currency: Currency = 'USD'): string {
  const safeValue = Number.isFinite(value) ? value : 0
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: CURRENCY_MAP[currency],
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formatter.format(safeValue)
}

export function sanitizeNumber(value: number | string, fallback = 0): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return parsed
}

export function clampPositive(value: number): number {
  return Math.max(0, Number(value) || 0)
}

export function calculateServiceTotal(quantity: number, unitPrice: number): number {
  const safeQuantity = clampPositive(quantity)
  const safePrice = clampPositive(unitPrice)
  return Number((safeQuantity * safePrice).toFixed(2))
}

export function calculateQuoteTotals(
  services: ServiceItem[],
  discountPercentage: number,
  taxPercentage: number,
) {
  const itemTotals = services.map((item) => {
    const safeQuantity = clampPositive(item.quantity)
    const safePrice = clampPositive(item.unitPrice)
    const total = Number((safeQuantity * safePrice).toFixed(2))
    return {
      ...item,
      quantity: safeQuantity,
      unitPrice: safePrice,
      total,
    }
  })

  const subtotal = Number(
    itemTotals.reduce((sum, item) => sum + item.total, 0).toFixed(2),
  )
  const discountAmount = Number(
    ((subtotal * Math.max(0, sanitizeNumber(discountPercentage, 0))) / 100).toFixed(2),
  )
  const taxableAmount = Number((subtotal - discountAmount).toFixed(2))
  const taxAmount = Number(
    ((taxableAmount * Math.max(0, sanitizeNumber(taxPercentage, 0))) / 100).toFixed(2),
  )
  const total = Number((taxableAmount + taxAmount).toFixed(2))

  return {
    subtotal,
    discount: discountAmount,
    tax: taxAmount,
    total,
    services: itemTotals,
  }
}

export function generateQuoteNumber(existingCount: number): string {
  const year = new Date().getFullYear()
  return `QF-${year}-${String(existingCount + 1).padStart(3, '0')}`
}

export function createEmptyService(): ServiceItem {
  return {
    id: `svc-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: 'New Service',
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0,
  }
}

export function createBlankQuote(): Quote {
  const now = new Date().toISOString()
  const quoteId = `quote-${Date.now()}`

  return {
    id: quoteId,
    quoteNumber: 'QF-2026-001',
    client: {
      id: `client-${Date.now()}`,
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
    },
    projectTitle: '',
    projectDescription: '',
    services: [createEmptyService()],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    currency: 'USD',
    timeline: {
      startDate: '',
      deliveryWindow: '',
      notes: '',
    },
    terms: 'Payment is due within 14 days. Standard revision policy applies for the agreed scope.',
    status: 'Draft',
    createdAt: now,
    updatedAt: now,
  }
}

export function patchQuoteTotals(quote: Quote): Quote {
  const totals = calculateQuoteTotals(quote.services, quote.discount, quote.tax)

  return {
    ...quote,
    services: totals.services,
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    total: totals.total,
    updatedAt: new Date().toISOString(),
  }
}

export function isValidEmail(email: string): boolean {
  if (!email) {
    return true
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function normalizeStatus(status: string): QuoteStatus {
  if (status === 'Sent' || status === 'Accepted' || status === 'Rejected') {
    return status
  }

  return 'Draft'
}
