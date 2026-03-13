import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { getActionAvailability } from '../../domain/actionAvailability'
import { ActionBatchSection } from './ActionBatchSection'

const t = (key: string) => key

function createAvailability() {
  return getActionAvailability({
    visibleCount: 3,
    batchCount: 2,
    previewingBatch: false,
    executingBatch: false,
    schedulingBatchExecution: false,
    reportBatchId: null,
    reportLoading: false,
    undoCount: 0,
    selectedAssetState: null,
    previewingPurge: false,
    executingPurge: false,
    purgePreviewMatchesSelected: false,
  })
}

describe('ActionBatchSection', () => {
  it('renders scope and timeline', () => {
    render(
      <ActionBatchSection
        t={t}
        availability={createAvailability()}
        batchIdsLength={2}
        batchScope={{ pending: 1, keep: 1, reject: 0 }}
        batchTimeline={[{ key: 'queued', active: true, done: false, label: 'queued' }]}
        pendingBatchExecution={null}
        pendingBatchUndoSeconds={0}
        previewingBatch={false}
        executingBatch={false}
        onApplyDecisionToBatch={vi.fn()}
        onClearBatch={vi.fn()}
        onPreviewBatchMove={vi.fn(async () => {})}
        onExecuteBatchMove={vi.fn(async () => {})}
        onCancelPendingBatchExecution={vi.fn()}
      />,
    )

    expect(screen.getByText('actions.batchSelected')).toBeInTheDocument()
    expect(screen.getByTestId('batch-timeline')).toBeInTheDocument()
  })

  it('forwards batch action callbacks', async () => {
    const user = userEvent.setup()
    const onApplyDecisionToBatch = vi.fn()
    const onClearBatch = vi.fn()
    const onPreviewBatchMove = vi.fn(async () => {})
    const onExecuteBatchMove = vi.fn(async () => {})
    const onCancelPendingBatchExecution = vi.fn()

    render(
      <ActionBatchSection
        t={t}
        availability={createAvailability()}
        batchIdsLength={2}
        batchScope={{ pending: 1, keep: 1, reject: 0 }}
        batchTimeline={[{ key: 'queued', active: true, done: false, label: 'queued' }]}
        pendingBatchExecution={{ expiresAt: Date.now() + 1000 }}
        pendingBatchUndoSeconds={5}
        previewingBatch={false}
        executingBatch={false}
        onApplyDecisionToBatch={onApplyDecisionToBatch}
        onClearBatch={onClearBatch}
        onPreviewBatchMove={onPreviewBatchMove}
        onExecuteBatchMove={onExecuteBatchMove}
        onCancelPendingBatchExecution={onCancelPendingBatchExecution}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'actions.keepBatch' }))
    expect(onApplyDecisionToBatch).toHaveBeenCalledWith('KEEP')

    await user.click(screen.getByRole('button', { name: 'actions.rejectBatch' }))
    expect(onApplyDecisionToBatch).toHaveBeenCalledWith('REJECT')

    await user.click(screen.getByRole('button', { name: 'actions.clearBatch' }))
    expect(onClearBatch).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'actions.previewBatch' }))
    expect(onPreviewBatchMove).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'actions.executeConfirmNow' }))
    expect(onExecuteBatchMove).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'actions.executeCancel' }))
    expect(onCancelPendingBatchExecution).toHaveBeenCalled()
  })
})
