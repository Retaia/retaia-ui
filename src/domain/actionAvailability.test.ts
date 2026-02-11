import { describe, expect, it } from 'vitest'
import { getActionAvailability } from './actionAvailability'

const baseInput = {
  visibleCount: 1,
  batchCount: 1,
  previewingBatch: false,
  executingBatch: false,
  reportBatchId: 'b-1',
  reportLoading: false,
  undoCount: 1,
  selectedAssetState: 'DECIDED_REJECT' as const,
  previewingPurge: false,
  executingPurge: false,
  purgePreviewMatchesSelected: true,
}

describe('getActionAvailability', () => {
  it('enables actions when prerequisites are met', () => {
    expect(getActionAvailability(baseInput)).toMatchObject({
      keepVisibleDisabled: false,
      rejectVisibleDisabled: false,
      keepBatchDisabled: false,
      previewBatchDisabled: false,
      executeBatchDisabled: false,
      refreshReportDisabled: false,
      undoDisabled: false,
      previewPurgeDisabled: false,
      executePurgeDisabled: false,
    })
  })

  it('disables dependent actions when counts are empty', () => {
    expect(
      getActionAvailability({
        ...baseInput,
        visibleCount: 0,
        batchCount: 0,
        undoCount: 0,
        reportBatchId: null,
      }),
    ).toMatchObject({
      keepVisibleDisabled: true,
      rejectVisibleDisabled: true,
      keepBatchDisabled: true,
      rejectBatchDisabled: true,
      clearBatchDisabled: true,
      previewBatchDisabled: true,
      executeBatchDisabled: true,
      refreshReportDisabled: true,
      undoDisabled: true,
    })
  })

  it('disables purge actions when selected asset is not rejected or preview is missing', () => {
    expect(
      getActionAvailability({
        ...baseInput,
        selectedAssetState: 'DECIDED_KEEP',
      }),
    ).toMatchObject({
      previewPurgeDisabled: true,
      executePurgeDisabled: true,
    })

    expect(
      getActionAvailability({
        ...baseInput,
        purgePreviewMatchesSelected: false,
      }),
    ).toMatchObject({
      previewPurgeDisabled: false,
      executePurgeDisabled: true,
    })
  })

  it('disables batch decision/clear actions while preview or execute is running', () => {
    expect(
      getActionAvailability({
        ...baseInput,
        previewingBatch: true,
      }),
    ).toMatchObject({
      keepBatchDisabled: true,
      rejectBatchDisabled: true,
      clearBatchDisabled: true,
    })

    expect(
      getActionAvailability({
        ...baseInput,
        executingBatch: true,
      }),
    ).toMatchObject({
      keepBatchDisabled: true,
      rejectBatchDisabled: true,
      clearBatchDisabled: true,
    })
  })
})
