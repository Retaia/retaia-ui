import { Given, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { APP_URL, getBrowserRuntime, mockApiState, requireBddMockApiMode } from '../support/testRuntime'

const getPage = () => getBrowserRuntime().page

Given("je suis sur la page d'accueil", async () => {
  await getPage().goto(APP_URL, { waitUntil: 'networkidle' })
})

Given('je suis sur la page {string}', async (path: string) => {
  await getPage().goto(`${APP_URL}${path}`, { waitUntil: 'networkidle' })
})

Given("je suis sur la page d'accueil en mode source API", async () => {
  await getPage().goto(`${APP_URL}/review?source=api`, { waitUntil: 'domcontentloaded' })
})

Then('le titre principal {string} est visible', async (title: string) => {
  await expect(getPage().getByRole('heading', { name: title })).toBeVisible()
})

Then('l\'URL courante contient {string}', async (value: string) => {
  await expect(getPage()).toHaveURL(new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
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

When("je bascule la langue en anglais", async () => {
  await getPage().getByRole('button', { name: 'Anglais' }).click()
})

When('j\'appuie sur la touche {string}', async (key: string) => {
  await getPage().keyboard.press(key)
})

When("je reviens en arrière dans l'historique navigateur", async () => {
  await getPage().goBack({ waitUntil: 'networkidle' })
})

When("j'avance dans l'historique navigateur", async () => {
  await getPage().goForward({ waitUntil: 'networkidle' })
})

Then('l\'historique disponible affiche {int}', async (count: number) => {
  await expect(getPage().getByText(`Historique disponible: ${count}`)).toBeVisible()
})

Then('le message {string} est visible', async (message: string) => {
  await expect(getPage().getByText(message, { exact: false })).toBeVisible()
})

Then('le libellé de recherche anglais est visible', async () => {
  await expect(getPage().getByLabel('Search')).toBeVisible()
})

Then('le statut de sélection affiche {string}', async (text: string) => {
  await expect(getPage().getByTestId('selection-status')).toContainText(text)
})

Then('le statut batch affiche {int}', async (count: number) => {
  await expect(getPage().getByTestId('batch-status')).toContainText(String(count))
})

Then('le panneau détail est sticky en desktop', async () => {
  const detailPanel = getPage().locator('section[aria-label="Détail de l\'asset"]')
  await expect(detailPanel.locator('.card').first()).toHaveClass(/sticky-xl-top/)
})

Then('le statut de chargement assets API est visible', async () => {
  await expect(getPage().getByTestId('assets-loading-status')).toBeVisible()
})

Then('le statut d\'erreur assets API est visible', async () => {
  await expect(getPage().getByTestId('assets-error-status')).toBeVisible()
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

When('je filtre par état {string}', async (state: string) => {
  await getPage().getByLabel('Filtrer par état').selectOption(state)
})

Then('la ligne asset {string} a aria-selected {string}', async (assetId: string, selected: string) => {
  const assetsPanel = getPage().locator('section[aria-label="Liste des assets"]')
  const row = assetsPanel.locator('li.list-group-item', { hasText: assetId }).first()
  await expect(row).toHaveAttribute('aria-selected', selected)
})

Then('la ligne asset {string} a tabindex {string}', async (assetId: string, tabIndex: string) => {
  const assetsPanel = getPage().locator('section[aria-label="Liste des assets"]')
  const row = assetsPanel.locator('li.list-group-item', { hasText: assetId }).first()
  await expect(row).toHaveAttribute('tabindex', tabIndex)
})

Then('la ligne asset {string} a le focus', async (assetId: string) => {
  const assetsPanel = getPage().locator('section[aria-label="Liste des assets"]')
  const row = assetsPanel.locator('li.list-group-item', { hasText: assetId }).first()
  await expect(row).toBeFocused()
})

When('je saisis le tag {string}', async (tag: string) => {
  await getPage().getByTestId('asset-tag-input').fill(tag)
})

When('je clique sur ajouter tag', async () => {
  await getPage().getByTestId('asset-tag-add').click()
})

When('je saisis la note {string}', async (note: string) => {
  await getPage().getByTestId('asset-notes-input').fill(note)
})

When('je sauvegarde le tagging', async () => {
  await getPage().getByTestId('asset-tag-save').click()
})

Then('le statut tagging contient {string}', async (text: string) => {
  await expect(getPage().getByTestId('asset-metadata-status')).toContainText(text)
})

Then('la liste de tags contient {string}', async (tag: string) => {
  await expect(getPage().getByTestId('asset-tag-list')).toContainText(tag)
})

Then(
  'le mock API reçoit un patch asset avec le tag {string} et la note {string}',
  async (tag: string, note: string) => {
    requireBddMockApiMode('le mock API reçoit un patch asset avec le tag {string} et la note {string}')
    expect(mockApiState.lastPatchedAssetId).not.toBeNull()
    expect(mockApiState.lastPatchedPayload).toEqual(
      expect.objectContaining({
        tags: expect.arrayContaining([tag]),
        notes: note,
      }),
    )
  },
)

When('je saisis {string} dans le champ testid {string}', async (value: string, testId: string) => {
  const input = getPage().getByTestId(testId)
  await input.fill('')
  await input.type(value)
})

When('je clique sur l\'element testid {string}', async (testId: string) => {
  await getPage().getByTestId(testId).click()
})

Then('le testid {string} contient {string}', async (testId: string, text: string) => {
  await expect(getPage().getByTestId(testId)).toContainText(text)
})

Then('le testid {string} est visible', async (testId: string) => {
  await expect(getPage().getByTestId(testId)).toBeVisible()
})

When('je filtre par type media {string}', async (mediaType: string) => {
  await getPage().getByLabel('Type').selectOption(mediaType)
})

When('je filtre par date {string}', async (dateFilter: string) => {
  await getPage().getByLabel('Date de capture').selectOption(dateFilter)
})
