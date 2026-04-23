import { z } from 'zod'

export const unknownObjectSchema = z.record(z.string(), z.unknown())

export const healthResponseSchema = z
  .object({
    status: z.enum(['ok', 'degraded', 'down']),
    self_healing: z
      .object({
        active: z.boolean(),
        deadline_at: z.string().nullable(),
        max_self_healing_seconds: z.number(),
      })
      .passthrough(),
    checks: z.array(z.unknown()).optional(),
  })
  .passthrough()

export const listAssetSummariesResponseSchema = z
  .object({
    items: z.array(unknownObjectSchema).optional().nullable(),
  })
  .passthrough()

export const moveExecuteResponseSchema = z.union([unknownObjectSchema, z.undefined()])
export const moveReportResponseSchema = unknownObjectSchema

export const assetDetailResponseSchema = z
  .object({
    summary: unknownObjectSchema,
  })
  .passthrough()

export const appPolicyResponseSchema = z
  .object({
    server_policy: z
      .object({
        feature_flags: z.record(z.string(), z.unknown()),
      })
      .passthrough(),
  })
  .passthrough()

export const appFeaturesResponseSchema = z
  .object({
    app_feature_enabled: unknownObjectSchema,
    feature_governance: z.array(z.unknown()),
    core_v1_global_features: z.array(z.unknown()),
  })
  .passthrough()

export const currentUserResponseSchema = z
  .object({
    email: z.string().min(1),
  })
  .passthrough()

export const authSessionsResponseSchema = z
  .object({
    items: z.array(
      z.object({
        session_id: z.string().min(1),
        client_id: z.string().min(1),
        created_at: z.string().min(1),
        last_used_at: z.string().min(1),
        expires_at: z.string().nullable().optional(),
        is_current: z.boolean(),
        device_label: z.string().nullable().optional(),
        browser: z.string().nullable().optional(),
        os: z.string().nullable().optional(),
        ip_address_last_seen: z.string().nullable().optional(),
      }).passthrough(),
    ),
  })
  .passthrough()

export const authRevokeOthersResponseSchema = z
  .object({
    revoked: z.number(),
  })
  .passthrough()

export const userFeaturesResponseSchema = z
  .object({
    user_feature_enabled: unknownObjectSchema,
    effective_feature_enabled: unknownObjectSchema,
    feature_governance: z.array(z.unknown()),
  })
  .passthrough()

export const auth2faSetupResponseSchema = z
  .object({
    secret: z.string().min(1),
    otpauth_uri: z.string().min(1),
  })
  .passthrough()
