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
})
