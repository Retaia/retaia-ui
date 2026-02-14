import type { components, paths } from './generated/openapi'

type FetchLike = typeof fetch
type AuthStatus = 401 | 403

const defaultFetchImpl: FetchLike = (input, init) => globalThis.fetch(input, init)

type ListAssetsQuery = NonNullable<paths['/assets']['get']['parameters']['query']>
type ListAssetsResponse =
  paths['/assets']['get']['responses'][200]['content']['application/json']
type AssetSummary = components['schemas']['AssetSummary']
type AssetDetail =
  paths['/assets/{uuid}']['get']['responses'][200]['content']['application/json']

type MovePreviewPayload =
  paths['/batches/moves/preview']['post']['requestBody']['content']['application/json']
type MoveExecutePayload =
  paths['/batches/moves']['post']['requestBody']['content']['application/json']
type MoveExecuteResponse = Record<string, unknown> | void
type MoveStatusResponse =
  paths['/batches/moves/{batch_id}']['get']['responses'][200]['content']['application/json']
type PurgeExecutePayload =
  paths['/assets/{uuid}/purge']['post']['requestBody']['content']['application/json']
type AssetMetadataPatchPayload =
  paths['/assets/{uuid}']['patch']['requestBody']['content']['application/json']
type AssetDecisionPayload =
  paths['/assets/{uuid}/decision']['post']['requestBody']['content']['application/json']
type AppPolicyResponse =
  paths['/app/policy']['get']['responses'][200]['content']['application/json']
type AuthLoginPayload = components['schemas']['AuthLoginRequest']
type AuthLoginResponse = components['schemas']['AuthLoginSuccess']
type AuthCurrentUserResponse = components['schemas']['AuthCurrentUser']
type UserFeaturesResponse =
  paths['/auth/me/features']['get']['responses'][200]['content']['application/json']
type UserFeaturesUpdatePayload =
  paths['/auth/me/features']['patch']['requestBody']['content']['application/json']
type Auth2faSetupResponse =
  paths['/auth/2fa/setup']['post']['responses'][200]['content']['application/json']
type Auth2faOtpPayload =
  paths['/auth/2fa/enable']['post']['requestBody']['content']['application/json']
type AuthEmailPayload =
  paths['/auth/lost-password/request']['post']['requestBody']['content']['application/json']
type AuthLostPasswordResetPayload =
  paths['/auth/lost-password/reset']['post']['requestBody']['content']['application/json']

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

function isRetryableError(error: ApiError) {
  return (
    error.payload?.retryable === true ||
    error.payload?.code === 'TEMPORARY_UNAVAILABLE' ||
    error.status >= 500
  )
}

function sleep(ms: number) {
  if (ms <= 0) {
    return Promise.resolve()
  }
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function createValidationError(path: string, detail: string) {
  return new ApiError(502, `Invalid API response for ${path}: ${detail}`, {
    code: 'VALIDATION_FAILED',
    message: `Invalid API response for ${path}: ${detail}`,
    retryable: false,
    correlation_id: 'client-validation',
  })
}

function parseAssetSummariesResponse(payload: unknown, path: string): AssetSummary[] {
  if (!isRecord(payload)) {
    throw createValidationError(path, 'expected object')
  }
  const items = payload.items
  if (items === undefined || items === null) {
    return []
  }
  if (!Array.isArray(items)) {
    throw createValidationError(path, 'expected items array')
  }
  if (items.some((item) => !isRecord(item))) {
    throw createValidationError(path, 'expected each item to be an object')
  }
  return items as AssetSummary[]
}

function parseMoveExecuteResponse(payload: unknown, path: string) {
  if (payload === undefined) {
    return undefined
  }
  if (!isRecord(payload)) {
    throw createValidationError(path, 'expected object or empty response')
  }
  return payload
}

function parseMoveReportResponse(payload: unknown, path: string) {
  if (!isRecord(payload)) {
    throw createValidationError(path, 'expected object')
  }
  return payload as MoveStatusResponse
}

function parseAssetDetailResponse(payload: unknown, path: string) {
  if (!isRecord(payload)) {
    throw createValidationError(path, 'expected object')
  }
  if (!isRecord(payload.summary)) {
    throw createValidationError(path, 'expected summary object')
  }
  return payload as AssetDetail
}

function parseAppPolicyResponse(payload: unknown, path: string) {
  if (!isRecord(payload)) {
    throw createValidationError(path, 'expected object')
  }
  const serverPolicy = payload.server_policy
  if (!isRecord(serverPolicy)) {
    throw createValidationError(path, 'expected server_policy object')
  }
  const featureFlags = serverPolicy.feature_flags
  if (!isRecord(featureFlags)) {
    throw createValidationError(path, 'expected server_policy.feature_flags object')
  }
  const normalizedFeatureFlags = Object.entries(featureFlags).reduce<Record<string, boolean>>(
    (accumulator, [key, value]) => {
      if (typeof value === 'boolean') {
        accumulator[key] = value
      }
      return accumulator
    },
    {},
  )
  return {
    ...(payload as AppPolicyResponse),
    server_policy: {
      ...serverPolicy,
      feature_flags: normalizedFeatureFlags,
    },
  } as AppPolicyResponse & { server_policy: { feature_flags: Record<string, boolean> } }
}

function parseCurrentUserResponse(payload: unknown, path: string) {
  if (!isRecord(payload)) {
    throw createValidationError(path, 'expected object')
  }
  if (typeof payload.email !== 'string' || payload.email.length === 0) {
    throw createValidationError(path, 'expected non-empty email')
  }
  return payload as AuthCurrentUserResponse
}

function parseUserFeaturesResponse(payload: unknown, path: string) {
  if (!isRecord(payload)) {
    throw createValidationError(path, 'expected object')
  }
  if (!isRecord(payload.user_feature_enabled)) {
    throw createValidationError(path, 'expected user_feature_enabled object')
  }
  if (!isRecord(payload.effective_feature_enabled)) {
    throw createValidationError(path, 'expected effective_feature_enabled object')
  }
  if (!Array.isArray(payload.feature_governance)) {
    throw createValidationError(path, 'expected feature_governance array')
  }
  return payload as UserFeaturesResponse
}

function parseAuth2faSetupResponse(payload: unknown, path: string) {
  if (!isRecord(payload)) {
    throw createValidationError(path, 'expected object')
  }
  if (typeof payload.secret !== 'string' || payload.secret.length === 0) {
    throw createValidationError(path, 'expected non-empty secret')
  }
  if (typeof payload.otpauth_uri !== 'string' || payload.otpauth_uri.length === 0) {
    throw createValidationError(path, 'expected non-empty otpauth_uri')
  }
  return payload as Auth2faSetupResponse
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
      const delay = config.retry.baseDelayMs * 2 ** (attempt - 1)
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

  return {
    listAssets: (query?: ListAssetsQuery) =>
      request<ListAssetsResponse>(`/assets${buildQueryString(query)}`),

    listAssetSummaries: async (query?: ListAssetsQuery): Promise<AssetSummary[]> => {
      const path = `/assets${buildQueryString(query)}`
      const result = await request<unknown>(path)
      return parseAssetSummariesResponse(result, path)
    },

    getAssetDetail: async (assetId: string) => {
      const path = `/assets/${assetId}`
      const result = await request<unknown>(path)
      return parseAssetDetailResponse(result, path)
    },

    getAppPolicy: async () => {
      const path = '/app/policy'
      const result = await request<unknown>(path)
      return parseAppPolicyResponse(result, path)
    },

    login: (payload: AuthLoginPayload) =>
      request<AuthLoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    requestLostPassword: (payload: AuthEmailPayload) =>
      request<void>('/auth/lost-password/request', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    resetLostPassword: (payload: AuthLostPasswordResetPayload) =>
      request<void>('/auth/lost-password/reset', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getCurrentUser: async () => {
      const path = '/auth/me'
      const result = await request<unknown>(path)
      return parseCurrentUserResponse(result, path)
    },

    getUserFeatures: async () => {
      const path = '/auth/me/features'
      const result = await request<unknown>(path)
      return parseUserFeaturesResponse(result, path)
    },

    updateUserFeatures: (payload: UserFeaturesUpdatePayload) =>
      request<UserFeaturesResponse>('/auth/me/features', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),

    logout: () =>
      request<void>('/auth/logout', {
        method: 'POST',
      }),

    setup2fa: async () => {
      const path = '/auth/2fa/setup'
      const result = await request<unknown>(path, {
        method: 'POST',
      })
      return parseAuth2faSetupResponse(result, path)
    },

    enable2fa: (payload: Auth2faOtpPayload) =>
      request<void>('/auth/2fa/enable', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    disable2fa: (payload: Auth2faOtpPayload) =>
      request<void>('/auth/2fa/disable', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    previewMoveBatch: (payload: MovePreviewPayload) =>
      request<void>('/batches/moves/preview', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    executeMoveBatch: async (payload: MoveExecutePayload, idempotencyKey: string) => {
      const path = '/batches/moves'
      const response = await request<unknown>(path, {
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload),
      })
      return parseMoveExecuteResponse(response, path) as MoveExecuteResponse
    },

    getMoveBatchReport: async (batchId: string) => {
      const path = `/batches/moves/${batchId}`
      const response = await request<unknown>(path)
      return parseMoveReportResponse(response, path)
    },

    previewAssetPurge: (assetId: string) =>
      request<void>(`/assets/${assetId}/purge/preview`, {
        method: 'POST',
      }),

    executeAssetPurge: (assetId: string, idempotencyKey: string) =>
      request<void>(`/assets/${assetId}/purge`, {
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({ confirm: true } satisfies PurgeExecutePayload),
      }),

    updateAssetMetadata: (assetId: string, payload: AssetMetadataPatchPayload) =>
      request<void>(`/assets/${assetId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),

    submitAssetDecision: (assetId: string, payload: AssetDecisionPayload, idempotencyKey: string) =>
      request<void>(`/assets/${assetId}/decision`, {
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload),
      }),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
