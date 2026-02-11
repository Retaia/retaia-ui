import { describe, expect, it } from 'vitest'
import { i18next } from './index'

describe('i18n messages', () => {
  it('uses locale value when key exists', async () => {
    await i18next.changeLanguage('fr')
    expect(i18next.t('toolbar.search')).toBe('Recherche')

    await i18next.changeLanguage('en')
    expect(i18next.t('toolbar.search')).toBe('Search')
  })

  it('falls back to english when key is missing in selected locale', async () => {
    await i18next.changeLanguage('fr')
    expect(i18next.t('dev.fallbackOnlyEn')).toBe('English fallback value')
  })

  it('falls back to raw key when missing in all locales', async () => {
    await i18next.changeLanguage('fr')
    expect(i18next.t('missing.only.en')).toBe('missing.only.en')
  })

  it('interpolates parameters', async () => {
    await i18next.changeLanguage('en')
    expect(i18next.t('actions.batchSelected', { count: 3 })).toBe('Selected batch: 3')

    await i18next.changeLanguage('fr')
    expect(i18next.t('actions.batchSelected', { count: 2 })).toBe('Batch sélectionné: 2')
  })
})
