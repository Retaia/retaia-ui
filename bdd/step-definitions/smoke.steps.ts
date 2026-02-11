import { After, Before, Given, Then } from '@cucumber/cucumber'
import { chromium, expect, type Browser, type BrowserContext, type Page } from '@playwright/test'

const APP_URL = 'http://127.0.0.1:4173'

let browser: Browser
let context: BrowserContext
let page: Page

Before(async () => {
  browser = await chromium.launch({ headless: true })
  context = await browser.newContext()
  page = await context.newPage()
})

After(async () => {
  await context.close()
  await browser.close()
})

Given("je suis sur la page d'accueil", async () => {
  await page.goto(APP_URL, { waitUntil: 'networkidle' })
})

Then('le titre principal {string} est visible', async (title: string) => {
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
})
