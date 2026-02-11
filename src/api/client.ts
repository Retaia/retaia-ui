import type { components, paths } from './generated/openapi'

type FetchLike = typeof fetch

type ListAssetsQuery = NonNullable<paths['/assets']['get']['parameters']['query']>
type ListAssetsResponse =
  paths['/assets']['get']['responses'][200]['content']['application/json']
type AssetSummary = components['schemas']['AssetSummary']

type MovePreviewPayload =
  paths['/batches/moves/preview']['post']['requestBody']['content']['application/json']
type MoveExecutePayload =
  paths['/batches/moves']['post']['requestBody']['content']['application/json']
type MoveExecuteResponse =
  paths['/batches/moves']['post']['responses'][200]['content'] extends never
    ? Record<string, unknown> | void
    : paths['/batches/moves']['post']['responses'][200]['content']['application/json']
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

export function createApiClient(baseUrl = '/api/v1', fetchImpl: FetchLike = fetch) {
  const request = async <TResponse>(
    path: string,
    init?: RequestInit,
  ): Promise<TResponse> => {
    const response = await fetchImpl(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })

    if (!response.ok) {
      throw await parseApiError(response)
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
