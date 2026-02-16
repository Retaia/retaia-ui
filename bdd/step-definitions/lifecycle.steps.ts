import { After, Before, setDefaultTimeout } from '@cucumber/cucumber'
import { chromium, firefox, webkit } from '@playwright/test'
import { installMockApiRoutes, resetMockApiState } from '../support/mockApiRoutes'
import {
  BROWSER_NAME,
  BDD_API_MODE,
  IS_BDD_MOCK_API_MODE,
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
  if (IS_BDD_MOCK_API_MODE) {
    await installMockApiRoutes(page, mockApiState)
  } else {
    console.log(`[bdd-mode] running with real API target (${BDD_API_MODE}), mock routes disabled.`)
  }
})

After(async () => {
  const { browser, context } = getBrowserRuntime()
  await context.close()
  await browser.close()
  clearBrowserRuntime()
})
