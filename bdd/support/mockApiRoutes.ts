import type { Page } from '@playwright/test'

export type MockApiState = {
  previewShouldFailScope: boolean
  previewTemporaryOnce: boolean
  previewTemporaryCalls: number
  executeShouldFailStateConflict: boolean
  reportShouldFailTemporary: boolean
  purgePreviewShouldFailScope: boolean
  purgeExecuteShouldFailStateConflict: boolean
}

export const createMockApiState = (): MockApiState => ({
  previewShouldFailScope: false,
  previewTemporaryOnce: false,
  previewTemporaryCalls: 0,
  executeShouldFailStateConflict: false,
  reportShouldFailTemporary: false,
  purgePreviewShouldFailScope: false,
  purgeExecuteShouldFailStateConflict: false,
})

export const resetMockApiState = (state: MockApiState) => {
  state.previewShouldFailScope = false
  state.previewTemporaryOnce = false
  state.previewTemporaryCalls = 0
  state.executeShouldFailStateConflict = false
  state.reportShouldFailTemporary = false
  state.purgePreviewShouldFailScope = false
  state.purgeExecuteShouldFailStateConflict = false
}

export const installMockApiRoutes = async (page: Page, state: MockApiState) => {
  await page.route('**/batches/moves/preview', async (route) => {
    if (state.previewShouldFailScope) {
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
    if (state.previewTemporaryOnce && state.previewTemporaryCalls === 0) {
      state.previewTemporaryCalls += 1
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'TEMPORARY_UNAVAILABLE',
          message: 'temporary unavailable',
          retryable: true,
          correlation_id: 'bdd-corr-retry-preview',
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

  await page.route('**/batches/moves/batch-e2e-1', async (route) => {
    if (state.reportShouldFailTemporary) {
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

  await page.route('**/batches/moves', async (route) => {
    if (state.executeShouldFailStateConflict) {
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

  await page.route('**/assets/*/purge/preview', async (route) => {
    if (state.purgePreviewShouldFailScope) {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'FORBIDDEN_SCOPE',
          message: 'forbidden',
          retryable: false,
          correlation_id: 'bdd-corr-4',
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

  await page.route('**/assets/*/purge', async (route) => {
    if (state.purgeExecuteShouldFailStateConflict) {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'STATE_CONFLICT',
          message: 'state conflict',
          retryable: false,
          correlation_id: 'bdd-corr-5',
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
}
