import { useEffect, useState } from 'react'
import {
  BsArrowClockwise,
  BsTools,
} from 'react-icons/bs'
import { ActionBatchSection } from './ActionBatchSection'
import { ActionQuickPanelSection } from './ActionQuickPanelSection'
import { ActionReportSection } from './ActionReportSection'
import { BatchExecutionStatusAlerts } from '../review/BatchExecutionStatusAlerts'
import { getActionAvailability } from '../../domain/actionAvailability'
import { useQuickFilters } from '../../hooks/useQuickFilters'
import { useDensityMode } from '../../hooks/useDensityMode'

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

type StatusMessage = {
  kind: 'success' | 'error'
  message: string
}

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
  batchOnly: boolean
  densityMode: ReturnType<typeof useDensityMode>['densityMode']
  availability: ReturnType<typeof getActionAvailability>
  batchIdsLength: number
  batchScope: BatchScope
  batchTimeline: BatchTimelineStep[]
  pendingBatchExecution: { expiresAt: number } | null
  pendingBatchUndoSeconds: number
  previewingBatch: boolean
  executingBatch: boolean
  previewStatus: StatusMessage | null
  executeStatus: StatusMessage | null
  retryStatus: string | null
  reportBatchId: string | null
  reportStatus: string | null
  reportData: unknown
  lastSuccessfulReportBatchId: string | null
  lastSuccessfulReportData: unknown
  reportExportStatus: string | null
  undoStackLength: number
  onApplySavedView: ReturnType<typeof useQuickFilters>['applySavedView']
  onApplyPresetPendingRecent: ReturnType<typeof useQuickFilters>['applyPresetPendingRecent']
  onApplyPresetImagesRejected: ReturnType<typeof useQuickFilters>['applyPresetImagesRejected']
  onApplyPresetMediaReview: ReturnType<typeof useQuickFilters>['applyPresetMediaReview']
  onFocusPending: () => void
  onToggleBatchOnly: () => void
  onApplyDecisionToVisible: (action: 'KEEP' | 'REJECT') => void
  onClearFilters: () => void
  onToggleDensityMode: () => void
  onApplyDecisionToBatch: (action: 'KEEP' | 'REJECT') => void
  onClearBatch: () => void
  onPreviewBatchMove: () => Promise<void>
  onExecuteBatchMove: () => Promise<void>
  onCancelPendingBatchExecution: () => void
  onRefreshBatchReport: () => Promise<void>
  onExportBatchReport: (format: 'json' | 'csv') => void
  onUndoLastAction: () => void
}

export function ActionPanels({
  t,
  batchOnly,
  densityMode,
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
  reportBatchId,
  reportStatus,
  reportData,
  lastSuccessfulReportBatchId,
  lastSuccessfulReportData,
  reportExportStatus,
  undoStackLength,
  onApplySavedView,
  onApplyPresetPendingRecent,
  onApplyPresetImagesRejected,
  onApplyPresetMediaReview,
  onFocusPending,
  onToggleBatchOnly,
  onApplyDecisionToVisible,
  onClearFilters,
  onToggleDensityMode,
  onApplyDecisionToBatch,
  onClearBatch,
  onPreviewBatchMove,
  onExecuteBatchMove,
  onCancelPendingBatchExecution,
  onRefreshBatchReport,
  onExportBatchReport,
  onUndoLastAction,
}: Props) {
  const hasBatchSelection = batchIdsLength > 0
  const [isBatchSidebarOpen, setIsBatchSidebarOpen] = useState(false)

  useEffect(() => {
    setIsBatchSidebarOpen(hasBatchSelection)
  }, [hasBatchSelection])

  return (
    <>
      <section className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          <BsTools className="mr-2 inline-block" aria-hidden="true" />
          {t('actions.title')}
        </h2>
        <ActionQuickPanelSection
          t={t}
          batchIdsLength={batchIdsLength}
          batchOnly={batchOnly}
          densityMode={densityMode}
          availability={availability}
          onApplySavedView={onApplySavedView}
          onApplyPresetPendingRecent={onApplyPresetPendingRecent}
          onApplyPresetImagesRejected={onApplyPresetImagesRejected}
          onApplyPresetMediaReview={onApplyPresetMediaReview}
          onFocusPending={onFocusPending}
          onToggleBatchOnly={onToggleBatchOnly}
          onApplyDecisionToVisible={onApplyDecisionToVisible}
          onClearFilters={onClearFilters}
          onToggleDensityMode={onToggleDensityMode}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-warning-400 bg-warning-400 px-3 py-2 text-sm font-semibold text-gray-900 transition-colors hover:border-warning-500 hover:bg-warning-500 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onUndoLastAction}
            disabled={availability.undoDisabled}
          >
            <BsArrowClockwise className="mr-1" aria-hidden="true" />
            {t('actions.undo')}
          </button>
          <p className="mb-0 font-semibold text-gray-500">
            {t('actions.history', { count: undoStackLength })}
          </p>
        </div>
      </section>

      <div
        className={[
          'fixed inset-0 z-40 bg-black/20 transition-opacity duration-300',
          isBatchSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        aria-hidden={!isBatchSidebarOpen}
      />
      <aside
        id="batch-edit-panel"
        data-testid="batch-right-sidebar"
        className={[
          'fixed right-0 top-0 z-50 h-screen w-full max-w-xl border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 dark:border-gray-700 dark:bg-gray-900',
          isBatchSidebarOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        aria-label={t('app.nav.batch')}
      >
        <div className="flex h-full flex-col overflow-y-auto p-4">
          {hasBatchSelection ? (
            <>
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
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
              <ActionReportSection
                t={t}
                refreshReportDisabled={availability.refreshReportDisabled}
                reportBatchId={reportBatchId}
                reportStatus={reportStatus}
                reportData={reportData}
                lastSuccessfulReportBatchId={lastSuccessfulReportBatchId}
                lastSuccessfulReportData={lastSuccessfulReportData}
                reportExportStatus={reportExportStatus}
                onRefreshBatchReport={onRefreshBatchReport}
                onExportBatchReport={onExportBatchReport}
              />
            </>
          ) : null}
        </div>
      </aside>
    </>
  )
}
