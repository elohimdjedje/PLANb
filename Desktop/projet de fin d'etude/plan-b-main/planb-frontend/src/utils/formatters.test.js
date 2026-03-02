import { describe, it, expect } from 'vitest'

// Fonctions utilitaires à tester
const formatPrice = (price, currency = 'XOF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

const slugify = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Tests
describe('formatPrice', () => {
  it('devrait formater un prix en XOF', () => {
    const result = formatPrice(150000)
    expect(result).toContain('150')
    expect(result).toContain('000')
  })

  it('devrait gérer les petits montants', () => {
    const result = formatPrice(500)
    expect(result).toContain('500')
  })

  it('devrait gérer zéro', () => {
    const result = formatPrice(0)
    expect(result).toContain('0')
  })
})

describe('formatDate', () => {
  it('devrait formater une date en français', () => {
    const result = formatDate('2024-01-15')
    expect(result).toContain('janvier')
    expect(result).toContain('2024')
  })
})

describe('truncateText', () => {
  it('devrait tronquer le texte long', () => {
    const text = 'Ceci est un texte très long qui doit être tronqué'
    const result = truncateText(text, 20)
    expect(result).toHaveLength(23) // 20 + '...'
    expect(result.endsWith('...')).toBe(true)
  })

  it('ne devrait pas tronquer le texte court', () => {
    const text = 'Court'
    const result = truncateText(text, 20)
    expect(result).toBe('Court')
  })
})

describe('slugify', () => {
  it('devrait convertir en slug', () => {
    expect(slugify('Appartement à Cocody')).toBe('appartement-a-cocody')
  })

  it('devrait gérer les accents', () => {
    expect(slugify('Café éléphant')).toBe('cafe-elephant')
  })

  it('devrait gérer les espaces multiples', () => {
    expect(slugify('Test   multiple   espaces')).toBe('test-multiple-espaces')
  })
})
