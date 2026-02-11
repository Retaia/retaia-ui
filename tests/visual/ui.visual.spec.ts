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
