import type { z } from 'zod'
import { ApiError } from './errors'
import type {
  AppFeaturesResponse,
  AppPolicyResponse,
  AssetDetail,
  AssetSummary,
  Auth2faSetupResponse,
  AuthCurrentUserResponse,
  MoveStatusResponse,
  UserFeaturesResponse,
} from './contracts'
import {
  appFeaturesResponseSchema,
  appPolicyResponseSchema,
  assetDetailResponseSchema,
  auth2faSetupResponseSchema,
  currentUserResponseSchema,
  listAssetSummariesResponseSchema,
  moveExecuteResponseSchema,
  moveReportResponseSchema,
  userFeaturesResponseSchema,
} from './schemas'

function createValidationError(path: string, detail: string) {
  return new ApiError(502, `Invalid API response for ${path}: ${detail}`, {
    code: 'VALIDATION_FAILED',
    message: `Invalid API response for ${path}: ${detail}`,
    retryable: false,
    correlation_id: 'client-validation',
  })
}

function parseWithSchema<T>(
  schema: z.ZodType<T>,
  payload: unknown,
  path: string,
  fallbackDetail: string,
): T {
  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    throw createValidationError(path, issue?.message ?? fallbackDetail)
  }
  return parsed.data
}

export function parseAssetSummariesResponse(payload: unknown, path: string): AssetSummary[] {
  const parsed = parseWithSchema(
    listAssetSummariesResponseSchema,
    payload,
    path,
    'expected payload containing items',
  )
  const items = parsed.items
  if (!items) {
    return []
  }
  return items as AssetSummary[]
}

export function parseMoveExecuteResponse(payload: unknown, path: string) {
  return parseWithSchema(moveExecuteResponseSchema, payload, path, 'expected object or empty response')
}

export function parseMoveReportResponse(payload: unknown, path: string) {
  return parseWithSchema(moveReportResponseSchema, payload, path, 'expected object') as MoveStatusResponse
}

export function parseAssetDetailResponse(payload: unknown, path: string) {
  return parseWithSchema(assetDetailResponseSchema, payload, path, 'expected summary object') as AssetDetail
}

export function parseAppPolicyResponse(payload: unknown, path: string) {
  const parsed = parseWithSchema(
    appPolicyResponseSchema,
    payload,
    path,
    'expected server_policy.feature_flags object',
  )
  const serverPolicy = parsed.server_policy
  const featureFlags = serverPolicy.feature_flags
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
    ...(parsed as AppPolicyResponse),
    server_policy: {
      ...serverPolicy,
      feature_flags: normalizedFeatureFlags,
    },
  } as AppPolicyResponse & { server_policy: { feature_flags: Record<string, boolean> } }
}

export function parseAppFeaturesResponse(payload: unknown, path: string) {
  return parseWithSchema(
    appFeaturesResponseSchema,
    payload,
    path,
    'expected feature payload object',
  ) as AppFeaturesResponse
}

export function parseCurrentUserResponse(payload: unknown, path: string) {
  return parseWithSchema(
    currentUserResponseSchema,
    payload,
    path,
    'expected non-empty email',
  ) as AuthCurrentUserResponse
}

export function parseUserFeaturesResponse(payload: unknown, path: string) {
  return parseWithSchema(
    userFeaturesResponseSchema,
    payload,
    path,
    'expected user features payload',
  ) as UserFeaturesResponse
}

export function parseAuth2faSetupResponse(payload: unknown, path: string) {
  return parseWithSchema(
    auth2faSetupResponseSchema,
    payload,
    path,
    'expected non-empty secret and otpauth_uri',
  ) as Auth2faSetupResponse
}
