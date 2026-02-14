import type { Asset } from '../../domain/assets'

export type BatchScopeSummary = {
  pending: number
  keep: number
  reject: number
}

export function summarizeBatchScope(assets: Asset[], batchIds: string[]): BatchScopeSummary {
  const summary: BatchScopeSummary = { pending: 0, keep: 0, reject: 0 }
  const selectedSet = new Set(batchIds)
  for (const asset of assets) {
    if (!selectedSet.has(asset.id)) {
      continue
    }
    if (asset.state === 'DECISION_PENDING') {
      summary.pending += 1
    } else if (asset.state === 'DECIDED_KEEP') {
      summary.keep += 1
    } else if (asset.state === 'DECIDED_REJECT') {
      summary.reject += 1
    }
  }
  return summary
}
