import { expect, test, type Page } from '@playwright/test'

const disableMotion = async (page: Page) => {
  await page.addStyleTag({
    content:
      '*,:before,:after{transition:none!important;animation:none!important;caret-color:transparent!important}',
  })
}

test('summary cards visual baseline', async ({ page }) => {
  await page.goto('/')
  await disableMotion(page)
  await expect(page.locator('[aria-label="Résumé des assets"]')).toHaveScreenshot(
    'summary-cards.png',
  )
})

test('list and detail panel baseline', async ({ page }) => {
  await page.goto('/')
  await disableMotion(page)
  await page.getByText('behind-the-scenes.jpg').first().click()
  await expect(page.locator('main')).toHaveScreenshot('list-detail-open.png')
})

test('batch and activity state baseline', async ({ page }) => {
  await page.goto('/')
  await disableMotion(page)
  await page.keyboard.down('Shift')
  await page.getByText('interview-camera-a.mov').first().click()
  await page.getByText('behind-the-scenes.jpg').first().click()
  await page.keyboard.up('Shift')
  await page.getByRole('button', { name: 'KEEP batch' }).click()
  await expect(page.locator('main')).toHaveScreenshot('batch-activity-state.png')
})

test('batch report success table baseline', async ({ page }) => {
  await page.route('**/api/v1/batches/moves', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ batch_id: 'batch-visual-1' }),
    })
  })
  await page.route('**/api/v1/batches/moves/batch-visual-1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'DONE',
        moved: 2,
        failed: 1,
        errors: [{ asset_id: 'A-003', reason: 'disk_full' }],
      }),
    })
  })

  await page.goto('/')
  await disableMotion(page)
  await page.keyboard.down('Shift')
  await page.getByText('interview-camera-a.mov').first().click()
  await page.getByText('behind-the-scenes.jpg').first().click()
  await page.keyboard.up('Shift')
  await page.getByRole('button', { name: 'Exécuter batch' }).click()
  await page.getByRole('button', { name: 'Rafraîchir rapport' }).click()
  await expect(page.locator('main')).toHaveScreenshot('batch-report-success-table.png')
})

test('preview error message baseline', async ({ page }) => {
  await page.route('**/api/v1/batches/moves/preview', async (route) => {
    await route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'FORBIDDEN_SCOPE',
        message: 'forbidden',
        retryable: false,
        correlation_id: 'visual-1',
      }),
    })
  })
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
  await page.route('**/api/v1/batches/moves', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ batch_id: 'batch-loading-1' }),
    })
  })

  await page.goto('/')
  await disableMotion(page)
  const assetsPanel = page.locator('section[aria-label="Liste des assets"]')
  await page.keyboard.down('Shift')
  await assetsPanel.getByText('interview-camera-a.mov').first().click()
  await page.keyboard.up('Shift')
  await page.getByRole('button', { name: 'Exécuter batch' }).click()
  await expect(page.locator('main')).toHaveScreenshot('execute-loading-state.png')
})
