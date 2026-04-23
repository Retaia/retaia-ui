import { Given, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { APP_URL, getBrowserRuntime, mockApiState, requireBddMockApiMode } from '../support/testRuntime'

const getPage = () => getBrowserRuntime().page

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

async function openQuickActionsMenuIfNeeded() {
  const page = getPage()
  const menu = page.getByTestId('quick-actions-menu')
  if (await menu.isVisible().catch(() => false)) {
    return
  }
  const toggle = page.getByTestId('quick-actions-toggle')
  await expect(toggle).toBeVisible({ timeout: 4000 })
  await toggle.click()
  await expect(menu).toBeVisible({ timeout: 4000 })
}

async function clickAssetRow(assetName: string, modifiers?: Array<'Shift'>) {
  const page = getPage()
  const assetsPanel = page.locator('section[aria-label="Liste des assets"]')
  const row = assetsPanel.locator('[data-asset-id]', { hasText: assetName }).first()
  const openButton = row.locator('[data-asset-open="true"]').first()
  await expect(row).toBeVisible({ timeout: 5000 })
  await row.scrollIntoViewIfNeeded()

  const targets = [openButton, row]
  for (let attempt = 0; attempt < 3; attempt += 1) {
    for (const target of targets) {
      try {
        await target.click({
          modifiers,
          timeout: 2500,
          force: attempt > 0,
        })
        await page.waitForTimeout(50)
        return
      } catch {
        // Retry with alternate target and a force-click pass.
      }
    }
  }

  throw new Error(`Asset introuvable/non cliquable: ${assetName}`)
}

async function clickNamedButton(label: string) {
  const page = getPage()
  const tryClick = async (
    locator: ReturnType<typeof page.getByRole> | ReturnType<typeof page.getByTestId>,
    timeout = 4000,
  ) => {
    try {
      await expect(locator).toBeEnabled({ timeout })
      await locator.click()
      return true
    } catch {
      return false
    }
  }

  const normalized = label.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
  const navByAlias: Array<{ aliases: string[]; testId: string }> = [
    { aliases: ['review'], testId: 'nav-review' },
    { aliases: ['bibliotheque', 'library'], testId: 'nav-library' },
    { aliases: ['activite', 'rejects', 'rejets'], testId: 'nav-activity' },
  ]
  const aliasMatch = navByAlias.find((entry) => entry.aliases.includes(normalized))
  if (aliasMatch) {
    if (await tryClick(page.getByTestId(aliasMatch.testId), 6000)) {
      return
    }
  }

  if (normalized === "rafraichir l'asset") {
    if (await tryClick(page.getByTestId('asset-refresh-action'), 6000)) {
      return
    }
  }

  const quickActionLabels = new Set([
    'standard',
    'a traiter',
    'voir a traiter',
    'conserver visibles',
    'rejeter visibles',
    'reinitialiser filtres',
    'densite: confortable',
    'densite: compacte',
    'images rejetees',
    'review media (30j)',
    'review media (30d)',
    'a traiter (7j)',
    'pending (7d)',
    'default',
    'pending',
    'show pending',
    'keep visible',
    'reject visible',
    'reset filters',
    'density: comfortable',
    'density: compact',
  ])
  if (quickActionLabels.has(normalized)) {
    await openQuickActionsMenuIfNeeded()
  }

  if (await tryClick(page.getByRole('button', { name: label, exact: true }), 3000)) {
    return
  }

  if (await tryClick(page.getByRole('button', { name: new RegExp(escapeRegExp(label), 'i') }).first(), 3000)) {
    return
  }

  throw new Error(`Bouton introuvable: ${label}`)
}

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
  await expect(getPage().getByRole('heading', { name: title, exact: true })).toBeVisible()
})

Then('l\'URL courante contient {string}', async (value: string) => {
  await expect(getPage()).toHaveURL(new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
})

When("je clique sur l'asset {string}", async (assetName: string) => {
  await clickAssetRow(assetName)
})

When('je fais Maj+clic sur l\'asset {string}', async (assetName: string) => {
  await clickAssetRow(assetName, ['Shift'])
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
  const firstRow = assetsPanel.locator('[data-asset-id]').first()
  await firstRow.getByRole('button', { name: /^(REJECT|Reject|Rejeter)$/i }).click()
})

Then('l\'état {string} est visible', async (stateLabel: string) => {
  const [assetId, expectedState] = stateLabel.split(' - ')
  if (!assetId || !expectedState) {
    throw new Error(`Format d'état invalide: ${stateLabel}`)
  }
  const assetsPanel = getPage().locator('section[aria-label="Liste des assets"]')
  const row = assetsPanel.locator(`[data-asset-id="${assetId}"]`)
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
  await clickNamedButton(buttonLabel)
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
  const normalized = buttonLabel.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
  if (
    normalized.includes('densite:') ||
    normalized.includes('density:') ||
    normalized.includes('voir a traiter') ||
    normalized.includes('show pending') ||
    normalized.includes('images rejetees') ||
    normalized.includes('rejected images')
  ) {
    await openQuickActionsMenuIfNeeded()
  }
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
  const normalized = status.trim().toUpperCase()
  const aliases: Record<string, string[]> = {
    DONE: ['DONE', 'Done', 'Terminé'],
    PARTIAL: ['PARTIAL', 'Partial', 'Partiel'],
    FAILED: ['FAILED', 'Failed', 'Échec'],
    UNKNOWN: ['UNKNOWN', 'Unknown', 'Inconnu'],
  }
  const expectedValues = aliases[normalized] ?? [status]
  const expectedPattern = new RegExp(`^(?:${expectedValues.map(escapeRegExp).join('|')})$`, 'i')
  await expect(getPage().getByTestId('batch-report-status-value')).toHaveText(expectedPattern)
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
  const row = assetsPanel.locator(`[data-asset-id="${assetId}"]`).first()
  if (selected === 'true') {
    await expect(row).toHaveAttribute('aria-current', 'true')
    return
  }
  await expect(row).not.toHaveAttribute('aria-current', 'true')
})

Then('la ligne asset {string} a tabindex {string}', async (assetId: string, tabIndex: string) => {
  const assetsPanel = getPage().locator('section[aria-label="Liste des assets"]')
  const rowButton = assetsPanel.locator(`[data-asset-id="${assetId}"] [data-asset-open="true"]`).first()
  await expect(rowButton).toHaveAttribute('tabindex', tabIndex)
})

Then('la ligne asset {string} a le focus', async (assetId: string) => {
  const assetsPanel = getPage().locator('section[aria-label="Liste des assets"]')
  const rowButton = assetsPanel.locator(`[data-asset-id="${assetId}"] [data-asset-open="true"]`).first()
  await expect(rowButton).toBeFocused()
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
  if (testId.startsWith('quick-view-')) {
    await openQuickActionsMenuIfNeeded()
  }
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
