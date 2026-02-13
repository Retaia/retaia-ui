import { describe, expect, it, vi } from 'vitest'
import { ApiError, createApiClient } from './client'

describe('api client', () => {
  it('builds query string and returns parsed JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const api = createApiClient('/api/v1', fetchMock)
    await api.listAssets({ state: 'DECISION_PENDING', limit: 10 })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/assets?state=DECISION_PENDING&limit=10',
      expect.any(Object),
    )
  })

  it('throws ApiError with payload details', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 'STATE_CONFLICT',
          message: 'invalid state',
          retryable: false,
          correlation_id: 'corr-1',
        }),
        {
          status: 409,
          headers: { 'content-type': 'application/json' },
        },
      ),
    )

    const api = createApiClient('/api/v1', fetchMock)

    await expect(
      api.executeMoveBatch({ mode: 'EXECUTE', selection: {} }, 'idem-1'),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      payload: { code: 'STATE_CONFLICT' },
    })
  })

  it('sends idempotency key for batch execution', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, { status: 200 }),
    )

    const api = createApiClient('/api/v1', fetchMock)
    await api.executeMoveBatch({ mode: 'DRY_RUN', selection: { include: 'KEEP' } }, 'idem-2')

    const requestInit = fetchMock.mock.calls[0]?.[1]
    expect(requestInit?.headers).toMatchObject({
      'Idempotency-Key': 'idem-2',
      'Content-Type': 'application/json',
    })
  })

  it('exports ApiError type for consumers', () => {
    const error = new ApiError(500, 'oops')
    expect(error.name).toBe('ApiError')
  })

  it('adds bearer auth and credentials when configured', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const api = createApiClient({
      baseUrl: '/api/v1',
      fetchImpl: fetchMock,
      getAccessToken: () => 'token-123',
    })

    await api.listAssets()
    const requestInit = fetchMock.mock.calls[0]?.[1]
    expect(requestInit?.credentials).toBe('include')
    expect(requestInit?.headers).toMatchObject({
      Authorization: 'Bearer token-123',
    })
  })

  it('calls onAuthError for 401 and 403', async () => {
    const onAuthError = vi.fn()
    const fetch401 = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 'FORBIDDEN_SCOPE',
          message: 'forbidden',
          retryable: false,
          correlation_id: 'c-1',
        }),
        { status: 403, headers: { 'content-type': 'application/json' } },
      ),
    )
    const api = createApiClient({
      baseUrl: '/api/v1',
      fetchImpl: fetch401,
      onAuthError,
    })

    await expect(api.previewMoveBatch({ include: 'KEEP' })).rejects.toBeInstanceOf(ApiError)
    expect(onAuthError).toHaveBeenCalledWith(
      403,
      expect.objectContaining({ code: 'FORBIDDEN_SCOPE' }),
    )
  })

  it('calls purge preview endpoint for one asset', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    const api = createApiClient('/api/v1', fetchMock)

    await api.previewAssetPurge('A-003')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/assets/A-003/purge/preview',
      expect.objectContaining({
        method: 'POST',
      }),
    )
  })

  it('sends idempotency key for purge execution', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    const api = createApiClient('/api/v1', fetchMock)

    await api.executeAssetPurge('A-003', 'idem-purge-1')

    const requestInit = fetchMock.mock.calls[0]?.[1]
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/assets/A-003/purge', expect.any(Object))
    expect(requestInit?.headers).toMatchObject({
      'Idempotency-Key': 'idem-purge-1',
      'Content-Type': 'application/json',
    })
    expect(requestInit?.body).toBe(JSON.stringify({ confirm: true }))
  })

  it('sends asset metadata patch payload with PATCH method', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    const api = createApiClient('/api/v1', fetchMock)

    await api.updateAssetMetadata('A-001', {
      tags: ['urgent', 'interview'],
      notes: 'needs manual check',
      fields: { priority: 'high' },
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/assets/A-001',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          tags: ['urgent', 'interview'],
          notes: 'needs manual check',
          fields: { priority: 'high' },
        }),
      }),
    )
  })

  it('skips undefined query params when building query string', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const api = createApiClient('/api/v1', fetchMock)
    await api.listAssets({ state: 'DECISION_PENDING', cursor: undefined, limit: undefined })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/assets?state=DECISION_PENDING',
      expect.any(Object),
    )
  })

  it('falls back to generic HTTP message when error payload is invalid', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('oops', {
        status: 500,
        headers: { 'content-type': 'text/plain' },
      }),
    )
    const api = createApiClient('/api/v1', fetchMock)

    await expect(api.listAssets()).rejects.toMatchObject({
      status: 500,
      message: 'HTTP 500',
    })
  })

  it('returns undefined for 204 and non-json responses', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(
        new Response('ok', {
          status: 200,
          headers: { 'content-type': 'text/plain' },
        }),
      )

    const api = createApiClient('/api/v1', fetchMock)
    await expect(api.previewMoveBatch({ include: 'KEEP' })).resolves.toBeUndefined()
    await expect(api.previewMoveBatch({ include: 'REJECT' })).resolves.toBeUndefined()
  })

  it('returns an empty list when items is missing in listAssetSummaries', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ next_cursor: null }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    const api = createApiClient('/api/v1', fetchMock)

    await expect(api.listAssetSummaries()).resolves.toEqual([])
  })

  it('gets one asset detail and validates summary presence', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          summary: {
            uuid: 'A-001',
            media_type: 'VIDEO',
            state: 'DECISION_PENDING',
            created_at: '2026-02-12T10:00:00Z',
          },
          derived: {
            proxy_video_url: '/derived/A-001/proxy.mp4',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    const api = createApiClient('/api/v1', fetchMock)

    const detail = await api.getAssetDetail('A-001')
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/assets/A-001', expect.any(Object))
    expect(detail.summary.uuid).toBe('A-001')
  })

  it('throws validation error when asset detail payload has no summary', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ derived: {} }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    const api = createApiClient('/api/v1', fetchMock)

    await expect(api.getAssetDetail('A-001')).rejects.toMatchObject({
      status: 502,
      payload: { code: 'VALIDATION_FAILED' },
    })
  })

  it('throws validation error when listAssetSummaries payload shape is invalid', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ items: 'nope' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    const api = createApiClient('/api/v1', fetchMock)

    await expect(api.listAssetSummaries()).rejects.toMatchObject({
      status: 502,
      payload: { code: 'VALIDATION_FAILED' },
    })
  })

  it('throws validation error when batch report payload is not an object', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(['invalid']), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    const api = createApiClient('/api/v1', fetchMock)

    await expect(api.getMoveBatchReport('batch-1')).rejects.toMatchObject({
      status: 502,
      payload: { code: 'VALIDATION_FAILED' },
    })
  })

  it('retries retryable temporary errors and notifies onRetry', async () => {
    const onRetry = vi.fn()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 'TEMPORARY_UNAVAILABLE',
            message: 'temporary unavailable',
            retryable: true,
            correlation_id: 'retry-1',
          }),
          {
            status: 503,
            headers: { 'content-type': 'application/json' },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [], next_cursor: null }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
    const api = createApiClient({
      baseUrl: '/api/v1',
      fetchImpl: fetchMock,
      onRetry,
      retry: { maxRetries: 2, baseDelayMs: 0 },
    })

    await expect(api.listAssets()).resolves.toEqual({ items: [], next_cursor: null })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(onRetry).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/assets',
        method: 'GET',
        attempt: 1,
        maxRetries: 2,
      }),
    )
  })

  it('does not retry non-retryable api errors', async () => {
    const onRetry = vi.fn()
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 'STATE_CONFLICT',
          message: 'invalid state',
          retryable: false,
          correlation_id: 'no-retry',
        }),
        {
          status: 409,
          headers: { 'content-type': 'application/json' },
        },
      ),
    )
    const api = createApiClient({
      baseUrl: '/api/v1',
      fetchImpl: fetchMock,
      onRetry,
      retry: { maxRetries: 2, baseDelayMs: 0 },
    })

    await expect(
      api.executeMoveBatch({ mode: 'EXECUTE', selection: {} }, 'idem-nr'),
    ).rejects.toMatchObject({
      status: 409,
      payload: { code: 'STATE_CONFLICT' },
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(onRetry).not.toHaveBeenCalled()
  })
})
