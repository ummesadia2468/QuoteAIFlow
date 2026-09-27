import type { RequirementSuggestion, ServiceItem } from '../types'

const suggestionMap: Array<{ pattern: RegExp; name: string; description: string; defaultQuantity?: number }> = [
  { pattern: /(website|web site|web presence)/i, name: 'Website Development', description: 'Design and build the web presence described by the client.' },
  { pattern: /(page|pages)/i, name: 'Website Pages', description: 'Page count required for the website build.' },
  { pattern: /(product catalog|catalog|shop|e-commerce|ecommerce)/i, name: 'Product Catalog', description: 'Catalog or storefront functionality.' },
  { pattern: /(whatsapp|WhatsApp|chat integration)/i, name: 'WhatsApp Integration', description: 'Customer contact and lead capture via WhatsApp.' },
  { pattern: /(seo|search engine optimization|basic seo)/i, name: 'Basic SEO', description: 'Search optimization for the project.' },
  { pattern: /(landing page)/i, name: 'Landing Page Design', description: 'Customer acquisition landing page design.' },
  { pattern: /(branding|brand identity|logo)/i, name: 'Branding Support', description: 'Branding and visual direction support.' },
]

function extractQuantityFromText(text: string, keyword: string): number {
  const match = text.match(new RegExp(`(\\d+)\\s*(?:${keyword}|${keyword}s)`, 'i'))
  if (match) {
    return Number(match[1])
  }

  return 1
}

export function analyzeRequirements(requirements: string): { suggestions: RequirementSuggestion[]; warnings: string[] } {
  const trimmed = requirements.trim()
  const warnings: string[] = []

  if (!trimmed) {
    return { suggestions: [], warnings: ['Please describe the project requirements.'] }
  }

  const suggestions: RequirementSuggestion[] = []

  suggestionMap.forEach((rule) => {
    if (rule.pattern.test(trimmed)) {
      const quantity = rule.name === 'Website Pages'
        ? extractQuantityFromText(trimmed, 'page')
        : rule.defaultQuantity ?? 1

      const suggestion = {
        name: rule.name,
        quantity,
        description: rule.description,
      }

      suggestions.push(suggestion)
    }
  })

  if (suggestions.length === 0) {
    suggestions.push({
      name: 'Custom Project Scope',
      quantity: 1,
      description: 'Custom work based on the client brief.',
    })
    warnings.push('Smart analysis is currently unavailable. You can add services manually.')
  }

  return { suggestions, warnings }
}

export function convertSuggestionsToServices(suggestions: RequirementSuggestion[]): ServiceItem[] {
  return suggestions.map((item) => ({
    id: `svc-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: item.name,
    description: item.description,
    quantity: Math.max(1, Number(item.quantity) || 1),
    unitPrice: 0,
    total: 0,
  }))
}
