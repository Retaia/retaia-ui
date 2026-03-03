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
  panelId?: string
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
  panelId = 'batch-edit-panel',
}: Props) {
  return (
    <section id={panelId} tabIndex={-1} className="border border-2 border-gray-200 rounded p-3 mt-3">
      <h3 className="mb-2 text-base font-semibold text-gray-900">
        <BsLayers className="mr-1 inline-block" aria-hidden="true" />
        {t('actions.batchPanel')}
      </h3>
      <div className="flex flex-wrap items-center gap-2">
        <p className="mb-0 font-semibold text-gray-500">{t('actions.batchSelected', { count: batchIdsLength })}</p>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-success-300 bg-white px-3 py-2 text-sm font-semibold text-success-700 transition-colors hover:bg-success-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onApplyDecisionToBatch('KEEP')}
          disabled={availability.keepBatchDisabled}
        >
          <BsCheck2Circle className="mr-1" aria-hidden="true" />
          {t('actions.keepBatch')}
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-error-300 bg-white px-3 py-2 text-sm font-semibold text-error-700 transition-colors hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onApplyDecisionToBatch('REJECT')}
          disabled={availability.rejectBatchDisabled}
        >
          <BsXCircle className="mr-1" aria-hidden="true" />
          {t('actions.rejectBatch')}
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onClearBatch}
          disabled={availability.clearBatchDisabled}
        >
          <BsTrash3 className="mr-1" aria-hidden="true" />
          {t('actions.clearBatch')}
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-blue-light-300 bg-white px-3 py-2 text-sm font-semibold text-blue-light-700 transition-colors hover:bg-blue-light-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void onPreviewBatchMove()}
          disabled={availability.previewBatchDisabled}
        >
          <BsFilterCircle className="mr-1" aria-hidden="true" />
          {previewingBatch ? t('actions.previewing') : t('actions.previewBatch')}
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-blue-light-500 bg-blue-light-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-light-600 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void onExecuteBatchMove()}
          disabled={availability.executeBatchDisabled}
        >
          <BsCheck2Circle className="mr-1" aria-hidden="true" />
          {executingBatch
            ? t('actions.executing')
            : pendingBatchExecution
              ? t('actions.executeConfirmNow')
              : t('actions.executeBatch')}
        </button>
      </div>
      <section className="mt-2" aria-label={t('actions.batchScope')}>
        <p className="mb-1 text-xs text-gray-500">{t('actions.batchScopeCount', { count: batchIdsLength })}</p>
        <p className="mb-0 text-xs text-gray-500">
          {[
            t('actions.batchScopePending', { count: batchScope.pending }),
            t('actions.batchScopeKeep', { count: batchScope.keep }),
            t('actions.batchScopeReject', { count: batchScope.reject }),
          ].join(' · ')}
        </p>
      </section>
      <section className="mt-2" aria-label={t('actions.timelineTitle')}>
        <p className="mb-1 small text-gray-500">{t('actions.timelineTitle')}</p>
        <div data-testid="batch-timeline" className="flex flex-wrap gap-2">
          {batchTimeline.map((step) => (
            <span
              key={step.key}
              className={[
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                step.active ? 'bg-blue-light-100 text-blue-light-800' : step.done ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-700',
                step.error ? 'bg-error-100 text-error-800' : '',
              ].join(' ')}
            >
              {step.label}
            </span>
          ))}
        </div>
      </section>
      {previewingBatch || executingBatch ? (
        <p data-testid="batch-busy-status" className="text-xs text-gray-500 mt-2 mb-0">
          {t('actions.batchBusy')}
        </p>
      ) : null}
      {pendingBatchExecution ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <p data-testid="batch-execute-undo-status" className="text-xs text-warning-700 mb-0">
            {t('actions.executeUndoWindow', {
              seconds: pendingBatchUndoSeconds,
            })}
          </p>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-warning-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-warning-700 transition-colors hover:bg-warning-50"
            onClick={onCancelPendingBatchExecution}
          >
            <BsSlashCircle className="mr-1" aria-hidden="true" />
            {t('actions.executeCancel')}
          </button>
        </div>
      ) : null}
    </section>
  )
}
