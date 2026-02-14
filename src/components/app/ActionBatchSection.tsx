import { Button, Stack } from 'react-bootstrap'
import {
  BsCheck2Circle,
  BsFilterCircle,
  BsLayers,
  BsSlashCircle,
  BsTrash3,
  BsXCircle,
} from 'react-icons/bs'
import type { getActionAvailability } from '../../domain/actionAvailability'

type BatchScope = {
  pending: number
  keep: number
  reject: number
}

type BatchTimelineStep = {
  key: string
  active: boolean
  done: boolean
  error?: boolean
  label: string
}

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
  availability: ReturnType<typeof getActionAvailability>
  batchIdsLength: number
  batchScope: BatchScope
  batchTimeline: BatchTimelineStep[]
  pendingBatchExecution: { expiresAt: number } | null
  pendingBatchUndoSeconds: number
  previewingBatch: boolean
  executingBatch: boolean
  onApplyDecisionToBatch: (action: 'KEEP' | 'REJECT') => void
  onClearBatch: () => void
  onPreviewBatchMove: () => Promise<void>
  onExecuteBatchMove: () => Promise<void>
  onCancelPendingBatchExecution: () => void
}

export function ActionBatchSection({
  t,
  availability,
  batchIdsLength,
  batchScope,
  batchTimeline,
  pendingBatchExecution,
  pendingBatchUndoSeconds,
  previewingBatch,
  executingBatch,
  onApplyDecisionToBatch,
  onClearBatch,
  onPreviewBatchMove,
  onExecuteBatchMove,
  onCancelPendingBatchExecution,
}: Props) {
  return (
    <section className="border border-2 border-secondary-subtle rounded p-3 mt-3">
      <h3 className="h6 mb-2">
        <BsLayers className="me-1" aria-hidden="true" />
        {t('actions.batchPanel')}
      </h3>
      <Stack direction="horizontal" className="flex-wrap align-items-center gap-2">
        <p className="mb-0 fw-semibold text-secondary">{t('actions.batchSelected', { count: batchIdsLength })}</p>
        <Button
          type="button"
          variant="outline-success"
          onClick={() => onApplyDecisionToBatch('KEEP')}
          disabled={availability.keepBatchDisabled}
        >
          <BsCheck2Circle className="me-1" aria-hidden="true" />
          {t('actions.keepBatch')}
        </Button>
        <Button
          type="button"
          variant="outline-danger"
          onClick={() => onApplyDecisionToBatch('REJECT')}
          disabled={availability.rejectBatchDisabled}
        >
          <BsXCircle className="me-1" aria-hidden="true" />
          {t('actions.rejectBatch')}
        </Button>
        <Button
          type="button"
          variant="outline-secondary"
          onClick={onClearBatch}
          disabled={availability.clearBatchDisabled}
        >
          <BsTrash3 className="me-1" aria-hidden="true" />
          {t('actions.clearBatch')}
        </Button>
        <Button
          type="button"
          variant="outline-info"
          onClick={() => void onPreviewBatchMove()}
          disabled={availability.previewBatchDisabled}
        >
          <BsFilterCircle className="me-1" aria-hidden="true" />
          {previewingBatch ? t('actions.previewing') : t('actions.previewBatch')}
        </Button>
        <Button
          type="button"
          variant="info"
          onClick={() => void onExecuteBatchMove()}
          disabled={availability.executeBatchDisabled}
        >
          <BsCheck2Circle className="me-1" aria-hidden="true" />
          {executingBatch
            ? t('actions.executing')
            : pendingBatchExecution
              ? t('actions.executeConfirmNow')
              : t('actions.executeBatch')}
        </Button>
      </Stack>
      <section className="mt-2" aria-label={t('actions.batchScope')}>
        <p className="mb-1 small text-secondary">{t('actions.batchScopeCount', { count: batchIdsLength })}</p>
        <p className="mb-0 small text-secondary">
          {[
            t('actions.batchScopePending', { count: batchScope.pending }),
            t('actions.batchScopeKeep', { count: batchScope.keep }),
            t('actions.batchScopeReject', { count: batchScope.reject }),
          ].join(' · ')}
        </p>
      </section>
      <section className="mt-2" aria-label={t('actions.timelineTitle')}>
        <p className="mb-1 small text-secondary">{t('actions.timelineTitle')}</p>
        <div data-testid="batch-timeline" className="d-flex flex-wrap gap-2">
          {batchTimeline.map((step) => (
            <span
              key={step.key}
              className={[
                'badge',
                step.active ? 'text-bg-info' : step.done ? 'text-bg-success' : 'text-bg-secondary',
                step.error ? 'text-bg-danger' : '',
              ].join(' ')}
            >
              {step.label}
            </span>
          ))}
        </div>
      </section>
      {previewingBatch || executingBatch ? (
        <p data-testid="batch-busy-status" className="small text-secondary mt-2 mb-0">
          {t('actions.batchBusy')}
        </p>
      ) : null}
      {pendingBatchExecution ? (
        <Stack direction="horizontal" className="flex-wrap gap-2 mt-2">
          <p data-testid="batch-execute-undo-status" className="small text-warning mb-0">
            {t('actions.executeUndoWindow', {
              seconds: pendingBatchUndoSeconds,
            })}
          </p>
          <Button type="button" size="sm" variant="outline-warning" onClick={onCancelPendingBatchExecution}>
            <BsSlashCircle className="me-1" aria-hidden="true" />
            {t('actions.executeCancel')}
          </Button>
        </Stack>
      ) : null}
    </section>
  )
}
