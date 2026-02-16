import type {
  AppFeaturesResponse,
  AppFeaturesUpdatePayload,
  AssetDecisionPayload,
  AssetMetadataPatchPayload,
  Auth2faOtpPayload,
  AuthEmailPayload,
  AuthLoginPayload,
  AuthLoginResponse,
  AuthLostPasswordResetPayload,
  AuthTokenPayload,
  ListAssetsQuery,
  ListAssetsResponse,
  MoveExecutePayload,
  MoveExecuteResponse,
  MovePreviewPayload,
  PurgeExecutePayload,
  UserFeaturesUpdatePayload,
  UserFeaturesResponse,
} from './contracts'
import {
  parseAppFeaturesResponse,
  parseAppPolicyResponse,
  parseAssetDetailResponse,
  parseAssetSummariesResponse,
  parseAuth2faSetupResponse,
  parseCurrentUserResponse,
  parseMoveExecuteResponse,
  parseMoveReportResponse,
  parseUserFeaturesResponse,
} from './parsers'
import { ApiError, type ApiErrorPayload } from './errors'
import { buildQueryString, createRequest, resolveConfig, type ApiClientConfig } from './transport'

export { ApiError }
export type { ApiErrorPayload, ApiClientConfig }

export function createApiClient(
  baseUrlOrConfig: string | ApiClientConfig = '/api/v1',
  legacyFetchImpl?: typeof fetch,
) {
  const config = resolveConfig(baseUrlOrConfig, legacyFetchImpl)
  const request = createRequest(config)

  return {
    listAssets: (query?: ListAssetsQuery) =>
      request<ListAssetsResponse>(`/assets${buildQueryString(query)}`),

    listAssetSummaries: async (query?: ListAssetsQuery) => {
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

    getAppFeatures: async () => {
      const path = '/app/features'
      const result = await request<unknown>(path)
      return parseAppFeaturesResponse(result, path)
    },

    updateAppFeatures: (payload: AppFeaturesUpdatePayload) =>
      request<AppFeaturesResponse>('/app/features', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),

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

    requestEmailVerification: (payload: AuthEmailPayload) =>
      request<void>('/auth/verify-email/request', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    confirmEmailVerification: (payload: AuthTokenPayload) =>
      request<void>('/auth/verify-email/confirm', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    adminConfirmEmailVerification: (payload: AuthEmailPayload) =>
      request<void>('/auth/verify-email/admin-confirm', {
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
