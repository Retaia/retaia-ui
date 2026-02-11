import { After, Before, Given, Then, When } from '@cucumber/cucumber'
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

When("je clique sur l'asset {string}", async (assetName: string) => {
  const assetsPanel = page.locator('section[aria-label="Liste des assets"]')
  await assetsPanel.getByText(assetName).first().click()
})

When('je fais Maj+clic sur l\'asset {string}', async (assetName: string) => {
  const assetsPanel = page.locator('section[aria-label="Liste des assets"]')
  await assetsPanel.getByText(assetName).first().click({ modifiers: ['Shift'] })
})

Then('le panneau détail affiche l\'asset {string}', async (assetName: string) => {
  const detailPanel = page.locator('section[aria-label="Détail de l\'asset"]')
  await expect(detailPanel.getByText(assetName)).toBeVisible()
})

Then('le batch sélectionné affiche {int}', async (size: number) => {
  await expect(page.getByText(`Batch sélectionné: ${size}`)).toBeVisible()
})

When('je rejette le premier asset de la liste', async () => {
  const assetsPanel = page.locator('section[aria-label="Liste des assets"]')
  const firstRow = assetsPanel.locator('li.list-group-item').first()
  await firstRow.getByRole('button', { name: 'REJECT' }).click()
})

Then('l\'état {string} est visible', async (stateLabel: string) => {
  const [assetId, expectedState] = stateLabel.split(' - ')
  if (!assetId || !expectedState) {
    throw new Error(`Format d'état invalide: ${stateLabel}`)
  }
  const assetsPanel = page.locator('section[aria-label="Liste des assets"]')
  const row = assetsPanel.locator('li.list-group-item', { hasText: assetId })
  await expect(row).toContainText(expectedState)
})

When("j'utilise le raccourci annuler", async () => {
  await page.keyboard.press('Control+z')
  await page.keyboard.press('Meta+z')
})
