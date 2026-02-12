import { describe, expect, it } from 'vitest'
import { mapApiSummaryToAsset } from './assetMapper'

describe('assetMapper', () => {
  it('maps an api summary to a review asset', () => {
    const result = mapApiSummaryToAsset({
      uuid: 'asset-1',
      media_type: 'VIDEO',
      state: 'DECISION_PENDING',
      created_at: '2026-02-12T10:00:00Z',
      captured_at: '2026-02-11T10:00:00Z',
    })

    expect(result).toEqual({
      id: 'asset-1',
      name: 'asset-1',
      state: 'DECISION_PENDING',
      mediaType: 'VIDEO',
      capturedAt: '2026-02-11T10:00:00Z',
    })
  })

  it('maps non-review api states to nearest review state', () => {
    expect(
      mapApiSummaryToAsset({
        uuid: 'asset-2',
        media_type: 'PHOTO',
        state: 'ARCHIVED',
        created_at: '2026-02-12T10:00:00Z',
      }).state,
    ).toBe('DECIDED_KEEP')

    expect(
      mapApiSummaryToAsset({
        uuid: 'asset-3',
        media_type: 'AUDIO',
        state: 'PURGED',
        created_at: '2026-02-12T10:00:00Z',
      }).state,
    ).toBe('DECIDED_REJECT')
  })
})

