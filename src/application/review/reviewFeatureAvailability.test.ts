import { describe, expect, it } from 'vitest'
import { resolveBulkDecisionsEnabled } from './reviewFeatureAvailability'

describe('reviewFeatureAvailability', () => {
  it('enables bulk decisions only from effective feature availability', () => {
    expect(
      resolveBulkDecisionsEnabled({
        user_feature_enabled: { 'features.decisions.bulk': true },
        effective_feature_enabled: { 'features.decisions.bulk': true },
        feature_governance: [],
      }),
    ).toBe(true)

    expect(
      resolveBulkDecisionsEnabled({
        user_feature_enabled: { 'features.decisions.bulk': true },
        effective_feature_enabled: { 'features.decisions.bulk': false },
        feature_governance: [],
      }),
    ).toBe(false)
  })

  it('stays disabled when the effective feature result is missing', () => {
    expect(
      resolveBulkDecisionsEnabled({
        user_feature_enabled: { 'features.decisions.bulk': true },
        effective_feature_enabled: {},
        feature_governance: [],
      }),
    ).toBe(false)

    expect(resolveBulkDecisionsEnabled(null)).toBe(false)
  })
})
