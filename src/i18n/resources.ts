import { enTranslation } from './locales/en'
import { frTranslation } from './locales/fr'

export type Locale = 'fr' | 'en'

export const resources = {
  en: {
    translation: enTranslation,
  },
  fr: {
    translation: frTranslation,
  },
} as const
