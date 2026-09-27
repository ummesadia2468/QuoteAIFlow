export type Currency = 'USD' | 'PKR' | 'EUR' | 'GBP'

export type QuoteStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected'

export interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string
  address: string
}

export interface ServiceItem {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface QuoteTimeline {
  startDate: string
  deliveryWindow: string
  notes: string
}

export interface Quote {
  id: string
  quoteNumber: string
  client: Client
  projectTitle: string
  projectDescription: string
  services: ServiceItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  currency: Currency
  timeline: QuoteTimeline
  terms: string
  status: QuoteStatus
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  businessName: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  website: string
  defaultCurrency: Currency
  defaultTax: number
  defaultTerms: string
}

export interface RequirementSuggestion {
  name: string
  quantity: number
  description: string
}
