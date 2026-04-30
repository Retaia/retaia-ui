import type { Asset, AssetState } from '../../domain/assets'

export type ReviewQueueGroupKey =
  | 'qualificationBlocked'
  | 'decisionPending'
  | 'decidedKeep'
  | 'decidedReject'

export type ReviewQueueGroup = {
  key: ReviewQueueGroupKey
  states: readonly AssetState[]
  assets: Asset[]
}

const REVIEW_QUEUE_GROUP_STATES: ReadonlyArray<readonly [ReviewQueueGroupKey, readonly AssetState[]]> = [
  ['qualificationBlocked', ['READY', 'PROCESSING_REVIEW', 'REVIEW_PENDING_PROFILE']],
  ['decisionPending', ['DECISION_PENDING']],
  ['decidedKeep', ['DECIDED_KEEP']],
  ['decidedReject', ['DECIDED_REJECT']],
] as const

export function buildReviewQueueGroups(assets: Asset[]): ReviewQueueGroup[] {
  return REVIEW_QUEUE_GROUP_STATES.map(([key, states]) => {
    const allowedStates = new Set(states)
    return {
      key,
      states,
      assets: assets.filter((asset) => allowedStates.has(asset.state)),
    }
  })
}
