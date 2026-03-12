import type { components, paths } from './generated/openapi'

export type ListAssetsQuery = NonNullable<paths['/assets']['get']['parameters']['query']>
export type ListAssetsResponse =
  paths['/assets']['get']['responses'][200]['content']['application/json']
export type HealthResponse =
  paths['/ops/readiness']['get']['responses'][200]['content']['application/json']
export type AssetSummary = components['schemas']['AssetSummary']
export type AssetDetail =
  paths['/assets/{uuid}']['get']['responses'][200]['content']['application/json']

// NOTE: Specs v1 no longer exposes legacy /batches/* endpoints used by current UI flow.
// Keep explicit UI payload types until batch flow is migrated to the new contract.
export type MovePreviewPayload = {
  include?: 'KEEP' | 'REJECT' | 'BOTH'
  limit?: number
}
export type MoveExecutePayload = {
  mode: 'EXECUTE' | 'DRY_RUN'
  selection: {
    asset_ids?: string[]
    include?: 'KEEP' | 'REJECT' | 'BOTH'
  }
}
export type MoveExecuteResponse = Record<string, unknown> | void
export type MoveStatusResponse = Record<string, unknown>
export type PurgeExecutePayload =
  paths['/assets/{uuid}/purge']['post']['requestBody']['content']['application/json']
export type AssetMetadataPatchPayload =
  paths['/assets/{uuid}']['patch']['requestBody']['content']['application/json']
export type AssetDecisionPayload = {
  action: 'KEEP' | 'REJECT' | 'CLEAR'
}
export type AppPolicyResponse =
  paths['/app/policy']['get']['responses'][200]['content']['application/json']
export type AppFeaturesResponse =
  paths['/app/features']['get']['responses'][200]['content']['application/json']
export type AppFeaturesUpdatePayload =
  paths['/app/features']['patch']['requestBody']['content']['application/json']
export type AuthLoginPayload = components['schemas']['AuthLoginRequest']
export type AuthLoginResponse = components['schemas']['AuthLoginSuccess']
export type AuthCurrentUserResponse = components['schemas']['AuthCurrentUser']
export type UserFeaturesResponse =
  paths['/auth/me/features']['get']['responses'][200]['content']['application/json']
export type UserFeaturesUpdatePayload =
  paths['/auth/me/features']['patch']['requestBody']['content']['application/json']
export type Auth2faSetupResponse =
  paths['/auth/2fa/setup']['post']['responses'][200]['content']['application/json']
export type Auth2faOtpPayload =
  paths['/auth/2fa/enable']['post']['requestBody']['content']['application/json']
export type AuthEmailPayload =
  paths['/auth/lost-password/request']['post']['requestBody']['content']['application/json']
export type AuthLostPasswordResetPayload =
  paths['/auth/lost-password/reset']['post']['requestBody']['content']['application/json']
export type AuthTokenPayload =
  paths['/auth/verify-email/confirm']['post']['requestBody']['content']['application/json']
