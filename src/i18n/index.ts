import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources } from './resources'

void i18next.use(initReactI18next).init({
  resources,
  lng: 'fr',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
    prefix: '{',
    suffix: '}',
  },
  keySeparator: false,
  returnNull: false,
})

export { i18next }
