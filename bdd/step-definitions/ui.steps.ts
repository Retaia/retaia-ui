import { Given, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { APP_URL, getBrowserRuntime } from '../support/testRuntime'

const getPage = () => getBrowserRuntime().page

Given("je suis sur la page d'accueil", async () => {
  await getPage().goto(APP_URL, { waitUntil: 'networkidle' })
})

Then('le titre principal {string} est visible', async (title: string) => {
  await expect(getPage().getByRole('heading', { name: title })).toBeVisible()
})

When("je clique sur l'asset {string}", async (assetName: string) => {
  const assetsPanel = getPage().locator('section[aria-label="Liste des assets"]')
  await assetsPanel.getByText(assetName).first().click()
})

When('je fais Maj+clic sur l\'asset {string}', async (assetName: string) => {
  const assetsPanel = getPage().locator('section[aria-label="Liste des assets"]')
  await assetsPanel.getByText(assetName).first().click({ modifiers: ['Shift'] })
})

Then('le panneau détail affiche l\'asset {string}', async (assetName: string) => {
  const detailPanel = getPage().locator('section[aria-label="Détail de l\'asset"]')
  await expect(detailPanel.getByText(assetName)).toBeVisible()
})

Then('le batch sélectionné affiche {int}', async (size: number) => {
  await expect(getPage().getByText(`Batch sélectionné: ${size}`)).toBeVisible()
})

When('je rejette le premier asset de la liste', async () => {
  const assetsPanel = getPage().locator('section[aria-label="Liste des assets"]')
  const firstRow = assetsPanel.locator('li.list-group-item').first()
  await firstRow.getByRole('button', { name: 'REJECT' }).click()
})

Then('l\'état {string} est visible', async (stateLabel: string) => {
  const [assetId, expectedState] = stateLabel.split(' - ')
  if (!assetId || !expectedState) {
    throw new Error(`Format d'état invalide: ${stateLabel}`)
  }
  const assetsPanel = getPage().locator('section[aria-label="Liste des assets"]')
  const row = assetsPanel.locator('li.list-group-item', { hasText: assetId })
  await expect(row).toContainText(expectedState)
})

When("j'utilise le raccourci annuler", async () => {
  await getPage().keyboard.press('Control+z')
  await getPage().keyboard.press('Meta+z')
})

When("j'ouvre le premier asset au clavier", async () => {
  await getPage().keyboard.press('Enter')
})

When("j'ouvre le prochain asset à traiter via la touche n", async () => {
  await getPage().keyboard.press('n')
})

When("j'étends la sélection de plage jusqu'à 3 assets", async () => {
  await getPage().keyboard.down('Shift')
  await getPage().keyboard.press('ArrowDown')
  await getPage().keyboard.press('ArrowDown')
  await getPage().keyboard.up('Shift')
})

When("j'ajoute l'asset sélectionné au batch via Shift+Espace", async () => {
  await getPage().evaluate(() => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        shiftKey: true,
        bubbles: true,
      }),
    )
  })
})

When(/^je sélectionne tous les assets visibles via Ctrl\/Cmd\+A$/, async () => {
  await getPage().keyboard.press('Control+a')
  await getPage().keyboard.press('Meta+a')
})

When('j\'applique l\'action {string}', async (actionLabel: string) => {
  await getPage().locator('button', { hasText: actionLabel }).first().click()
})

When('je recherche {string}', async (term: string) => {
  await getPage().getByLabel('Recherche').fill(term)
})

When('je clique sur le bouton {string}', async (buttonLabel: string) => {
  const button = getPage().getByRole('button', { name: buttonLabel })
  await expect(button).toBeEnabled({ timeout: 10000 })
  await button.click()
})

When('j\'appuie sur la touche {string}', async (key: string) => {
  await getPage().keyboard.press(key)
})

Then('l\'historique disponible affiche {int}', async (count: number) => {
  await expect(getPage().getByText(`Historique disponible: ${count}`)).toBeVisible()
})

Then('le message {string} est visible', async (message: string) => {
  await expect(getPage().getByText(message, { exact: false })).toBeVisible()
})

Then('le bouton {string} est visible', async (buttonLabel: string) => {
  await expect(getPage().getByRole('button', { name: buttonLabel })).toBeVisible()
})

Then('le rapport de batch contient {string}', async (text: string) => {
  await expect(getPage().getByText(text, { exact: false }).first()).toBeVisible()
})

Then('le statut de prévisualisation contient {string}', async (text: string) => {
  await expect(getPage().getByTestId('batch-preview-status')).toContainText(text)
})

Then('le statut d\'exécution contient {string}', async (text: string) => {
  await expect(getPage().getByTestId('batch-execute-status')).toContainText(text)
})

Then('le rapport batch affiche le statut {string}', async (status: string) => {
  await expect(getPage().getByTestId('batch-report-status-value')).toHaveText(status)
})

Then('le rapport batch affiche {int} assets déplacés', async (count: number) => {
  await expect(getPage().getByTestId('batch-report-moved-value')).toHaveText(String(count))
})

Then('le rapport batch affiche {int} assets en échec', async (count: number) => {
  await expect(getPage().getByTestId('batch-report-failed-value')).toHaveText(String(count))
})

Then('le statut purge contient {string}', async (text: string) => {
  await expect(getPage().getByTestId('asset-purge-status')).toContainText(text, {
    ignoreCase: true,
  })
})

Then('l\'asset {string} n\'est plus visible dans la liste', async (assetName: string) => {
  const assetsPanel = getPage().locator('section[aria-label="Liste des assets"]')
  await expect(assetsPanel.getByText(assetName)).toHaveCount(0)
})

Then('le champ de recherche a le focus', async () => {
  await expect(getPage().getByLabel('Recherche')).toBeFocused()
})
