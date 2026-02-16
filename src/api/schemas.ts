import { z } from 'zod'

export const unknownObjectSchema = z.record(z.string(), z.unknown())

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
