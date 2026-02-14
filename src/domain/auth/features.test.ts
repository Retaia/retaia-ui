import { describe, expect, it } from 'vitest'
import { findMfaFeatureKey, normalizeAppFeatures, normalizeUserFeatures } from './features'

describe('auth feature domain', () => {
  it('normalizes user features payload with boolean-only maps', () => {
    const result = normalizeUserFeatures({
      user_feature_enabled: { a: true, b: 'bad' },
      effective_feature_enabled: { a: true, c: false, d: 0 },
      feature_governance: [{ key: 'a', user_can_disable: true }, { key: 12 as never }],
    })

    expect(result).toEqual({
      userFeatureEnabled: { a: true },
      effectiveFeatureEnabled: { a: true, c: false },
      featureGovernance: [{ key: 'a', user_can_disable: true }],
    })
  })

  it('normalizes app features payload', () => {
    const result = normalizeAppFeatures({
      app_feature_enabled: { 'features.auth.2fa': true, other: 'bad' },
      feature_governance: [{ key: 'features.auth.2fa', user_can_disable: false }],
    })

    expect(result).toEqual({
      appFeatureEnabled: { 'features.auth.2fa': true },
      featureGovernance: [{ key: 'features.auth.2fa', user_can_disable: false }],
    })
  })

  it('finds MFA key from governance then map fallback', () => {
    expect(
      findMfaFeatureKey({
        featureGovernance: [{ key: 'features.auth.2fa', user_can_disable: true }],
        enabledMap: {},
      }),
    ).toBe('features.auth.2fa')

    expect(
      findMfaFeatureKey({
        featureGovernance: [],
        enabledMap: { 'features.auth.mfa': true },
      }),
    ).toBe('features.auth.mfa')
  })
})
