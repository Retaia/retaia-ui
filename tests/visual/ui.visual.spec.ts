import { expect, test, type Page } from '@playwright/test'

const disableMotion = async (page: Page) => {
  await page.addStyleTag({
    content:
      '*,:before,:after{transition:none!important;animation:none!important;caret-color:transparent!important}',
  })
}

const setStableUiStorage = async (page: Page) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('retaia_ui_shortcuts_help_seen', '1')
  })
}

test('summary cards visual baseline', async ({ page }) => {
  await setStableUiStorage(page)
  await page.goto('/')
  await disableMotion(page)
  await expect(page.locator('[aria-label="Résumé des assets"]')).toHaveScreenshot(
    'summary-cards.png',
  )
})

test('list and detail panel baseline', async ({ page }) => {
  await setStableUiStorage(page)
  await page.goto('/')
  await disableMotion(page)
  await page.getByText('behind-the-scenes.jpg').first().click()
  await expect(page.locator('main')).toHaveScreenshot('list-detail-open.png')
})

test('batch and activity state baseline', async ({ page }) => {
  await setStableUiStorage(page)
  await page.goto('/')
  await disableMotion(page)
  await page.getByRole('checkbox', { name: 'interview-camera-a.mov' }).check()
  await page.getByRole('checkbox', { name: 'behind-the-scenes.jpg' }).check()
  await page.getByRole('button', { name: 'Conserver batch' }).click()
  await expect(page.locator('main')).toHaveScreenshot('batch-activity-state.png')
})

test('batch report success table baseline', async ({ page }) => {
  await setStableUiStorage(page)
  await page.goto('/')
  await disableMotion(page)
  await page.getByRole('checkbox', { name: 'ambiance-plateau.wav' }).check()
  await page.getByRole('checkbox', { name: 'behind-the-scenes.jpg' }).check()
  await page.getByRole('button', { name: 'Exécuter batch' }).click()
  await page.getByRole('button', { name: 'Exécuter maintenant' }).click()
  await expect(page.locator('main')).toHaveScreenshot('batch-report-success-table.png')
})

test('preview error message baseline', async ({ page }) => {
  await setStableUiStorage(page)
  await page.goto('/')
  await disableMotion(page)
  const assetsPanel = page.locator('section[aria-label="Liste des assets"]')
  await page.keyboard.down('Shift')
  await assetsPanel.getByText('interview-camera-a.mov').first().click()
  await page.keyboard.up('Shift')
  await page.getByRole('button', { name: 'Prévisualiser batch' }).click()
  await expect(page.locator('main')).toHaveScreenshot('preview-error-state.png')
})

test('execute loading state baseline', async ({ page }) => {
  await setStableUiStorage(page)
  await page.goto('/')
  await disableMotion(page)
  await page.getByRole('checkbox', { name: 'ambiance-plateau.wav' }).check()
  await page.getByRole('checkbox', { name: 'behind-the-scenes.jpg' }).check()
  await page.getByRole('button', { name: 'Exécuter batch' }).click()
  await expect(page.locator('main')).toHaveScreenshot('execute-loading-state.png')
})

test('auth page baseline', async ({ page }) => {
  await setStableUiStorage(page)
  await page.goto('/auth')
  await disableMotion(page)
  await expect(page.locator('main')).toHaveScreenshot('auth-page.png')
})

test('settings page baseline', async ({ page }) => {
  await setStableUiStorage(page)
  await page.goto('/settings')
  await disableMotion(page)
  await expect(page.locator('main')).toHaveScreenshot('settings-page.png')
})

test('library page baseline', async ({ page }) => {
  await setStableUiStorage(page)
  await page.goto('/library')
  await disableMotion(page)
  await expect(page.locator('main')).toHaveScreenshot('library-page.png')
})

test('standalone detail review page baseline', async ({ page }) => {
  await setStableUiStorage(page)
  await page.goto('/review/asset/A-001')
  await disableMotion(page)
  await expect(page.locator('main')).toHaveScreenshot('review-standalone-detail-page.png')
})

test('rejects page baseline', async ({ page }) => {
  await setStableUiStorage(page)
  await page.goto('/rejects')
  await disableMotion(page)
  await expect(page.locator('main')).toHaveScreenshot('rejects-page.png')
})

test('account page baseline', async ({ page }) => {
  await setStableUiStorage(page)
  await page.goto('/account')
  await disableMotion(page)
  await expect(page.locator('main')).toHaveScreenshot('account-page.png')
})

test('activity page baseline', async ({ page }) => {
  await setStableUiStorage(page)
  await page.goto('/activity')
  await disableMotion(page)
  await expect(page.locator('main')).toHaveScreenshot('activity-page.png')
})
