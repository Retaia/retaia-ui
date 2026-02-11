import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { i18next } from './i18n'

beforeEach(async () => {
  window.localStorage.clear()
  await i18next.changeLanguage('fr')
})

afterEach(() => {
  cleanup()
})
