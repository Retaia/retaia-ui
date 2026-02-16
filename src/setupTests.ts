import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { i18next } from './i18n'
import { appQueryClient } from './queryClient'
import { mswServer } from './test-utils/mswServer'

beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: 'bypass' })
})

beforeEach(async () => {
  window.localStorage.clear()
  await i18next.changeLanguage('fr')
})

afterEach(() => {
  mswServer.resetHandlers()
  appQueryClient.clear()
  cleanup()
})

afterAll(() => {
  mswServer.close()
})
