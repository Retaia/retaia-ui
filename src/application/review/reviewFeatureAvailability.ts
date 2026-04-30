import { normalizeUserFeatures } from '../../domain/auth/features'

export const REVIEW_BULK_DECISIONS_FEATURE_KEY = 'features.decisions.bulk'

export function resolveBulkDecisionsEnabled(userFeatures: {
  user_feature_enabled?: Record<string, unknown>
  effective_feature_enabled?: Record<string, unknown>
  feature_governance?: Array<{ key?: string; user_can_disable?: boolean }>
} | null | undefined) {
  if (!userFeatures) {
    return false
  }

  const normalized = normalizeUserFeatures(userFeatures)
  return normalized.effectiveFeatureEnabled[REVIEW_BULK_DECISIONS_FEATURE_KEY] === true
}
