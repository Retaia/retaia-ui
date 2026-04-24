import type {
  AppFeaturesResponse,
  AppFeaturesUpdatePayload,
  AssetDecisionPayload,
  AssetMetadataPatchPayload,
  AssetProcessingProfilePatchPayload,
  Auth2faOtpPayload,
  AuthEmailPayload,
  AuthLoginPayload,
  AuthLoginResponse,
  AuthRevokeOthersResponse,
  AuthRefreshPayload,
  AuthSessionsResponse,
  AuthLostPasswordResetPayload,
  AuthTokenPayload,
  HealthResponse,
  ListAssetsQuery,
  ListAssetsResponse,
  PurgeExecutePayload,
  UserFeaturesUpdatePayload,
  UserFeaturesResponse,
  WebAuthnAuthenticateVerifyPayload,
  WebAuthnDeviceResponse,
  WebAuthnPublicKeyOptionsResponse,
  WebAuthnRegisterVerifyPayload,
} from './contracts'
import {
  parseAppFeaturesResponse,
  parseAppPolicyResponse,
  parseAssetDetailResponse,
  parseAssetSummariesResponse,
  parseAuth2faSetupResponse,
  parseAuthRevokeOthersResponse,
  parseAuthSessionsResponse,
  parseCurrentUserResponse,
  parseHealthResponse,
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
  const withIfMatchHeader = (ifMatch?: string | null) =>
    typeof ifMatch === 'string' && ifMatch.trim() !== ''
      ? { 'If-Match': ifMatch }
      : undefined

  return {
    listAssets: (query?: ListAssetsQuery) =>
      request<ListAssetsResponse>(`/assets${buildQueryString(query)}`),

    getHealth: async () => {
      const path = '/ops/readiness'
      const result = await request<unknown>(path)
      return parseHealthResponse(result, path) as HealthResponse
    },

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

    refreshAuthToken: (payload: AuthRefreshPayload) =>
      request<AuthLoginResponse>('/auth/refresh', {
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

    listAuthSessions: async () => {
      const path = '/auth/me/sessions'
      const result = await request<unknown>(path)
      return parseAuthSessionsResponse(result, path) as AuthSessionsResponse
    },

    revokeAuthSession: (sessionId: string) =>
      request<void>(`/auth/me/sessions/${sessionId}/revoke`, {
        method: 'POST',
      }),

    revokeOtherAuthSessions: async () => {
      const path = '/auth/me/sessions/revoke-others'
      const result = await request<unknown>(path, {
        method: 'POST',
      })
      return parseAuthRevokeOthersResponse(result, path) as AuthRevokeOthersResponse
    },

    getWebauthnRegistrationOptions: (deviceLabel?: string) =>
      request<WebAuthnPublicKeyOptionsResponse>('/auth/webauthn/register/options', {
        method: 'POST',
        ...(typeof deviceLabel === 'string' && deviceLabel.trim() !== ''
          ? { body: JSON.stringify({ device_label: deviceLabel }) }
          : {}),
      }),

    verifyWebauthnRegistration: (payload: WebAuthnRegisterVerifyPayload) =>
      request<WebAuthnDeviceResponse>('/auth/webauthn/register/verify', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getWebauthnAuthenticationOptions: () =>
      request<WebAuthnPublicKeyOptionsResponse>('/auth/webauthn/authenticate/options', {
        method: 'POST',
      }),

    verifyWebauthnAuthentication: (payload: WebAuthnAuthenticateVerifyPayload) =>
      request<AuthLoginResponse>('/auth/webauthn/authenticate/verify', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

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

    previewAssetPurge: (assetId: string) =>
      request<void>(`/assets/${assetId}/purge/preview`, {
        method: 'POST',
      }),

    executeAssetPurge: (assetId: string, idempotencyKey: string, ifMatch?: string | null) =>
      request<void>(`/assets/${assetId}/purge`, {
        method: 'POST',
        headers: {
          ...withIfMatchHeader(ifMatch),
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({ confirm: true } satisfies PurgeExecutePayload),
      }),

    reopenAsset: (assetId: string, ifMatch?: string | null) =>
      request<void>(`/assets/${assetId}/reopen`, {
        method: 'POST',
        ...(withIfMatchHeader(ifMatch) ? { headers: withIfMatchHeader(ifMatch) } : {}),
      }),

    reprocessAsset: (assetId: string, idempotencyKey: string, ifMatch?: string | null) =>
      request<void>(`/assets/${assetId}/reprocess`, {
        method: 'POST',
        headers: {
          ...withIfMatchHeader(ifMatch),
          'Idempotency-Key': idempotencyKey,
        },
      }),

    updateAssetMetadata: (assetId: string, payload: AssetMetadataPatchPayload, ifMatch?: string | null) =>
      request<void>(`/assets/${assetId}`, {
        method: 'PATCH',
        ...(withIfMatchHeader(ifMatch) ? { headers: withIfMatchHeader(ifMatch) } : {}),
        body: JSON.stringify(payload),
      }),

    updateAssetProcessingProfile: (
      assetId: string,
      payload: AssetProcessingProfilePatchPayload,
      ifMatch?: string | null,
    ) =>
      request<void>(`/assets/${assetId}`, {
        method: 'PATCH',
        ...(withIfMatchHeader(ifMatch) ? { headers: withIfMatchHeader(ifMatch) } : {}),
        body: JSON.stringify(payload),
      }),

    submitAssetDecision: (
      assetId: string,
      payload: AssetDecisionPayload,
      _idempotencyKey?: string,
      ifMatch?: string | null,
    ) =>
      request<void>(`/assets/${assetId}`, {
        method: 'PATCH',
        ...(withIfMatchHeader(ifMatch) ? { headers: withIfMatchHeader(ifMatch) } : {}),
        body: JSON.stringify(payload),
      }),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
