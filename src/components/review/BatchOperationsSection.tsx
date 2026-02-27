import { Card } from 'react-bootstrap'
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
  retryStatus: string | null
  onApplyDecisionToBatch: (action: 'KEEP' | 'REJECT') => void
  onClearBatch: () => void
  onPreviewBatchMove: () => Promise<void>
  onExecuteBatchMove: () => Promise<void>
  onCancelPendingBatchExecution: () => void
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
  retryStatus,
  onApplyDecisionToBatch,
  onClearBatch,
  onPreviewBatchMove,
  onExecuteBatchMove,
  onCancelPendingBatchExecution,
}: Props) {
  return (
    <Card as="section" className="shadow-sm border-0 mt-3">
      <Card.Body>
        <h2 className="h5 mb-3">
          <BsLayers className="me-2" aria-hidden="true" />
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
          retryStatus={retryStatus}
        />
      </Card.Body>
    </Card>
  )
}
