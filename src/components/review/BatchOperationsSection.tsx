import { BsLayers } from 'react-icons/bs'
import { ActionBatchSection } from '../app/ActionBatchSection'
import { BatchExecutionStatusAlerts } from './BatchExecutionStatusAlerts'
import { getActionAvailability } from '../../domain/actionAvailability'

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
  availability: ReturnType<typeof getActionAvailability>
  batchIdsLength: number
  batchScope: { pending: number; keep: number; reject: number }
  batchTimeline: Array<{ key: string; active: boolean; done: boolean; error?: boolean; label: string }>
  pendingBatchExecution: { expiresAt: number } | null
  pendingBatchUndoSeconds: number
  previewingBatch: boolean
  executingBatch: boolean
  previewStatus: { kind: 'success' | 'error'; message: string } | null
  executeStatus: { kind: 'success' | 'error'; message: string } | null
  shouldRefreshAssetsAfterConflict: boolean
  retryStatus: string | null
  onApplyDecisionToBatch: (action: 'KEEP' | 'REJECT') => void
  onClearBatch: () => void
  onPreviewBatchMove: () => Promise<void>
  onExecuteBatchMove: () => Promise<void>
  onCancelPendingBatchExecution: () => void
  onRefreshAssetsAfterBatchConflict: () => Promise<void>
}

export function BatchOperationsSection({
  t,
  availability,
  batchIdsLength,
  batchScope,
  batchTimeline,
  pendingBatchExecution,
  pendingBatchUndoSeconds,
  previewingBatch,
  executingBatch,
  previewStatus,
  executeStatus,
  shouldRefreshAssetsAfterConflict,
  retryStatus,
  onApplyDecisionToBatch,
  onClearBatch,
  onPreviewBatchMove,
  onExecuteBatchMove,
  onCancelPendingBatchExecution,
  onRefreshAssetsAfterBatchConflict,
}: Props) {
  return (
    <section className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          <BsLayers className="mr-2 inline-block" aria-hidden="true" />
          {t('app.nav.batch')}
        </h2>
        <ActionBatchSection
          t={t}
          availability={availability}
          batchIdsLength={batchIdsLength}
          batchScope={batchScope}
          batchTimeline={batchTimeline}
          pendingBatchExecution={pendingBatchExecution}
          pendingBatchUndoSeconds={pendingBatchUndoSeconds}
          previewingBatch={previewingBatch}
          executingBatch={executingBatch}
          onApplyDecisionToBatch={onApplyDecisionToBatch}
          onClearBatch={onClearBatch}
          onPreviewBatchMove={onPreviewBatchMove}
          onExecuteBatchMove={onExecuteBatchMove}
          onCancelPendingBatchExecution={onCancelPendingBatchExecution}
        />
        <BatchExecutionStatusAlerts
          previewStatus={previewStatus}
          executeStatus={executeStatus}
          shouldRefreshAssetsAfterConflict={shouldRefreshAssetsAfterConflict}
          onRefreshAssetsAfterConflict={onRefreshAssetsAfterBatchConflict}
          refreshAssetsLabel={t('actions.refreshAssets')}
          retryStatus={retryStatus}
        />
    </section>
  )
}
