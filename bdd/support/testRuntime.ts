import type { Browser, BrowserContext, Page } from '@playwright/test'
import { createMockApiState } from './mockApiRoutes'

export const APP_URL = process.env.APP_URL ?? 'http://127.0.0.1:4173'
export const BROWSER_NAME = process.env.PW_BROWSER ?? 'chromium'

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
