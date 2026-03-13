import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { i18next } from './i18n'
import { appQueryClient } from './queryClient'
import { mswServer } from './test-utils/mswServer'

vi.mock('redux-persist', () => ({
  FLUSH: 'persist/FLUSH',
  REHYDRATE: 'persist/REHYDRATE',
  PAUSE: 'persist/PAUSE',
  PERSIST: 'persist/PERSIST',
  PURGE: 'persist/PURGE',
  REGISTER: 'persist/REGISTER',
  persistReducer: (_config: unknown, reducer: unknown) => reducer,
  persistStore: () => ({
    purge: vi.fn(),
    flush: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    persist: vi.fn(),
    dispatch: vi.fn(),
    subscribe: vi.fn(() => () => undefined),
    getState: vi.fn(() => ({ bootstrapped: true })),
  }),
}))

vi.mock('redux-persist/integration/react', () => ({
  PersistGate: ({ children }: { children: ReactNode }) => children,
}))

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
