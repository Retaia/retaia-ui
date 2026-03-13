export type ListAssetsQuery = {
  state?: string
  media_type?: string
  q?: string
  sort?: string
  captured_at_from?: string
  captured_at_to?: string
  limit?: number
  cursor?: string
}
export type AssetSummary = {
  uuid?: string
  state?: string
  media_type?: string
  captured_at?: string
  created_at?: string
  tags?: string[]
  [key: string]: unknown
}
export type ListAssetsResponse = {
  items?: AssetSummary[] | null
  next_cursor?: string | null
  [key: string]: unknown
}
export type HealthResponse = {
  status: 'ok' | 'degraded' | 'down'
  self_healing: {
    active: boolean
    deadline_at: string | null
    max_self_healing_seconds: number
    [key: string]: unknown
  }
  checks?: unknown[]
  [key: string]: unknown
}
export type AssetDetail = {
  summary: AssetSummary
  [key: string]: unknown
}

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
export type PurgeExecutePayload = { confirm: true }
export type AssetMetadataPatchPayload = {
  tags?: string[]
  notes?: string
  fields?: Record<string, unknown>
}
export type AssetDecisionPayload = {
  action: 'KEEP' | 'REJECT' | 'CLEAR'
}
export type AppPolicyResponse = {
  server_policy: {
    feature_flags: Record<string, boolean | unknown>
    [key: string]: unknown
  }
  [key: string]: unknown
}
export type AppFeaturesResponse = {
  app_feature_enabled: Record<string, unknown>
  feature_governance: Array<{ key?: string; user_can_disable?: boolean }>
  core_v1_global_features: unknown[]
  [key: string]: unknown
}
export type AppFeaturesUpdatePayload = {
  app_feature_enabled?: Record<string, boolean>
}
export type AuthLoginPayload = {
  email: string
  password: string
  otp_code?: string
}
export type AuthLoginResponse = {
  access_token: string
  token_type?: string
  [key: string]: unknown
}
export type AuthCurrentUserResponse = {
  email: string
  [key: string]: unknown
}
export type UserFeaturesResponse = {
  user_feature_enabled: Record<string, unknown>
  effective_feature_enabled: Record<string, unknown>
  feature_governance: Array<{ key?: string; user_can_disable?: boolean }>
  [key: string]: unknown
}
export type UserFeaturesUpdatePayload = {
  user_feature_enabled?: Record<string, boolean>
}
export type Auth2faSetupResponse = {
  secret: string
  otpauth_uri: string
  [key: string]: unknown
}
export type Auth2faOtpPayload = {
  otp_code: string
}
export type AuthEmailPayload = {
  email: string
}
export type AuthLostPasswordResetPayload = {
  token: string
  new_password: string
}
export type AuthTokenPayload = {
  token: string
}
