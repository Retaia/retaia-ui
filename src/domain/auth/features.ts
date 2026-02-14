export type FeatureGovernanceItem = {
  key: string
  user_can_disable: boolean
}

export type FeatureState = {
  userFeatureEnabled: Record<string, boolean>
  effectiveFeatureEnabled: Record<string, boolean>
  featureGovernance: FeatureGovernanceItem[]
}

export type AppFeatureState = {
  appFeatureEnabled: Record<string, boolean>
  featureGovernance: FeatureGovernanceItem[]
}

function normalizeBooleanMap(payload: Record<string, unknown> | undefined) {
  return Object.entries(payload ?? {}).reduce<Record<string, boolean>>((acc, [key, value]) => {
    if (typeof value === 'boolean') {
      acc[key] = value
    }
    return acc
  }, {})
}

function normalizeFeatureGovernance(
  payload: Array<{ key?: string; user_can_disable?: boolean }> | undefined,
) {
  return (payload ?? [])
    .filter((item) => typeof item.key === 'string')
    .map((item) => ({
      key: item.key as string,
      user_can_disable: item.user_can_disable === true,
    }))
}

export function normalizeUserFeatures(payload: {
  user_feature_enabled?: Record<string, unknown>
  effective_feature_enabled?: Record<string, unknown>
  feature_governance?: Array<{ key?: string; user_can_disable?: boolean }>
}): FeatureState {
  return {
    userFeatureEnabled: normalizeBooleanMap(payload.user_feature_enabled),
    effectiveFeatureEnabled: normalizeBooleanMap(payload.effective_feature_enabled),
    featureGovernance: normalizeFeatureGovernance(payload.feature_governance),
  }
}

export function normalizeAppFeatures(payload: {
  app_feature_enabled?: Record<string, unknown>
  feature_governance?: Array<{ key?: string; user_can_disable?: boolean }>
}): AppFeatureState {
  return {
    appFeatureEnabled: normalizeBooleanMap(payload.app_feature_enabled),
    featureGovernance: normalizeFeatureGovernance(payload.feature_governance),
  }
}

export function findMfaFeatureKey(args: {
  featureGovernance: FeatureGovernanceItem[]
  enabledMap: Record<string, boolean>
}) {
  const fromGovernance = args.featureGovernance.find((item) => /(2fa|mfa|totp)/i.test(item.key))
  if (fromGovernance) {
    return fromGovernance.key
  }
  return Object.keys(args.enabledMap).find((key) => /(2fa|mfa|totp)/i.test(key)) ?? null
}
