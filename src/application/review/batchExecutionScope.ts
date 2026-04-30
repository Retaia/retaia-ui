import type { Asset } from '../../domain/assets'

export type BatchExecutionScope = {
  selected: number
  eligible: number
  archived: number
  rejected: number
  pendingDecision: number
  alreadyMoved: number
  otherStates: number
  ineligible: number
}

export function resolveBatchExecutionScope(assets: Asset[], batchIds: string[]): BatchExecutionScope {
  const selectedIds = new Set(batchIds)

  return assets.reduce<BatchExecutionScope>(
    (scope, asset) => {
      if (!selectedIds.has(asset.id)) {
        return scope
      }

      scope.selected += 1

      if (asset.state === 'DECIDED_KEEP') {
        scope.eligible += 1
        scope.archived += 1
        return scope
      }

      if (asset.state === 'DECIDED_REJECT') {
        scope.eligible += 1
        scope.rejected += 1
        return scope
      }

      scope.ineligible += 1

      if (asset.state === 'DECISION_PENDING') {
        scope.pendingDecision += 1
        return scope
      }

      if (asset.state === 'ARCHIVED' || asset.state === 'REJECTED') {
        scope.alreadyMoved += 1
        return scope
      }

      scope.otherStates += 1
      return scope
    },
    {
      selected: 0,
      eligible: 0,
      archived: 0,
      rejected: 0,
      pendingDecision: 0,
      alreadyMoved: 0,
      otherStates: 0,
      ineligible: 0,
    },
  )
}
