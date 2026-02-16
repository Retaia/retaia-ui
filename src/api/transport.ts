import { ApiError, type ApiErrorPayload } from './errors'

type FetchLike = typeof fetch
type AuthStatus = 401 | 403

const defaultFetchImpl: FetchLike = (input, init) => globalThis.fetch(input, init)
const RETRYABLE_429_CODES = new Set(['SLOW_DOWN', 'TOO_MANY_ATTEMPTS', 'RATE_LIMITED'])

export type ApiClientConfig = {
  baseUrl?: string
  fetchImpl?: FetchLike
  getAccessToken?: () => string | null | undefined
  onAuthError?: (status: AuthStatus, payload?: ApiErrorPayload) => void
  onRetry?: (context: {
    path: string
    method: string
    attempt: number
    maxRetries: number
    error: ApiError
  }) => void
  retry?: {
    maxRetries?: number
    baseDelayMs?: number
  }
  credentials?: RequestCredentials
}

type ResolvedApiConfig = {
  baseUrl: string
  fetchImpl: FetchLike
  getAccessToken?: () => string | null | undefined
  onAuthError?: (status: AuthStatus, payload?: ApiErrorPayload) => void
  onRetry?: ApiClientConfig['onRetry']
  retry: {
    maxRetries: number
    baseDelayMs: number
  }
  credentials: RequestCredentials
}

function isRetryableError(error: ApiError) {
  const errorCode = error.payload?.code
  return (
    error.payload?.retryable === true ||
    error.payload?.code === 'TEMPORARY_UNAVAILABLE' ||
    (error.status === 429 &&
      (errorCode === undefined || RETRYABLE_429_CODES.has(errorCode))) ||
    error.status >= 500
  )
}

function computeRetryDelayMs(baseDelayMs: number, attempt: number, error: ApiError) {
  const backoffDelay = baseDelayMs * 2 ** (attempt - 1)
  if (error.status !== 429) {
    return backoffDelay
  }
  const jitter = Math.floor(Math.random() * Math.max(baseDelayMs, 1))
  return backoffDelay + jitter
}

function sleep(ms: number) {
  if (ms <= 0) {
    return Promise.resolve()
  }
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function parseApiError(response: Response) {
  try {
    const payload = (await response.json()) as ApiErrorPayload
    return new ApiError(response.status, payload.message, payload)
  } catch {
    return new ApiError(response.status, `HTTP ${response.status}`)
  }
}

export function buildQueryString(query: Record<string, unknown> | undefined) {
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

export function resolveConfig(
  baseUrlOrConfig: string | ApiClientConfig | undefined,
  legacyFetchImpl?: FetchLike,
): ResolvedApiConfig {
  if (typeof baseUrlOrConfig === 'object' && baseUrlOrConfig !== null) {
    return {
      baseUrl: baseUrlOrConfig.baseUrl ?? '/api/v1',
      fetchImpl: baseUrlOrConfig.fetchImpl ?? defaultFetchImpl,
      getAccessToken: baseUrlOrConfig.getAccessToken,
      onAuthError: baseUrlOrConfig.onAuthError,
      onRetry: baseUrlOrConfig.onRetry,
      retry: {
        maxRetries: baseUrlOrConfig.retry?.maxRetries ?? 2,
        baseDelayMs: baseUrlOrConfig.retry?.baseDelayMs ?? 50,
      },
      credentials: baseUrlOrConfig.credentials ?? 'include',
    }
  }

  return {
    baseUrl: baseUrlOrConfig ?? '/api/v1',
    fetchImpl: legacyFetchImpl ?? defaultFetchImpl,
    getAccessToken: undefined,
    onAuthError: undefined,
    onRetry: undefined,
    retry: { maxRetries: 2, baseDelayMs: 50 },
    credentials: 'include',
  }
}

export function createRequest(config: ResolvedApiConfig) {
  return async function request<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
    const method = init?.method ?? 'GET'
    const maxRetries = config.retry.maxRetries
    let attempt = 0
    let response: Response | null = null

    while (attempt <= maxRetries) {
      const accessToken = config.getAccessToken?.()
      response = await config.fetchImpl(`${config.baseUrl}${path}`, {
        ...init,
        credentials: config.credentials,
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...(init?.headers ?? {}),
        },
      })

      if (response.ok) {
        break
      }

      const apiError = await parseApiError(response)
      if (response.status === 401 || response.status === 403) {
        config.onAuthError?.(response.status, apiError.payload)
      }

      if (attempt >= maxRetries || !isRetryableError(apiError)) {
        throw apiError
      }

      attempt += 1
      config.onRetry?.({
        path,
        method,
        attempt,
        maxRetries,
        error: apiError,
      })
      const delay = computeRetryDelayMs(config.retry.baseDelayMs, attempt, apiError)
      await sleep(delay)
    }

    if (!response) {
      throw new ApiError(500, 'HTTP 500')
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
}
