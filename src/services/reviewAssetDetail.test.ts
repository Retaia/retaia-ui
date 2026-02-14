import { describe, expect, it } from 'vitest'
import { mergeAssetWithDetail } from './reviewAssetDetail'
import type { Asset } from '../domain/assets'

const baseAsset: Asset = {
  id: 'A-001',
  name: 'asset-001.mov',
  state: 'DECISION_PENDING',
  capturedAt: '2026-02-14T10:00:00Z',
  mediaType: 'VIDEO',
}

describe('mergeAssetWithDetail', () => {
  it('merges derived/transcript payload without forcing state transition', () => {
    const merged = mergeAssetWithDetail(baseAsset, {
      summary: {
        state: 'DECIDED_KEEP',
        tags: ['a', 10, 'b'],
      },
      derived: {
        proxy_video_url: '/video.mp4',
      },
      transcript: {
        text_preview: 'preview',
        status: 'DONE',
      },
    })

    expect(merged.state).toBe('DECISION_PENDING')
    expect(merged.tags).toEqual(['a', 'b'])
    expect(merged.proxyVideoUrl).toBe('/video.mp4')
    expect(merged.transcriptPreview).toBe('preview')
    expect(merged.transcriptStatus).toBe('DONE')
  })

  it('can apply decision state from detail payload when requested', () => {
    const merged = mergeAssetWithDetail(
      {
        ...baseAsset,
        state: 'DECISION_PENDING',
      },
      {
        summary: {
          state: 'DECIDED_REJECT',
        },
      },
      { includeDecisionState: true },
    )

    expect(merged.state).toBe('DECIDED_REJECT')
  })
})
