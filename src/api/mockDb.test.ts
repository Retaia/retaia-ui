import { beforeEach, describe, expect, it } from 'vitest'
import { createApiClient } from './client'
import { createInMemoryMockApiFetch, isAppEnvTest, resetInMemoryMockDb } from './mockDb'

describe('in-memory mock db for APP_ENV=test', () => {
  beforeEach(() => {
    resetInMemoryMockDb()
  })

  it('detects test app env from APP_ENV and VITE_APP_ENV', () => {
    expect(isAppEnvTest({ APP_ENV: 'test' })).toBe(true)
    expect(isAppEnvTest({ VITE_APP_ENV: 'test' })).toBe(true)
    expect(isAppEnvTest({ APP_ENV: 'development' })).toBe(false)
  })

  it('supports auth and assets without real backend', async () => {
    const api = createApiClient({
      baseUrl: '/api/v1',
      fetchImpl: createInMemoryMockApiFetch(),
    })

    const login = await api.login({
      email: 'test.user@retaia.dev',
      password: 'any-secret',
    })

    expect(login.access_token).toBeTruthy()

    const authedApi = createApiClient({
      baseUrl: '/api/v1',
      fetchImpl: createInMemoryMockApiFetch(),
      getAccessToken: () => login.access_token,
    })

    const currentUser = await authedApi.getCurrentUser()
    expect(currentUser.email).toBe('test.user@retaia.dev')

    const sessions = await authedApi.listAuthSessions()
    expect(sessions.items.length).toBeGreaterThan(0)

    await authedApi.requestEmailVerification({ email: 'test.user@retaia.dev' })
    await authedApi.confirmEmailVerification({ token: 'verify-token' })
    await authedApi.adminConfirmEmailVerification({ email: 'test.user@retaia.dev' })

    const assets = await authedApi.listAssetSummaries()
    expect(assets.length).toBeGreaterThan(0)
  })

  it('persists user feature updates in memory', async () => {
    const api = createApiClient({
      baseUrl: '/api/v1',
      fetchImpl: createInMemoryMockApiFetch(),
      getAccessToken: () => 'test-token-memory',
    })

    const updated = await api.updateUserFeatures({
      user_feature_enabled: {
        'features.auth.2fa': false,
      },
    })

    expect(updated.user_feature_enabled['features.auth.2fa']).toBe(false)
    expect(updated.effective_feature_enabled['features.auth.2fa']).toBe(false)
  })

  it('handles 2fa setup, enable and disable', async () => {
    const api = createApiClient({
      baseUrl: '/api/v1',
      fetchImpl: createInMemoryMockApiFetch(),
      getAccessToken: () => 'test-token-memory',
    })

    const setup = await api.setup2fa()
    expect(setup.secret).toBeTruthy()
    expect(setup.otpauth_uri).toContain('otpauth://')

    await api.enable2fa({ otp_code: '123456' })
    const enabled = await api.getCurrentUser()
    expect(enabled.mfa_enabled).toBe(true)

    await api.disable2fa({ otp_code: '123456' })
    const disabled = await api.getCurrentUser()
    expect(disabled.mfa_enabled).toBe(false)
  })

  it('supports asset detail, metadata patch and decision updates', async () => {
    const api = createApiClient({
      baseUrl: '/api/v1',
      fetchImpl: createInMemoryMockApiFetch(),
      getAccessToken: () => 'test-token-memory',
    })

    const before = await api.getAssetDetail('A-001')
    expect(before.summary.uuid).toBe('A-001')

    await api.updateAssetMetadata('A-001', {
      tags: ['edited'],
      notes: 'updated note',
    })
    const afterPatch = await api.getAssetDetail('A-001')
    expect(afterPatch.summary.tags).toEqual(['edited'])

    await api.submitAssetDecision('A-001', { state: 'DECIDED_REJECT' })
    const afterDecision = await api.getAssetDetail('A-001')
    expect(afterDecision.summary.state).toBe('DECIDED_REJECT')
  })

  it('supports purge and batch routes in memory', async () => {
    const api = createApiClient({
      baseUrl: '/api/v1',
      fetchImpl: createInMemoryMockApiFetch(),
      getAccessToken: () => 'test-token-memory',
    })

    await api.previewAssetPurge('A-001')
    await api.executeAssetPurge('A-001', 'idem-purge-1')
    const purged = await api.getAssetDetail('A-001')
    expect(purged.summary.state).toBe('PURGED')

    await api.previewMoveBatch({ include: 'KEEP' })
    const execute = await api.executeMoveBatch({ mode: 'EXECUTE', selection: {} }, 'idem-batch-1')
    expect(execute).toMatchObject({ batch_id: 'BATCH-TEST-1' })
    const report = await api.getMoveBatchReport('BATCH-TEST-1')
    expect(report).toMatchObject({ completed: true })
  })

  it('supports reopen and reprocess routes in memory', async () => {
    const api = createApiClient({
      baseUrl: '/api/v1',
      fetchImpl: createInMemoryMockApiFetch(),
      getAccessToken: () => 'test-token-memory',
    })

    await api.reopenAsset('A-002', '"etag-reopen"')
    const reopened = await api.getAssetDetail('A-002')
    expect(reopened.summary.state).toBe('DECISION_PENDING')

    await api.reprocessAsset('A-003', 'idem-reprocess-memory', '"etag-reprocess"')
    const reprocessed = await api.getAssetDetail('A-003')
    expect(reprocessed.summary.state).toBe('READY')
  })

  it('filters asset summaries by state in memory', async () => {
    const api = createApiClient({
      baseUrl: '/api/v1',
      fetchImpl: createInMemoryMockApiFetch(),
      getAccessToken: () => 'test-token-memory',
    })

    const rejects = await api.listAssetSummaries({ state: 'REJECTED' })
    expect(rejects.some((asset) => asset.uuid === 'A-003')).toBe(true)

    await api.submitAssetDecision('A-003', { state: 'DECIDED_REJECT' })
    await api.executeAssetPurge('A-001', 'idem-purge-filter')

    const rejected = await api.listAssetSummaries({ state: 'DECIDED_REJECT' })
    expect(rejected.every((asset) => asset.state === 'DECIDED_REJECT')).toBe(true)
  })

  it('returns unauthorized and not found errors from mock routes', async () => {
    const apiNoAuth = createApiClient({
      baseUrl: '/api/v1',
      fetchImpl: createInMemoryMockApiFetch(),
    })
    await expect(apiNoAuth.getCurrentUser()).rejects.toMatchObject({
      status: 401,
      payload: { code: 'UNAUTHORIZED' },
    })

    const apiAuth = createApiClient({
      baseUrl: '/api/v1',
      fetchImpl: createInMemoryMockApiFetch(),
      getAccessToken: () => 'test-token-memory',
    })
    await expect(apiAuth.getAssetDetail('UNKNOWN-ASSET')).rejects.toMatchObject({
      status: 404,
      payload: { code: 'VALIDATION_FAILED' },
    })
  })

  it('returns app policy and mock route missing payload', async () => {
    const mockFetch = createInMemoryMockApiFetch()
    const api = createApiClient({
      baseUrl: '/api/v1',
      fetchImpl: mockFetch,
      getAccessToken: () => 'test-token-memory',
    })

    const policy = await api.getAppPolicy()
    expect(policy.server_policy?.feature_flags?.['features.decisions.bulk']).toBe(true)

    const appFeatures = await api.getAppFeatures()
    expect(appFeatures.app_feature_enabled['features.auth.2fa']).toBe(true)

    const updatedAppFeatures = await api.updateAppFeatures({
      app_feature_enabled: { 'features.auth.2fa': false },
    })
    expect(updatedAppFeatures.app_feature_enabled['features.auth.2fa']).toBe(false)

    const health = await api.getHealth()
    expect(health.status).toBe('ok')
    expect(health.self_healing.active).toBe(false)

    const unknownResponse = await mockFetch('/api/v1/unknown-endpoint', {
      method: 'GET',
      headers: { Authorization: 'Bearer test-token-memory' },
    })
    expect(unknownResponse.status).toBe(404)
    const payload = (await unknownResponse.json()) as { code: string }
    expect(payload.code).toBe('VALIDATION_FAILED')
  })

  it('supports revoking one session and revoking others in memory', async () => {
    const api = createApiClient({
      baseUrl: '/api/v1',
      fetchImpl: createInMemoryMockApiFetch(),
      getAccessToken: () => 'test-token-memory',
    })

    await expect(api.revokeAuthSession('session-current')).rejects.toMatchObject({
      status: 409,
      payload: { code: 'STATE_CONFLICT' },
    })

    await api.revokeAuthSession('session-other')
    let sessions = await api.listAuthSessions()
    expect(sessions.items.some((session) => session.session_id === 'session-other')).toBe(false)

    const revokeOthers = await api.revokeOtherAuthSessions()
    expect(revokeOthers.revoked).toBe(0)
    sessions = await api.listAuthSessions()
    expect(sessions.items).toHaveLength(1)
    expect(sessions.items[0]?.is_current).toBe(true)
  })
})
