import { describe, expect, it } from 'vitest'
import { mapApiSummaryToAsset } from './assetMapper'

describe('assetMapper', () => {
  it('maps an api summary to a review asset', () => {
    const result = mapApiSummaryToAsset({
      uuid: 'asset-1',
      media_type: 'VIDEO',
      state: 'DECISION_PENDING',
      name: 'cam-a.mov',
      created_at: '2026-02-12T10:00:00Z',
      captured_at: '2026-02-11T10:00:00Z',
      updated_at: '2026-02-13T10:00:00Z',
      revision_etag: 'etag-1',
      tags: ['urgent', 'interview'],
    })

    expect(result).toEqual({
      id: 'asset-1',
      name: 'cam-a.mov',
      state: 'DECISION_PENDING',
      mediaType: 'VIDEO',
      processingProfile: null,
      capturedAt: '2026-02-11T10:00:00Z',
      updatedAt: '2026-02-13T10:00:00Z',
      revisionEtag: 'etag-1',
      tags: ['urgent', 'interview'],
    })
  })

  it('maps non-review api states to explicit UI states', () => {
    expect(
      mapApiSummaryToAsset({
        uuid: 'asset-2',
        media_type: 'PHOTO',
        state: 'ARCHIVED',
        created_at: '2026-02-12T10:00:00Z',
      }).state,
    ).toBe('ARCHIVED')

    expect(
      mapApiSummaryToAsset({
        uuid: 'asset-3',
        media_type: 'AUDIO',
        state: 'PURGED',
        created_at: '2026-02-12T10:00:00Z',
      }).state,
    ).toBe('PURGED')
  })

  it('falls back safely when api payload is partially malformed', () => {
    const result = mapApiSummaryToAsset(
      {
        media_type: undefined,
        state: undefined,
        created_at: undefined,
        revision_etag: null,
      },
      0,
    )

    expect(result).toEqual({
      id: 'UNKNOWN-ASSET-1',
      name: 'UNKNOWN-ASSET-1',
      state: 'DECISION_PENDING',
      mediaType: 'OTHER',
      processingProfile: null,
      capturedAt: '1970-01-01T00:00:00.000Z',
      revisionEtag: null,
    })
  })
})
