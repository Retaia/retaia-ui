import { describe, expect, it, vi } from 'vitest'
import { applySingleReviewDecision } from './applySingleReviewDecision'
import type { Asset } from '../../domain/assets'

const BASE_ASSET: Asset = {
  id: 'A-001',
  name: 'first.mp4',
  state: 'DECISION_PENDING',
  mediaType: 'IMAGE',
}

const ASSETS: Asset[] = [BASE_ASSET]

describe('applySingleReviewDecision', () => {
  it('returns noop when asset cannot be found', async () => {
    const result = await applySingleReviewDecision({
      assets: ASSETS,
      targetId: 'missing',
      action: 'KEEP',
      isApiAssetSource: false,
      submitAssetDecision: vi.fn(),
      mapErrorToMessage: () => 'error',
    })

    expect(result).toEqual({
      kind: 'noop',
      reason: 'asset_not_found',
    })
  })

  it('returns noop when action does not change state', async () => {
    const result = await applySingleReviewDecision({
      assets: [{ ...BASE_ASSET, state: 'DECIDED_KEEP' }],
      targetId: 'A-001',
      action: 'KEEP',
      isApiAssetSource: false,
      submitAssetDecision: vi.fn(),
      mapErrorToMessage: () => 'error',
    })

    expect(result).toEqual({
      kind: 'noop',
      reason: 'unchanged',
    })
  })

  it('maps API errors for actionable states', async () => {
    const submitAssetDecision = vi.fn(async () => {
      throw new Error('boom')
    })
    const result = await applySingleReviewDecision({
      assets: ASSETS,
      targetId: 'A-001',
      action: 'REJECT',
      isApiAssetSource: true,
      submitAssetDecision,
      mapErrorToMessage: () => 'mapped',
    })

    expect(result).toEqual({
      kind: 'error',
      message: 'mapped',
    })
    expect(submitAssetDecision).toHaveBeenCalledWith('A-001', 'REJECT')
  })

  it('returns updated assets on success', async () => {
    const submitAssetDecision = vi.fn(async () => {})
    const result = await applySingleReviewDecision({
      assets: ASSETS,
      targetId: 'A-001',
      action: 'KEEP',
      isApiAssetSource: true,
      submitAssetDecision,
      mapErrorToMessage: () => 'error',
    })

    expect(result).toEqual({
      kind: 'success',
      appliedState: 'DECIDED_KEEP',
      updatedAssets: [{ ...BASE_ASSET, state: 'DECIDED_KEEP' }],
    })
  })
})
