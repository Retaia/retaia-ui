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
  name?: string
  state?: string
  media_type?: string
  processing_profile?: string
  captured_at?: string
  created_at?: string
  updated_at?: string | null
  revision_etag?: string | null
  duration?: number | null
  tags?: string[]
  projects?: Array<{ project_id?: string; project_name?: string }>
  has_preview?: boolean
  thumb_url?: string | null
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

export type PurgeExecutePayload = { confirm: true }
export type AssetMetadataPatchPayload = {
  tags?: string[]
  notes?: string
  fields?: Record<string, unknown>
}
export type AssetProcessingProfilePatchPayload = {
  processing_profile: 'video_standard' | 'audio_undefined' | 'audio_music' | 'audio_voice' | 'photo_standard'
}
export type AssetDecisionPayload = {
  state: 'DECISION_PENDING' | 'DECIDED_KEEP' | 'DECIDED_REJECT' | 'ARCHIVED' | 'REJECTED'
}
export type AppPolicyResponse = {
  server_policy: {
    feature_flags: Record<string, boolean | unknown>
    feature_flags_contract_version?: string
    accepted_feature_flags_contract_versions?: string[]
    effective_feature_flags_contract_version?: string
    feature_flags_compatibility_mode?: 'STRICT' | 'COMPAT'
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
export type AuthRefreshPayload = {
  refresh_token: string
}
export type AuthCurrentUserResponse = {
  email: string
  [key: string]: unknown
}
export type AuthSession = {
  session_id: string
  client_id: string
  created_at: string
  last_used_at: string
  expires_at?: string | null
  is_current: boolean
  device_label?: string | null
  browser?: string | null
  os?: string | null
  ip_address_last_seen?: string | null
  [key: string]: unknown
}
export type AuthSessionsResponse = {
  items: AuthSession[]
  [key: string]: unknown
}
export type AuthRevokeOthersResponse = {
  revoked: number
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
export type WebAuthnPublicKeyOptionsResponse = {
  request_id?: string
  public_key: Record<string, unknown>
}
export type WebAuthnRegisterVerifyPayload = {
  credential: Record<string, unknown>
  device_id?: string
  device_label?: string
}
export type WebAuthnAuthenticateVerifyPayload = {
  credential: Record<string, unknown>
  client_id?: string
  client_kind?: 'UI_WEB' | 'AGENT_UI'
}
export type WebAuthnDeviceResponse = {
  device_id: string
  device_label?: string
  webauthn_fingerprint?: string
}
