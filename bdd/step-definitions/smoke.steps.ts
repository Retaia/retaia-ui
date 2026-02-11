import { After, Before, Given, setDefaultTimeout, Then, When } from '@cucumber/cucumber'
import { chromium, expect, firefox, type Browser, type BrowserContext, type Page, webkit } from '@playwright/test'

const APP_URL = process.env.APP_URL ?? 'http://127.0.0.1:4173'
const BROWSER_NAME = process.env.PW_BROWSER ?? 'chromium'
setDefaultTimeout(15000)

let browser: Browser
let context: BrowserContext
let page: Page
let previewShouldFailScope = false
let executeShouldFailStateConflict = false
let reportShouldFailTemporary = false

Before(async () => {
  previewShouldFailScope = false
  executeShouldFailStateConflict = false
  reportShouldFailTemporary = false

  const browserType =
    BROWSER_NAME === 'firefox' ? firefox : BROWSER_NAME === 'webkit' ? webkit : chromium
  browser = await browserType.launch({ headless: true })
  context = await browser.newContext()
  page = await context.newPage()

  await page.route('**/api/v1/batches/moves/preview', async (route) => {
    if (previewShouldFailScope) {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'FORBIDDEN_SCOPE',
          message: 'forbidden',
          retryable: false,
          correlation_id: 'bdd-corr-1',
        }),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    })
  })

  await page.route('**/api/v1/batches/moves/batch-e2e-1', async (route) => {
    if (reportShouldFailTemporary) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'TEMPORARY_UNAVAILABLE',
          message: 'temporary unavailable',
          retryable: true,
          correlation_id: 'bdd-corr-2',
        }),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'DONE', moved: 2 }),
    })
  })

  await page.route('**/api/v1/batches/moves', async (route) => {
    if (executeShouldFailStateConflict) {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'STATE_CONFLICT',
          message: 'state conflict',
          retryable: false,
          correlation_id: 'bdd-corr-3',
        }),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ batch_id: 'batch-e2e-1' }),
    })
  })
})

After(async () => {
  await context.close()
  await browser.close()
})

Given("je suis sur la page d'accueil", async () => {
  await page.goto(APP_URL, { waitUntil: 'networkidle' })
})

Given('le mock API retourne FORBIDDEN_SCOPE sur la preview batch', async () => {
  previewShouldFailScope = true
})

Given('le mock API retourne STATE_CONFLICT sur l\'exécution batch', async () => {
  executeShouldFailStateConflict = true
})

Given('le mock API retourne TEMPORARY_UNAVAILABLE sur le rapport batch', async () => {
  reportShouldFailTemporary = true
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

When("j'ouvre le premier asset au clavier", async () => {
  await page.keyboard.press('Enter')
})

When("j'étends la sélection de plage jusqu'à 3 assets", async () => {
  await page.keyboard.down('Shift')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.up('Shift')
})

When('j\'applique l\'action {string}', async (actionLabel: string) => {
  await page.locator('button', { hasText: actionLabel }).first().click()
})

When('je recherche {string}', async (term: string) => {
  await page.getByLabel('Recherche').fill(term)
})

When('je clique sur le bouton {string}', async (buttonLabel: string) => {
  await page.getByRole('button', { name: buttonLabel }).click()
})

Then('l\'historique disponible affiche {int}', async (count: number) => {
  await expect(page.getByText(`Historique disponible: ${count}`)).toBeVisible()
})

Then('le message {string} est visible', async (message: string) => {
  await expect(page.getByText(message)).toBeVisible()
})

Then('le rapport de batch contient {string}', async (text: string) => {
  await expect(page.locator('pre').filter({ hasText: text })).toBeVisible()
})
