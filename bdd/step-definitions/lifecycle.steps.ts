import { After, Before, setDefaultTimeout } from '@cucumber/cucumber'
import { chromium, firefox, webkit } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
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
const BDD_COVERAGE_ENABLED = process.env.BDD_COVERAGE === '1'
const BDD_COVERAGE_DIR = process.env.BDD_COVERAGE_DIR ?? join(process.cwd(), 'coverage', 'bdd', 'raw')

Before(async () => {
  resetMockApiState(mockApiState)

  const browserType =
    BROWSER_NAME === 'firefox' ? firefox : BROWSER_NAME === 'webkit' ? webkit : chromium
  const browser = await browserType.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  setBrowserRuntime(browser, context, page)
  if (BDD_COVERAGE_ENABLED && BROWSER_NAME === 'chromium') {
    await page.coverage.startJSCoverage({
      resetOnNavigation: false,
      reportAnonymousScripts: false,
      includeRawScriptCoverage: true,
    })
  }
  if (IS_BDD_MOCK_API_MODE) {
    await installMockApiRoutes(page, mockApiState)
  } else {
    console.log(`[bdd-mode] running with real API target (${BDD_API_MODE}), mock routes disabled.`)
  }
})

After(async () => {
  const { browser, context, page } = getBrowserRuntime()
  if (BDD_COVERAGE_ENABLED && BROWSER_NAME === 'chromium') {
    const coverage = await page.coverage.stopJSCoverage()
    await mkdir(BDD_COVERAGE_DIR, { recursive: true })
    const filePath = join(BDD_COVERAGE_DIR, `coverage-${Date.now()}-${Math.random().toString(16).slice(2)}.json`)
    await writeFile(filePath, JSON.stringify(coverage), 'utf-8')
  }
  await context.close()
  await browser.close()
  clearBrowserRuntime()
})
