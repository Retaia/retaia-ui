import type { Page, Route } from '@playwright/test'
import { assertMockApiRoutesAlignWithOpenApi } from './openApiContract'

export type MockApiState = {
  assetsListShouldFail: boolean
  assetsListDelayMs: number
  assetsListMalformed: boolean
  previewShouldFailScope: boolean
  previewTemporaryOnce: boolean
  previewTemporaryCalls: number
  executeShouldFailStateConflict: boolean
  reportShouldFailTemporary: boolean
  purgePreviewShouldFailScope: boolean
  purgeExecuteShouldFailStateConflict: boolean
  assetPatchShouldFailScope: boolean
  decisionShouldFailScope: boolean
  decisionShouldFailStateConflict: boolean
  decisionShouldFailStateConflictOnce: boolean
  decisionCalls: number
  lastPatchedAssetId: string | null
  lastPatchedPayload: {
    tags?: string[]
    notes?: string
    fields?: Record<string, unknown>
  } | null
}

export const createMockApiState = (): MockApiState => ({
  assetsListShouldFail: false,
  assetsListDelayMs: 0,
  assetsListMalformed: false,
  previewShouldFailScope: false,
  previewTemporaryOnce: false,
  previewTemporaryCalls: 0,
  executeShouldFailStateConflict: false,
  reportShouldFailTemporary: false,
  purgePreviewShouldFailScope: false,
  purgeExecuteShouldFailStateConflict: false,
  assetPatchShouldFailScope: false,
  decisionShouldFailScope: false,
  decisionShouldFailStateConflict: false,
  decisionShouldFailStateConflictOnce: false,
  decisionCalls: 0,
  lastPatchedAssetId: null,
  lastPatchedPayload: null,
})

export const resetMockApiState = (state: MockApiState) => {
  state.assetsListShouldFail = false
  state.assetsListDelayMs = 0
  state.assetsListMalformed = false
  state.previewShouldFailScope = false
  state.previewTemporaryOnce = false
  state.previewTemporaryCalls = 0
  state.executeShouldFailStateConflict = false
  state.reportShouldFailTemporary = false
  state.purgePreviewShouldFailScope = false
  state.purgeExecuteShouldFailStateConflict = false
  state.assetPatchShouldFailScope = false
  state.decisionShouldFailScope = false
  state.decisionShouldFailStateConflict = false
  state.decisionShouldFailStateConflictOnce = false
  state.decisionCalls = 0
  state.lastPatchedAssetId = null
  state.lastPatchedPayload = null
}

export const installMockApiRoutes = async (page: Page, state: MockApiState) => {
  // Guardrails: mocked BDD API must stay aligned with the OpenAPI source of truth.
  assertMockApiRoutesAlignWithOpenApi()

  await page.route('**/app/policy', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        server_policy: {
          feature_flags: {
            'features.decisions.bulk': true,
          },
        },
      }),
    })
  })

  await page.route('**/assets/*', async (route) => {
    const method = route.request().method()
    const match = route.request().url().match(/\/assets\/([^/?#]+)/)
    const assetId = match?.[1] ?? null

    if (method === 'GET' && assetId) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: {
            uuid: assetId,
            media_type: assetId === 'A-003' ? 'PHOTO' : 'VIDEO',
            state: assetId === 'A-003' ? 'DECIDED_REJECT' : 'DECISION_PENDING',
            created_at: new Date().toISOString(),
            captured_at: new Date().toISOString(),
            tags: assetId === 'A-003' ? ['photo'] : ['baseline'],
          },
          derived: {
            proxy_video_url: assetId === 'A-003' ? null : `/derived/${assetId}/proxy.mp4`,
            proxy_photo_url: assetId === 'A-003' ? `/derived/${assetId}/proxy.jpg` : null,
          },
          transcript: {
            status: 'DONE',
            text_preview: `Transcript for ${assetId}`,
          },
        }),
      })
      return
    }

    if (method === 'PATCH' && assetId) {
      state.lastPatchedAssetId = assetId
      const body = route.request().postData()
      state.lastPatchedPayload = body
        ? (JSON.parse(body) as MockApiState['lastPatchedPayload'])
        : null

      if (state.assetPatchShouldFailScope) {
        await route.fulfill({
          status: 410,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'FORBIDDEN_SCOPE',
            message: 'forbidden',
            retryable: false,
            correlation_id: 'bdd-corr-tagging-1',
          }),
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      })
      return
    }

    await route.fallback()
  })

  const handleAssetsList = async (route: Route) => {
    if (state.assetsListDelayMs > 0) {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, state.assetsListDelayMs)
      })
    }
    if (state.assetsListShouldFail) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: state.assetsListMalformed
          ? [
            {
              created_at: null,
            },
          ]
          : [
            {
              uuid: 'A-001',
              media_type: 'VIDEO',
              state: 'DECISION_PENDING',
              created_at: new Date().toISOString(),
              captured_at: new Date().toISOString(),
              tags: ['baseline'],
            },
            {
              uuid: 'A-003',
              media_type: 'PHOTO',
              state: 'DECIDED_REJECT',
              created_at: new Date().toISOString(),
              captured_at: new Date().toISOString(),
              tags: ['photo'],
            },
          ],
        next_cursor: null,
      }),
    })
  }

  await page.route('**/assets', handleAssetsList)
  await page.route('**/assets?*', handleAssetsList)

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

  await page.route('**/assets/*/decision', async (route) => {
    state.decisionCalls += 1
    const idempotencyKey = route.request().headerValue('idempotency-key')
    if (!idempotencyKey) {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'IDEMPOTENCY_CONFLICT',
          message: 'missing idempotency key',
          retryable: false,
          correlation_id: 'bdd-corr-decision-idem',
        }),
      })
      return
    }
    if (state.decisionShouldFailScope) {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'FORBIDDEN_SCOPE',
          message: 'forbidden',
          retryable: false,
          correlation_id: 'bdd-corr-decision-1',
        }),
      })
      return
    }
    if (state.decisionShouldFailStateConflict) {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'STATE_CONFLICT',
          message: 'state conflict',
          retryable: false,
          correlation_id: 'bdd-corr-decision-2',
        }),
      })
      return
    }
    if (state.decisionShouldFailStateConflictOnce) {
      state.decisionShouldFailStateConflictOnce = false
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'STATE_CONFLICT',
          message: 'state conflict',
          retryable: false,
          correlation_id: 'bdd-corr-decision-once',
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
