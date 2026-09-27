import type { AppSettings, Client, Quote } from '../types'

const STORAGE_KEYS = {
  quotes: 'quoteaiflow:quotes',
  clients: 'quoteaiflow:clients',
  settings: 'quoteaiflow:settings',
}

export const defaultSettings: AppSettings = {
  businessName: 'QuoteFlow AI',
  businessEmail: 'hello@quoteflow.ai',
  businessPhone: '+1 (415) 555-0194',
  businessAddress: '125 Market Street, Suite 300, San Francisco, CA',
  website: 'https://quoteflow.ai',
  defaultCurrency: 'USD',
  defaultTax: 8.5,
  defaultTerms:
    'Payment is due within 14 days of invoice receipt. Work may be delivered in agreed milestones. All content is provided as a custom build for the client described above.',
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getStoredQuotes(): Quote[] {
  return readStorage<Quote[]>(STORAGE_KEYS.quotes, [])
}

export function saveQuotes(quotes: Quote[]) {
  writeStorage(STORAGE_KEYS.quotes, quotes)
}

export function getStoredClients(): Client[] {
  return readStorage<Client[]>(STORAGE_KEYS.clients, [])
}

export function saveClients(clients: Client[]) {
  writeStorage(STORAGE_KEYS.clients, clients)
}

export function getStoredSettings(): AppSettings {
  return readStorage<AppSettings>(STORAGE_KEYS.settings, defaultSettings)
}

export function saveSettings(settings: AppSettings) {
  writeStorage(STORAGE_KEYS.settings, settings)
}

export function clearAllData() {
  localStorage.removeItem(STORAGE_KEYS.quotes)
  localStorage.removeItem(STORAGE_KEYS.clients)
  localStorage.removeItem(STORAGE_KEYS.settings)
}
