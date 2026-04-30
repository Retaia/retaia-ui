import { describe, expect, it } from 'vitest'
import { buildReviewQueueGroups } from './reviewQueueGroups'
import type { Asset } from '../../domain/assets'

function createAsset(id: string, state: Asset['state']): Asset {
  return {
    id,
    name: `${id}.wav`,
    state,
  }
}

describe('buildReviewQueueGroups', () => {
  it('keeps review intermediate states in explicit groups', () => {
    const groups = buildReviewQueueGroups([
      createAsset('ready-1', 'READY'),
      createAsset('processing-1', 'PROCESSING_REVIEW'),
      createAsset('profile-1', 'REVIEW_PENDING_PROFILE'),
      createAsset('pending-1', 'DECISION_PENDING'),
      createAsset('keep-1', 'DECIDED_KEEP'),
      createAsset('reject-1', 'DECIDED_REJECT'),
      createAsset('archived-1', 'ARCHIVED'),
    ])

    expect(groups).toEqual([
      expect.objectContaining({
        key: 'qualificationBlocked',
        assets: [
          expect.objectContaining({ id: 'ready-1' }),
          expect.objectContaining({ id: 'processing-1' }),
          expect.objectContaining({ id: 'profile-1' }),
        ],
      }),
      expect.objectContaining({
        key: 'decisionPending',
        assets: [expect.objectContaining({ id: 'pending-1' })],
      }),
      expect.objectContaining({
        key: 'decidedKeep',
        assets: [expect.objectContaining({ id: 'keep-1' })],
      }),
      expect.objectContaining({
        key: 'decidedReject',
        assets: [expect.objectContaining({ id: 'reject-1' })],
      }),
    ])
  })

  it('returns empty buckets when a review state is currently absent', () => {
    const groups = buildReviewQueueGroups([])

    expect(groups.map((group) => ({ key: group.key, count: group.assets.length }))).toEqual([
      { key: 'qualificationBlocked', count: 0 },
      { key: 'decisionPending', count: 0 },
      { key: 'decidedKeep', count: 0 },
      { key: 'decidedReject', count: 0 },
    ])
  })
})
