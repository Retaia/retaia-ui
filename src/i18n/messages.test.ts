import { describe, expect, it } from 'vitest'
import { t } from './messages'

describe('i18n messages', () => {
  it('uses locale value when key exists', () => {
    expect(t('fr', 'toolbar.search')).toBe('Recherche')
    expect(t('en', 'toolbar.search')).toBe('Search')
  })

  it('falls back to english when key is missing in selected locale', () => {
    expect(t('fr', 'dev.fallbackOnlyEn')).toBe('English fallback value')
  })

  it('falls back to raw key when missing in all locales', () => {
    expect(t('fr', 'missing.only.en')).toBe('missing.only.en')
  })

  it('interpolates parameters', () => {
    expect(t('en', 'actions.batchSelected', { count: 3 })).toBe('Selected batch: 3')
    expect(t('fr', 'actions.batchSelected', { count: 2 })).toBe('Batch sélectionné: 2')
  })
})
