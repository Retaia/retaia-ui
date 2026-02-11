import type { AssetState } from './assets'

export type ActionAvailabilityInput = {
  visibleCount: number
  batchCount: number
  previewingBatch: boolean
  executingBatch: boolean
  reportBatchId: string | null
  reportLoading: boolean
  undoCount: number
  selectedAssetState: AssetState | null
  previewingPurge: boolean
  executingPurge: boolean
  purgePreviewMatchesSelected: boolean
}

export function getActionAvailability(input: ActionAvailabilityInput) {
  const selectedRejected = input.selectedAssetState === 'DECIDED_REJECT'

  return {
    keepVisibleDisabled: input.visibleCount === 0,
    rejectVisibleDisabled: input.visibleCount === 0,
    keepBatchDisabled: input.batchCount === 0,
    rejectBatchDisabled: input.batchCount === 0,
    clearBatchDisabled: input.batchCount === 0,
    previewBatchDisabled: input.batchCount === 0 || input.previewingBatch,
    executeBatchDisabled: input.batchCount === 0 || input.executingBatch,
    refreshReportDisabled: !input.reportBatchId || input.reportLoading,
    undoDisabled: input.undoCount === 0,
    previewPurgeDisabled: !selectedRejected || input.previewingPurge,
    executePurgeDisabled:
      !selectedRejected || !input.purgePreviewMatchesSelected || input.executingPurge,
  }
}
