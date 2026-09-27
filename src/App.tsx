import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Briefcase,
  Check,
  DollarSign,
  FileText,
  LayoutDashboard,
  Menu,
  Pencil,
  Plus,
  Printer,
  Search,
  Settings,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  calculateQuoteTotals,
  clampPositive,
  createBlankQuote,
  createEmptyService,
  formatCurrency,
  generateQuoteNumber,
  isValidEmail,
  normalizeStatus,
} from './utils/quote'
import {
  clearAllData,
  getStoredClients,
  getStoredQuotes,
  getStoredSettings,
  saveClients,
  saveQuotes,
  saveSettings,
} from './services/storage'
import { analyzeRequirements, convertSuggestionsToServices } from './services/requirementAnalyzer'
import type { AppSettings, Client, Quote, QuoteStatus, ServiceItem } from './types'

const statusOptions: QuoteStatus[] = ['Draft', 'Sent', 'Accepted', 'Rejected']
const currencyOptions = ['USD', 'PKR', 'EUR', 'GBP'] as const

function App() {
  const [quotes, setQuotes] = useState<Quote[]>(() => getStoredQuotes())
  const [clients, setClients] = useState<Client[]>(() => getStoredClients())
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings())

  useEffect(() => {
    saveQuotes(quotes)
  }, [quotes])

  useEffect(() => {
    saveClients(clients)
  }, [clients])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const createDemoData = () => {
    const demoQuotes: Quote[] = [
      {
        id: 'demo-qf-1',
        quoteNumber: 'QF-2026-001',
        client: {
          id: 'demo-client-1',
          name: 'Urban Threads',
          company: 'Urban Threads',
          email: 'hello@urbanthreads.co',
          phone: '+1 (415) 555-0123',
          address: '890 Fashion Avenue, Los Angeles, CA',
        },
        projectTitle: 'E-commerce Website',
        projectDescription: 'Modern storefront and brand design for a premium clothing line.',
        services: [
          { id: 's1', name: 'Website Development', description: 'Custom storefront design and build', quantity: 1, unitPrice: 1800, total: 1800 },
          { id: 's2', name: 'Product Catalog', description: 'Catalog and product detail UX', quantity: 1, unitPrice: 1200, total: 1200 },
        ],
        subtotal: 3000,
        discount: 150,
        tax: 228,
        total: 3078,
        currency: 'USD',
        timeline: {
          startDate: '2026-09-28',
          deliveryWindow: '4 weeks',
          notes: 'Includes brand direction and basic SEO.',
        },
        terms: 'Payment is due within 14 days of invoice receipt.',
        status: 'Sent',
        createdAt: '2026-09-01T10:00:00.000Z',
        updatedAt: '2026-09-15T10:00:00.000Z',
      },
      {
        id: 'demo-qf-2',
        quoteNumber: 'QF-2026-002',
        client: {
          id: 'demo-client-2',
          name: 'Nova Digital',
          company: 'Nova Digital',
          email: 'team@novadigital.io',
          phone: '+44 203 555 0148',
          address: '14 Bloomsbury Way, London, UK',
        },
        projectTitle: 'Brand Refresh',
        projectDescription: 'Marketing site and campaign pages for a B2B SaaS client.',
        services: [
          { id: 's3', name: 'Landing Page Design', description: 'Conversion-optimized marketing page', quantity: 2, unitPrice: 950, total: 1900 },
          { id: 's4', name: 'Basic SEO', description: 'Technical SEO setup and optimization', quantity: 1, unitPrice: 600, total: 600 },
        ],
        subtotal: 2500,
        discount: 0,
        tax: 260,
        total: 2760,
        currency: 'USD',
        timeline: { startDate: '2026-10-02', deliveryWindow: '3 weeks', notes: 'Campaign launch support included.' },
        terms: 'Includes one revision round before launch.',
        status: 'Draft',
        createdAt: '2026-08-30T09:00:00.000Z',
        updatedAt: '2026-09-18T09:00:00.000Z',
      },
      {
        id: 'demo-qf-3',
        quoteNumber: 'QF-2026-003',
        client: {
          id: 'demo-client-3',
          name: 'GreenLeaf Café',
          company: 'GreenLeaf Café',
          email: 'hello@greenleafcafe.co',
          phone: '+92 21 555 0230',
          address: '19 Gulshan Avenue, Karachi, PK',
        },
        projectTitle: 'Restaurant Website',
        projectDescription: 'A warm web presence for a neighborhood cafe and online order flow.',
        services: [
          { id: 's5', name: 'Website Development', description: 'Responsive café website', quantity: 1, unitPrice: 1450, total: 1450 },
          { id: 's6', name: 'WhatsApp Integration', description: 'Lead capture and order chat link', quantity: 1, unitPrice: 450, total: 450 },
        ],
        subtotal: 1900,
        discount: 100,
        tax: 171,
        total: 1971,
        currency: 'USD',
        timeline: { startDate: '2026-09-20', deliveryWindow: '2 weeks', notes: 'Includes hosting handoff guidance.' },
        terms: 'Project launch is subject to final copy approval.',
        status: 'Accepted',
        createdAt: '2026-09-12T12:00:00.000Z',
        updatedAt: '2026-09-22T12:00:00.000Z',
      },
    ]

    return demoQuotes
  }

  const addDemoData = () => {
    const next = quotes.length > 0 ? quotes : createDemoData()
    setQuotes(next)
    setClients(next.map((quote) => quote.client))
  }

  const resetDemoData = () => {
    setQuotes([])
    setClients([])
    clearAllData()
  }

  const updateQuote = (nextQuote: Quote) => {
    const totals = calculateQuoteTotals(nextQuote.services, nextQuote.discount, nextQuote.tax)
    const normalizedQuote: Quote = {
      ...nextQuote,
      quoteNumber: nextQuote.quoteNumber || generateQuoteNumber(quotes.length),
      services: totals.services,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      status: normalizeStatus(nextQuote.status),
      updatedAt: new Date().toISOString(),
    }

    setQuotes((prev) => {
      const existing = prev.find((quote) => quote.id === normalizedQuote.id)
      if (existing) {
        return prev.map((quote) => (quote.id === normalizedQuote.id ? normalizedQuote : quote))
      }

      return [normalizedQuote, ...prev]
    })

    setClients((prev) => {
      const existing = prev.some((client) => client.id === normalizedQuote.client.id)
      if (existing) {
        return prev.map((client) =>
          client.id === normalizedQuote.client.id ? normalizedQuote.client : client,
        )
      }

      return [normalizedQuote.client, ...prev]
    })
  }

  const handleDeleteQuote = (id: string) => {
    const target = quotes.find((quote) => quote.id === id)
    if (!target) {
      return
    }

    const confirmed = window.confirm(`Delete quote ${target.quoteNumber}? This action cannot be undone.`)
    if (!confirmed) {
      return
    }

    setQuotes((prev) => prev.filter((quote) => quote.id !== id))
  }

  const handleDuplicateQuote = (quote: Quote) => {
    const duplicate: Quote = {
      ...quote,
      id: `quote-${Date.now()}`,
      quoteNumber: generateQuoteNumber(quotes.length + 1),
      client: { ...quote.client, id: `client-${Date.now()}` },
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setQuotes((prev) => [duplicate, ...prev])
    setClients((prev) => [duplicate.client, ...prev])
  }

  const recentQuotes = useMemo(
    () => [...quotes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4),
    [quotes],
  )

  const totalQuotedValue = quotes.reduce((sum, quote) => sum + quote.total, 0)
  const draftCount = quotes.filter((quote) => quote.status === 'Draft').length
  const sentCount = quotes.filter((quote) => quote.status === 'Sent').length
  const acceptedCount = quotes.filter((quote) => quote.status === 'Accepted').length

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/dashboard"
        element={
          <AppShell
            settings={settings}
            quotes={quotes.length}
            onAddDemoData={addDemoData}
            onResetDemoData={resetDemoData}
          >
            <DashboardPage
              quotes={quotes}
              draftCount={draftCount}
              sentCount={sentCount}
              acceptedCount={acceptedCount}
              totalQuotedValue={totalQuotedValue}
              recentQuotes={recentQuotes}
            />
          </AppShell>
        }
      />
      <Route
        path="/quotes"
        element={
          <AppShell settings={settings} quotes={quotes.length} onAddDemoData={addDemoData} onResetDemoData={resetDemoData}>
            <QuotesPage
              quotes={quotes}
              onDelete={handleDeleteQuote}
              onDuplicate={handleDuplicateQuote}
            />
          </AppShell>
        }
      />
      <Route
        path="/quotes/new"
        element={
          <AppShell settings={settings} quotes={quotes.length} onAddDemoData={addDemoData} onResetDemoData={resetDemoData}>
            <QuoteEditorPage
              quote={createBlankQuote()}
              settings={settings}
              allQuotes={quotes}
              onSave={updateQuote}
            />
          </AppShell>
        }
      />
      <Route
        path="/quotes/:id"
        element={
          <AppShell settings={settings} quotes={quotes.length} onAddDemoData={addDemoData} onResetDemoData={resetDemoData}>
            <QuoteDetailPage
              quotes={quotes}
              settings={settings}
              onDelete={handleDeleteQuote}
              onDuplicate={handleDuplicateQuote}
              onSave={updateQuote}
            />
          </AppShell>
        }
      />
      <Route
        path="/settings"
        element={
          <AppShell settings={settings} quotes={quotes.length} onAddDemoData={addDemoData} onResetDemoData={resetDemoData}>
            <SettingsPage settings={settings} onChange={setSettings} />
          </AppShell>
        }
      />
    </Routes>
  )
}

function AppShell({
  children,
  settings,
  quotes,
  onAddDemoData,
  onResetDemoData,
}: {
  children: React.ReactNode
  settings: AppSettings
  quotes: number
  onAddDemoData: () => void
  onResetDemoData: () => void
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="no-print flex min-h-screen">
        <aside className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-slate-950 p-5 text-slate-100 transition-transform duration-200 md:translate-x-0`}>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-sky-300">QuoteFlow AI</div>
              <div className="mt-2 text-xl font-semibold">Commercial Suite</div>
            </div>
            <div className="rounded-full bg-sky-500/10 px-2 py-1 text-[10px] font-medium text-sky-200">{quotes} quotes</div>
            <button className="md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close sidebar">
              <X size={18} />
            </button>
          </div>

          <nav className="space-y-2">
            {[
              { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
              { label: 'Quotes', to: '/quotes', icon: FileText },
              { label: 'Clients', to: '/quotes', icon: UserRound },
              { label: 'Settings', to: '/settings', icon: Settings },
            ].map(({ label, to, icon: Icon }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-sky-500/15 text-white ring-1 ring-sky-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Business</div>
            <div className="mt-3 text-base font-semibold text-white">{settings.businessName || 'QuoteFlow AI'}</div>
            <div className="mt-2 text-sm text-slate-300">{settings.businessEmail || 'hello@quoteflow.ai'}</div>
          </div>

          <div className="mt-8 flex gap-2">
            <button
              className="flex-1 rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-white hover:bg-sky-400"
              onClick={() => navigate('/quotes/new')}
            >
              <span className="inline-flex items-center gap-2"><Plus size={16} /> Create Quote</span>
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col md:ml-72">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button className="md:hidden" onClick={() => setMobileOpen((value) => !value)} aria-label="Open menu">
                  <Menu size={18} />
                </button>
                <div className="text-lg font-semibold text-slate-900">QuoteFlow AI</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  onClick={onAddDemoData}
                >
                  Load Demo
                </button>
                <button
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  onClick={onResetDemoData}
                >
                  Reset
                </button>
                <button
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  onClick={() => navigate('/quotes/new')}
                >
                  Create Quote
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2 text-sm font-semibold text-white">QF</div>
            <div className="text-lg font-semibold">QuoteFlow AI</div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#problem">Problem</a>
            <a href="#process">How it works</a>
            <a href="#features">Features</a>
            <a href="#demo">Demo</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" to="/dashboard">
              Dashboard
            </Link>
            <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800" onClick={() => navigate('/quotes/new')}>
              Create Your First Quote
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-sky-700">
              <Sparkles size={14} /> Built for service businesses
            </div>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Create Professional Quotes in Minutes
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              Turn messy client requirements into polished, ready-to-send quotations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800" onClick={() => navigate('/quotes/new')}>
                Create Your First Quote <ArrowRight size={16} />
              </button>
              <Link className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100" to="/dashboard">
                View Demo
              </Link>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {[
                ['250+', 'Quotes'],
                ['48h', 'Faster'],
                ['4.9/5', 'Client rating'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-2xl font-bold text-slate-900">{value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div id="demo" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Quote</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">QF-2026-001</div>
              </div>
              <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Draft</div>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Client</div>
                <div className="mt-1 font-medium text-slate-900">Urban Threads</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Project</div>
                <div className="mt-1 font-medium text-slate-900">E-commerce Website</div>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span>Website Development</span>
                  <span>$1,800</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span>Product Catalog</span>
                  <span>$1,200</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span>Basic SEO</span>
                  <span>$600</span>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-900 p-4 text-white">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Grand Total</span>
                  <span>$3,078</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="problem" className="border-t border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-sky-700">Problem</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">Requirements are messy. Quotes should not be.</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                'Client messages are vague and hard to turn into services.',
                'Manual quoting takes too much time across spreadsheets and docs.',
                'Most businesses need a better path from brief to professional proposal.',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-sky-700">How it works</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">From requirement to quotation in 4 steps</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-4">
              {[
                ['1. Capture', 'Collect the client brief and project context.'],
                ['2. Analyze', 'Convert requirements into service suggestions.'],
                ['3. Price', 'Edit quantities, discounts, taxes, and totals.'],
                ['4. Send', 'Preview, print, and save a polished quote.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="text-lg font-semibold text-slate-900">{title}</div>
                  <div className="mt-3 text-sm text-slate-600">{text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-sky-700">Features</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">Everything you need to quote confidently</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                ['Requirement analysis', 'Turn plain-language briefs into editable service suggestions.'],
                ['Pricing engine', 'Control quantities, discounts, taxes, and totals without guesswork.'],
                ['Quote management', 'Track status, search, filter, duplicate, and print in one place.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-slate-200 p-6">
                  <div className="mb-4 inline-flex rounded-xl bg-sky-50 p-2 text-sky-700"><Briefcase size={18} /></div>
                  <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
                  <p className="mt-3 text-sm text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 p-10 text-center text-white">
            <h2 className="text-3xl font-bold">Need a clean quote workflow without the overhead?</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">Launch a simple, professional quotation system that keeps your client work clear, organized, and easy to send.</p>
            <button className="mt-8 rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100" onClick={() => navigate('/quotes/new')}>
              Create Your First Quote
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-600 sm:flex-row sm:px-6 lg:px-8">
          <div>© 2026 QuoteFlow AI</div>
          <div>Professional quotes for modern service businesses.</div>
        </div>
      </footer>
    </div>
  )
}

function DashboardPage({
  quotes,
  draftCount,
  sentCount,
  acceptedCount,
  totalQuotedValue,
  recentQuotes,
}: {
  quotes: Quote[]
  draftCount: number
  sentCount: number
  acceptedCount: number
  totalQuotedValue: number
  recentQuotes: Quote[]
}) {
  const navigate = useNavigate()

  const stats = [
    { label: 'Total Quotes', value: String(quotes.length), icon: FileText },
    { label: 'Draft', value: String(draftCount), icon: Pencil },
    { label: 'Sent', value: String(sentCount), icon: ArrowRight },
    { label: 'Accepted', value: String(acceptedCount), icon: Check },
    { label: 'Total Quoted Value', value: formatCurrency(totalQuotedValue, 'USD'), icon: DollarSign },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">Overview</div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Dashboard</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800" onClick={() => navigate('/quotes/new')}>
          <Plus size={16} /> Create Quote
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">{label}</div>
              <div className="rounded-xl bg-sky-50 p-2 text-sky-700"><Icon size={16} /></div>
            </div>
            <div className="mt-5 text-2xl font-bold text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Recent quotes</h2>
          <Link to="/quotes" className="text-sm font-medium text-sky-700">View all</Link>
        </div>

        {recentQuotes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <div className="text-lg font-semibold text-slate-800">No quotes yet.</div>
            <div className="mt-2 text-sm text-slate-500">Create your first professional quotation to get started.</div>
            <button className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={() => navigate('/quotes/new')}>
              Create Quote
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentQuotes.map((quote) => (
              <button
                key={quote.id}
                type="button"
                onClick={() => navigate(`/quotes/${quote.id}`)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-sky-200 hover:bg-sky-50/40"
              >
                <div>
                  <div className="font-medium text-slate-900">{quote.quoteNumber}</div>
                  <div className="mt-1 text-sm text-slate-500">{quote.client.name || 'Client'} · {quote.projectTitle || 'Untitled project'}</div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>{quote.status}</span>
                  <span>{formatCurrency(quote.total, quote.currency)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function QuotesPage({ quotes, onDelete, onDuplicate }: { quotes: Quote[]; onDelete: (id: string) => void; onDuplicate: (quote: Quote) => void }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | QuoteStatus>('All')
  const navigate = useNavigate()

  const filteredQuotes = quotes.filter((quote) => {
    const matchesStatus = statusFilter === 'All' || quote.status === statusFilter
    const haystack = `${quote.quoteNumber} ${quote.client.name} ${quote.client.company} ${quote.projectTitle}`.toLowerCase()
    const matchesSearch = haystack.includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">Manage</div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Quotes</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800" onClick={() => navigate('/quotes/new')}>
          <Plus size={16} /> New Quote
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search quote number, client, company, project"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition focus:border-sky-300 focus:bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'All' | QuoteStatus)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-300 focus:bg-white"
          >
            <option value="All">All</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredQuotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="text-lg font-semibold text-slate-800">No quotes yet.</div>
          <div className="mt-2 text-sm text-slate-500">Create your first professional quotation to get started.</div>
          <button className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={() => navigate('/quotes/new')}>
            Create Quote
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Quote</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="align-top">
                    <td className="px-4 py-3 font-medium text-slate-900">{quote.quoteNumber}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{quote.client.name || 'Unnamed client'}</div>
                      <div className="text-xs text-slate-400">{quote.client.company || 'No company'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{quote.projectTitle || 'Untitled project'}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(quote.total, quote.currency)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[quote.status]}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{new Date(quote.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100" onClick={() => navigate(`/quotes/${quote.id}`)}>
                          View
                        </button>
                        <button className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100" onClick={() => navigate(`/quotes/${quote.id}`)}>
                          Edit
                        </button>
                        <button className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100" onClick={() => onDuplicate(quote)}>
                          Duplicate
                        </button>
                        <button className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50" onClick={() => onDelete(quote.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function QuoteEditorPage({
  quote,
  settings,
  allQuotes,
  onSave,
}: {
  quote: Quote
  settings: AppSettings
  allQuotes: Quote[]
  onSave: (quote: Quote) => void
}) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<Quote>(quote)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysisValue, setAnalysisValue] = useState(quote.projectDescription || '')

  useEffect(() => {
    setDraft(quote)
    setAnalysisValue(quote.projectDescription || '')
  }, [quote])

  const steps = ['Client', 'Requirements', 'Services', 'Timeline & Terms', 'Review']

  const updateQuoteField = <K extends keyof Quote>(key: K, value: Quote[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const updateClientField = (field: keyof Quote['client'], value: string) => {
    setDraft((current) => ({
      ...current,
      client: { ...current.client, [field]: value },
    }))
  }

  const updateService = (serviceId: string, field: keyof ServiceItem, value: string | number) => {
    setDraft((current) => ({
      ...current,
      services: current.services.map((service) => {
        if (service.id !== serviceId) {
          return service
        }

        const next = { ...service, [field]: field === 'name' || field === 'description' ? value : Number(value) }
        const quantity = clampPositive(Number(next.quantity))
        const unitPrice = clampPositive(Number(next.unitPrice))
        next.quantity = quantity
        next.unitPrice = unitPrice
        next.total = Number((quantity * unitPrice).toFixed(2))
        return next
      }),
    }))
  }

  const totals = useMemo(
    () => calculateQuoteTotals(draft.services, draft.discount, draft.tax),
    [draft.services, draft.discount, draft.tax],
  )

  const handleAnalyze = () => {
    setLoading(true)
    setError('')

    const result = analyzeRequirements(analysisValue)

    setTimeout(() => {
      const services = convertSuggestionsToServices(result.suggestions)
      setDraft((current) => ({ ...current, services: services.length > 0 ? services : current.services }))
      setLoading(false)
      if (result.warnings.length > 0) {
        setError(result.warnings[0])
      }
    }, 500)
  }

  const addService = () => {
    setDraft((current) => ({ ...current, services: [...current.services, createEmptyService()] }))
  }

  const removeService = (id: string) => {
    setDraft((current) => ({
      ...current,
      services: current.services.filter((service) => service.id !== id),
    }))
  }

  const validateStep = () => {
    if (step === 0 && !draft.client.name.trim()) {
      setError('Please enter a client name.')
      return false
    }

    if (step === 0 && draft.client.email && !isValidEmail(draft.client.email)) {
      setError('Please enter a valid email address.')
      return false
    }

    if (step === 2 && draft.services.length === 0) {
      setError('Please add at least one service.')
      return false
    }

    if (step === 3 && !draft.timeline.deliveryWindow.trim()) {
      setError('Please add a delivery window.')
      return false
    }

    return true
  }

  const canGoNext = step < steps.length - 1
  const canGoBack = step > 0

  const handleNext = () => {
    if (!validateStep()) {
      return
    }

    setError('')
    if (canGoNext) {
      setStep((current) => Math.min(current + 1, steps.length - 1))
    }
  }

  const handleBack = () => {
    setError('')
    if (canGoBack) {
      setStep((current) => Math.max(current - 1, 0))
    }
  }

  const handleSave = () => {
    if (!validateStep()) {
      return
    }

    const withTotals = {
      ...draft,
      services: totals.services,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      updatedAt: new Date().toISOString(),
      projectDescription: analysisValue,
      currency: settings.defaultCurrency,
    }

    if (!withTotals.id || withTotals.id.startsWith('quote-') && !allQuotes.some((quote) => quote.id === withTotals.id)) {
      withTotals.id = `quote-${Date.now()}`
    }

    if (!withTotals.quoteNumber) {
      withTotals.quoteNumber = generateQuoteNumber(allQuotes.length)
    }

    onSave(withTotals)
    navigate(`/quotes/${withTotals.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">Create quote</div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">New quotation</h1>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            onClick={handleBack}
            disabled={!canGoBack}
          >
            Back
          </button>
          <button
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            onClick={handleNext}
            disabled={!canGoNext}
          >
            Next
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {steps.map((label, index) => (
            <button
              key={label}
              type="button"
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${index === step ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-slate-50 text-slate-600'}`}
              onClick={() => setStep(index)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {step === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Client information</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Client name
              <input value={draft.client.name} onChange={(e) => updateClientField('name', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white" placeholder="Urban Threads" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Company
              <input value={draft.client.company} onChange={(e) => updateClientField('company', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white" placeholder="Urban Threads Ltd." />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Email
              <input value={draft.client.email} onChange={(e) => updateClientField('email', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white" placeholder="hello@company.com" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Phone
              <input value={draft.client.phone} onChange={(e) => updateClientField('phone', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white" placeholder="+1 (555) 123-4567" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
              Address
              <textarea value={draft.client.address} onChange={(e) => updateClientField('address', e.target.value)} className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white" placeholder="123 Market Street" />
            </label>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Project requirements</h2>
          <div className="mt-5">
            <textarea
              value={analysisValue}
              onChange={(event) => setAnalysisValue(event.target.value)}
              placeholder="Describe what your client needs..."
              className="min-h-44 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:bg-white"
            />
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="text-sm text-slate-500">Example: “I need a modern clothing website with 6 pages, product catalog, WhatsApp integration and basic SEO.”</div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleAnalyze}
              disabled={loading}
            >
              <Sparkles size={16} />
              {loading ? 'Analyzing...' : 'Analyze Requirements'}
            </button>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Project title</label>
            <input value={draft.projectTitle} onChange={(event) => updateQuoteField('projectTitle', event.target.value)} className="ml-3 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-300 focus:bg-white" placeholder="E-commerce Website" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700">Project description</label>
            <textarea value={draft.projectDescription} onChange={(event) => updateQuoteField('projectDescription', event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-300 focus:bg-white" placeholder="Give a short summary of the project." />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Services & pricing</h2>
            <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={addService}>
              <Plus size={16} /> Add Service
            </button>
          </div>

          <div className="space-y-4">
            {draft.services.map((service) => (
              <div key={service.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-800">Service</div>
                  <button type="button" className="inline-flex items-center gap-2 text-xs font-medium text-red-700 hover:text-red-800" onClick={() => removeService(service.id)}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-700">
                    Service
                    <input value={service.name} onChange={(e) => updateService(service.id, 'name', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-sky-300" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Description
                    <input value={service.description} onChange={(e) => updateService(service.id, 'description', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-sky-300" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Quantity
                    <input min={0} type="number" value={service.quantity} onChange={(e) => updateService(service.id, 'quantity', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-sky-300" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Unit Price
                    <input min={0} type="number" step="0.01" value={service.unitPrice} onChange={(e) => updateService(service.id, 'unitPrice', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-sky-300" />
                  </label>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                  <span>Total</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(service.total, settings.defaultCurrency)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatCurrency(totals.subtotal, settings.defaultCurrency)}</span></div>
              <div className="flex items-center justify-between"><span>Discount</span><span>{formatCurrency(totals.discount, settings.defaultCurrency)}</span></div>
              <div className="flex items-center justify-between"><span>Tax</span><span>{formatCurrency(totals.tax, settings.defaultCurrency)}</span></div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900"><span>Grand Total</span><span>{formatCurrency(totals.total, settings.defaultCurrency)}</span></div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Timeline & terms</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Start date
              <input type="date" value={draft.timeline.startDate} onChange={(event) => setDraft((current) => ({ ...current, timeline: { ...current.timeline, startDate: event.target.value } }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Delivery window
              <input value={draft.timeline.deliveryWindow} onChange={(event) => setDraft((current) => ({ ...current, timeline: { ...current.timeline, deliveryWindow: event.target.value } }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white" placeholder="4 weeks" />
            </label>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea value={draft.timeline.notes} onChange={(event) => setDraft((current) => ({ ...current, timeline: { ...current.timeline, notes: event.target.value } }))} className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white" placeholder="Project notes and timeline details." />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700">Terms</label>
            <textarea value={draft.terms} onChange={(event) => updateQuoteField('terms', event.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white" placeholder="Terms and conditions" />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Review & generate</h2>
          <div className="mt-5 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Quote</div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">{draft.quoteNumber || 'QF-2026-001'}</div>
                </div>
                <select value={draft.status} onChange={(e) => updateQuoteField('status', e.target.value as QuoteStatus)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-300">
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="mt-5 flex flex-wrap gap-6 text-sm text-slate-600">
                <div><span className="font-medium text-slate-800">Client:</span> {draft.client.name || 'Not set'}</div>
                <div><span className="font-medium text-slate-800">Project:</span> {draft.projectTitle || 'Untitled project'}</div>
                <div><span className="font-medium text-slate-800">Currency:</span> {draft.currency}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal, settings.defaultCurrency)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between"><span>Discount</span><span>{formatCurrency(totals.discount, settings.defaultCurrency)}</span></div>
              <div className="mt-2 flex items-center justify-between"><span>Tax</span><span>{formatCurrency(totals.tax, settings.defaultCurrency)}</span></div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900"><span>Grand total</span><span>{formatCurrency(totals.total, settings.defaultCurrency)}</span></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={() => navigate('/quotes')}>
          Cancel
        </button>
        <button className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800" onClick={handleSave}>
          Save Quote
        </button>
      </div>
    </div>
  )
}

function QuoteDetailPage({
  quotes,
  settings,
  onDelete,
  onDuplicate,
  onSave,
}: {
  quotes: Quote[]
  settings: AppSettings
  onDelete: (id: string) => void
  onDuplicate: (quote: Quote) => void
  onSave: (quote: Quote) => void
}) {
  const navigate = useNavigate()
  const { id } = useParams()
  const quote = quotes.find((item) => item.id === id)

  if (!quote) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <div className="text-lg font-semibold text-slate-800">Quote not found.</div>
        <button className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={() => navigate('/quotes')}>
          Back to Quotes
        </button>
      </div>
    )
  }

  const printQuote = () => {
    window.print()
  }

  const handleStatusChange = (status: QuoteStatus) => {
    const updated = { ...quote, status, updatedAt: new Date().toISOString() }
    onSave(updated)
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">Quote details</div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{quote.quoteNumber}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={() => navigate('/quotes')}>
            Back
          </button>
          <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={() => onDuplicate(quote)}>
            Duplicate
          </button>
          <button className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100" onClick={() => onDelete(quote.id)}>
            Delete
          </button>
          <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800" onClick={printQuote}>
            <span className="inline-flex items-center gap-2"><Printer size={16} /> Print / Save as PDF</span>
          </button>
        </div>
      </div>

      <div className="no-print rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">Status</span>
            <select value={quote.status} onChange={(event) => handleStatusChange(event.target.value as QuoteStatus)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-300 focus:bg-white">
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <button className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400" onClick={() => navigate(`/quotes/${quote.id}`)}>
            Edit Quote
          </button>
        </div>
      </div>

      <div className="print-area rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.28em] text-sky-700">QuoteFlow AI</div>
            <div className="mt-4 text-2xl font-bold text-slate-900">{settings.businessName || 'QuoteFlow AI'}</div>
            <div className="mt-2 text-sm text-slate-500">{settings.businessEmail || 'hello@quoteflow.ai'} · {settings.businessPhone || '+1 (415) 555-0194'}</div>
            <div className="text-sm text-slate-500">{settings.businessAddress || '125 Market Street, Suite 300, San Francisco, CA'}</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold text-slate-900">QUOTE</div>
            <div className="mt-3 text-sm text-slate-500">{quote.quoteNumber}</div>
            <div className="mt-2 text-sm text-slate-500">{new Date(quote.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Bill to</div>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">{quote.client.name}</div>
              <div>{quote.client.company || 'No company entered'}</div>
              <div>{quote.client.email || 'No email entered'}</div>
              <div>{quote.client.phone || 'No phone entered'}</div>
              <div>{quote.client.address || 'No address entered'}</div>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Project</div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div><span className="font-semibold text-slate-900">Title:</span> {quote.projectTitle}</div>
              <div><span className="font-semibold text-slate-900">Status:</span> {quote.status}</div>
              <div><span className="font-semibold text-slate-900">Timeline:</span> {quote.timeline.deliveryWindow || 'Not set'}</div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">Project description</div>
          <p className="text-sm text-slate-700">{quote.projectDescription || 'No project description provided.'}</p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Unit Price</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quote.services.map((service) => (
                <tr key={service.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{service.name}</td>
                  <td className="px-4 py-3 text-slate-600">{service.description || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{service.quantity}</td>
                  <td className="px-4 py-3 text-slate-600">{formatCurrency(service.unitPrice, quote.currency)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(service.total, quote.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <div className="w-full max-w-sm space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatCurrency(quote.subtotal, quote.currency)}</span></div>
            <div className="flex items-center justify-between"><span>Discount</span><span>{formatCurrency(quote.discount, quote.currency)}</span></div>
            <div className="flex items-center justify-between"><span>Tax</span><span>{formatCurrency(quote.tax, quote.currency)}</span></div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900"><span>Grand total</span><span>{formatCurrency(quote.total, quote.currency)}</span></div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Timeline</div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div><span className="font-semibold text-slate-900">Start:</span> {quote.timeline.startDate || 'Not set'}</div>
              <div><span className="font-semibold text-slate-900">Delivery:</span> {quote.timeline.deliveryWindow || 'Not set'}</div>
              <div><span className="font-semibold text-slate-900">Notes:</span> {quote.timeline.notes || 'No notes provided.'}</div>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Terms & conditions</div>
            <p className="mt-3 text-sm text-slate-700">{quote.terms || 'Standard terms apply.'}</p>
          </div>
        </div>

        <footer className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          Thank you for your trust in QuoteFlow AI. This quote is valid for 30 days from the issuance date.
        </footer>
      </div>
    </div>
  )
}

function SettingsPage({ settings, onChange }: { settings: AppSettings; onChange: (settings: AppSettings) => void }) {
  const [draft, setDraft] = useState<AppSettings>(settings)

  useEffect(() => {
    setDraft(settings)
  }, [settings])

  const handleSave = () => {
    onChange(draft)
  }

  const handleInput = <K extends keyof AppSettings>(field: K, value: AppSettings[K]) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">Settings</div>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Business profile</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Business name
            <input value={draft.businessName} onChange={(event) => handleInput('businessName', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Business email
            <input value={draft.businessEmail} onChange={(event) => handleInput('businessEmail', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Business phone
            <input value={draft.businessPhone} onChange={(event) => handleInput('businessPhone', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Website
            <input value={draft.website} onChange={(event) => handleInput('website', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            Business address
            <textarea value={draft.businessAddress} onChange={(event) => handleInput('businessAddress', event.target.value)} className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Default currency
            <select value={draft.defaultCurrency} onChange={(event) => handleInput('defaultCurrency', event.target.value as AppSettings['defaultCurrency'])} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white">
              {currencyOptions.map((currency) => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Default tax (%)
            <input type="number" value={draft.defaultTax} onChange={(event) => handleInput('defaultTax', Number(event.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            Default terms
            <textarea value={draft.defaultTerms} onChange={(event) => handleInput('defaultTerms', event.target.value)} className="min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-300 focus:bg-white" />
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

const statusStyles: Record<QuoteStatus, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  Sent: 'bg-sky-100 text-sky-700',
  Accepted: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
}

export default App
