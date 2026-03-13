import { describe, expect, it, vi } from 'vitest'
import type { Asset } from '../../domain/assets'
import { refreshReviewAsset, saveReviewAssetMetadata } from './reviewAssetMaintenance'

const ASSET: Asset = {
  id: 'A-001',
  name: 'asset.mp4',
  state: 'DECISION_PENDING',
  tags: [],
  notes: '',
}

describe('reviewAssetMaintenance', () => {
  it('saves metadata in mock mode without API call', async () => {
    const updateAssetMetadata = vi.fn()
    const result = await saveReviewAssetMetadata({
      isApiAssetSource: false,
      assetId: 'A-001',
      payload: {
        tags: ['  tag-a  '],
        notes: ' note ',
      },
      updateAssetMetadata,
    })

    expect(result.kind).toBe('success')
    if (result.kind === 'success') {
      expect(result.apply([ASSET])).toEqual([
        {
          ...ASSET,
          tags: ['tag-a'],
          notes: 'note',
        },
      ])
    }
    expect(updateAssetMetadata).not.toHaveBeenCalled()
  })

  it('returns error when metadata API update fails', async () => {
    const updateAssetMetadata = vi.fn(async () => {
      throw new Error('metadata failed')
    })

    const result = await saveReviewAssetMetadata({
      isApiAssetSource: true,
      assetId: 'A-001',
      payload: {
        tags: [],
        notes: '',
      },
      updateAssetMetadata,
    })

    expect(result.kind).toBe('error')
  })

  it('refreshes selected asset from API detail', async () => {
    const getAssetDetail = vi.fn(async () => ({
      summary: {
        uuid: 'A-001',
        state: 'DECIDED_KEEP',
        name: 'asset.mp4',
      },
    }))
    const result = await refreshReviewAsset({
      isApiAssetSource: true,
      selectedAssetId: 'A-001',
      getAssetDetail,
    })

    expect(result.kind).toBe('success')
    if (result.kind === 'success') {
      expect(result.apply([ASSET])[0]?.state).toBe('DECIDED_KEEP')
    }
  })

  it('returns noop when refresh is not possible', async () => {
    const getAssetDetail = vi.fn()
    await expect(
      refreshReviewAsset({
        isApiAssetSource: false,
        selectedAssetId: null,
        getAssetDetail,
      }),
    ).resolves.toEqual({ kind: 'noop' })
  })
})
