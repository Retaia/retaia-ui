import { resources, type Locale } from '../src/i18n/resources'

function collectKeys(input: unknown, prefix = ''): string[] {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return prefix ? [prefix] : []
  }

  const entries = Object.entries(input as Record<string, unknown>)
  if (entries.length === 0) {
    return prefix ? [prefix] : []
  }

  return entries.flatMap(([key, value]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return collectKeys(value, nextPrefix)
    }
    return [nextPrefix]
  })
}

function getTranslationKeys(locale: Locale) {
  const tree = resources[locale].translation
  return new Set(collectKeys(tree))
}

function difference(source: Set<string>, target: Set<string>) {
  return [...source].filter((key) => !target.has(key)).sort()
}

const locales = Object.keys(resources) as Locale[]
const baseLocale: Locale = 'en'
const baseKeys = getTranslationKeys(baseLocale)
let hasError = false

for (const locale of locales) {
  if (locale === baseLocale) {
    continue
  }

  const localeKeys = getTranslationKeys(locale)
  const missingInLocale = difference(baseKeys, localeKeys)
  const extraInLocale = difference(localeKeys, baseKeys)

  if (missingInLocale.length > 0 || extraInLocale.length > 0) {
    hasError = true
    console.error(`i18n key parity failed for locale "${locale}"`)
    if (missingInLocale.length > 0) {
      console.error(`  Missing (${missingInLocale.length}):`)
      for (const key of missingInLocale) {
        console.error(`    - ${key}`)
      }
    }
    if (extraInLocale.length > 0) {
      console.error(`  Extra (${extraInLocale.length}):`)
      for (const key of extraInLocale) {
        console.error(`    - ${key}`)
      }
    }
  }
}

if (hasError) {
  process.exit(1)
}

console.log(`i18n key parity check passed for locales: ${locales.join(', ')}`)
