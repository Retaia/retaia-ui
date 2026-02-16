import type { Browser, BrowserContext, Page } from '@playwright/test'
import { createMockApiState } from './mockApiRoutes'

export const APP_URL = process.env.APP_URL ?? 'http://127.0.0.1:4173'
export const BROWSER_NAME = process.env.PW_BROWSER ?? 'chromium'
export const BDD_API_MODE = process.env.BDD_API_MODE === 'real-api' ? 'real-api' : 'mock'
export const IS_BDD_MOCK_API_MODE = BDD_API_MODE === 'mock'

export const mockApiState = createMockApiState()

let browser: Browser | null = null
let context: BrowserContext | null = null
let page: Page | null = null

export const setBrowserRuntime = (
  nextBrowser: Browser,
  nextContext: BrowserContext,
  nextPage: Page,
) => {
  browser = nextBrowser
  context = nextContext
  page = nextPage
}

export const getBrowserRuntime = () => {
  if (!browser || !context || !page) {
    throw new Error('BDD runtime is not initialized. Did Before hook run?')
  }
  return { browser, context, page }
}

export const clearBrowserRuntime = () => {
  browser = null
  context = null
  page = null
}

export function requireBddMockApiMode(stepName: string) {
  if (!IS_BDD_MOCK_API_MODE) {
    throw new Error(
      `[bdd-mode] Step "${stepName}" requires BDD_API_MODE=mock, current mode is "${BDD_API_MODE}".`,
    )
  }
}
