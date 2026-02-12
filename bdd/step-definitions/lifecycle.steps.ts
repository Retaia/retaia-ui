import { After, Before, setDefaultTimeout } from '@cucumber/cucumber'
import { chromium, firefox, webkit } from '@playwright/test'
import { installMockApiRoutes, resetMockApiState } from '../support/mockApiRoutes'
import {
  BROWSER_NAME,
  clearBrowserRuntime,
  getBrowserRuntime,
  mockApiState,
  setBrowserRuntime,
} from '../support/testRuntime'

setDefaultTimeout(15000)

Before(async () => {
  resetMockApiState(mockApiState)

  const browserType =
    BROWSER_NAME === 'firefox' ? firefox : BROWSER_NAME === 'webkit' ? webkit : chromium
  const browser = await browserType.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  setBrowserRuntime(browser, context, page)
  await installMockApiRoutes(page, mockApiState)
})

After(async () => {
  const { browser, context } = getBrowserRuntime()
  await context.close()
  await browser.close()
  clearBrowserRuntime()
})
