import type { components, paths } from './generated/openapi'

type FetchLike = typeof fetch
type AuthStatus = 401 | 403

const defaultFetchImpl: FetchLike = (input, init) => globalThis.fetch(input, init)

type ListAssetsQuery = NonNullable<paths['/assets']['get']['parameters']['query']>
type ListAssetsResponse =
  paths['/assets']['get']['responses'][200]['content']['application/json']
type AssetSummary = components['schemas']['AssetSummary']

type MovePreviewPayload =
  paths['/batches/moves/preview']['post']['requestBody']['content']['application/json']
type MoveExecutePayload =
  paths['/batches/moves']['post']['requestBody']['content']['application/json']
type MoveExecuteResponse = Record<string, unknown> | void
type MoveStatusResponse =
  paths['/batches/moves/{batch_id}']['get']['responses'][200]['content']['application/json']

export type ApiErrorPayload = components['schemas']['ErrorResponse']

export class ApiError extends Error {
  status: number
  payload?: ApiErrorPayload

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export type ApiClientConfig = {
  baseUrl?: string
  fetchImpl?: FetchLike
  getAccessToken?: () => string | null | undefined
  onAuthError?: (status: AuthStatus, payload?: ApiErrorPayload) => void
  credentials?: RequestCredentials
}

function buildQueryString(query: Record<string, unknown> | undefined) {
  if (!query) {
    return ''
  }

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue
    }
    searchParams.set(key, String(value))
  }

  const result = searchParams.toString()
  return result ? `?${result}` : ''
}

async function parseApiError(response: Response) {
  try {
    const payload = (await response.json()) as ApiErrorPayload
    return new ApiError(response.status, payload.message, payload)
  } catch {
    return new ApiError(response.status, `HTTP ${response.status}`)
  }
}

function resolveConfig(
  baseUrlOrConfig: string | ApiClientConfig | undefined,
  legacyFetchImpl?: FetchLike,
) {
  if (typeof baseUrlOrConfig === 'object' && baseUrlOrConfig !== null) {
    return {
      baseUrl: baseUrlOrConfig.baseUrl ?? '/api/v1',
      fetchImpl: baseUrlOrConfig.fetchImpl ?? defaultFetchImpl,
      getAccessToken: baseUrlOrConfig.getAccessToken,
      onAuthError: baseUrlOrConfig.onAuthError,
      credentials: baseUrlOrConfig.credentials ?? 'include',
    }
  }

  return {
    baseUrl: baseUrlOrConfig ?? '/api/v1',
    fetchImpl: legacyFetchImpl ?? defaultFetchImpl,
    getAccessToken: undefined,
    onAuthError: undefined,
    credentials: 'include' as RequestCredentials,
  }
}

export function createApiClient(
  baseUrlOrConfig: string | ApiClientConfig = '/api/v1',
  legacyFetchImpl?: FetchLike,
) {
  const config = resolveConfig(baseUrlOrConfig, legacyFetchImpl)
  const request = async <TResponse>(
    path: string,
    init?: RequestInit,
  ): Promise<TResponse> => {
    const accessToken = config.getAccessToken?.()
    const response = await config.fetchImpl(`${config.baseUrl}${path}`, {
      ...init,
      credentials: config.credentials,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(init?.headers ?? {}),
      },
    })

    if (!response.ok) {
      const apiError = await parseApiError(response)
      if (response.status === 401 || response.status === 403) {
        config.onAuthError?.(response.status, apiError.payload)
      }
      throw apiError
    }

    if (response.status === 204) {
      return undefined as TResponse
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      return undefined as TResponse
    }

    return (await response.json()) as TResponse
  }

  return {
    listAssets: (query?: ListAssetsQuery) =>
      request<ListAssetsResponse>(`/assets${buildQueryString(query)}`),

    listAssetSummaries: async (query?: ListAssetsQuery): Promise<AssetSummary[]> => {
      const result = await request<ListAssetsResponse>(`/assets${buildQueryString(query)}`)
      return result.items ?? []
    },

    previewMoveBatch: (payload: MovePreviewPayload) =>
      request<void>('/batches/moves/preview', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    executeMoveBatch: (payload: MoveExecutePayload, idempotencyKey: string) =>
      request<MoveExecuteResponse>('/batches/moves', {
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload),
      }),

    getMoveBatchReport: (batchId: string) =>
      request<MoveStatusResponse>(`/batches/moves/${batchId}`),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
