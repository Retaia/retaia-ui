import { useState } from 'react'
import {
  BsArrowClockwise,
  BsChevronDown,
  BsChevronUp,
  BsTools,
} from 'react-icons/bs'
import { ActionBatchSection } from './ActionBatchSection'
import { ActionJournalSection } from './ActionJournalSection'
import { ActionQuickPanelSection } from './ActionQuickPanelSection'
import { ActionReportSection } from './ActionReportSection'
import { ActionShortcutsSection } from './ActionShortcutsSection'
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

type ActivityEntry = {
  id: number
  label: string
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
  activityLog: ActivityEntry[]
  showShortcutsHelp: boolean
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
  onClearActivityLog: () => void
  onToggleShortcutsHelp: () => void
  onOpenNextPending: () => void
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
  activityLog,
  showShortcutsHelp,
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
  onClearActivityLog,
  onToggleShortcutsHelp,
  onOpenNextPending,
}: Props) {
  const [showAdvancedActions, setShowAdvancedActions] = useState(false)
  const isAdvancedActionsOpen = showShortcutsHelp || showAdvancedActions

  return (
    <section className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          <BsTools className="mr-2 inline-block" aria-hidden="true" />
          {t('actions.title')}
        </h2>
        <ActionQuickPanelSection
          t={t}
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
        <ActionJournalSection t={t} activityLog={activityLog} onClearActivityLog={onClearActivityLog} />
        <section className="border rounded p-3 mt-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="mb-0 text-base font-semibold text-gray-900">{t('actions.advancedTitle')}</h3>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              onClick={() => setShowAdvancedActions((value) => !value)}
              aria-expanded={isAdvancedActionsOpen}
              aria-controls="advanced-actions-panel"
            >
              {isAdvancedActionsOpen ? (
                <BsChevronUp className="mr-1" aria-hidden="true" />
              ) : (
                <BsChevronDown className="mr-1" aria-hidden="true" />
              )}
              {isAdvancedActionsOpen ? t('actions.advancedHide') : t('actions.advancedShow')}
            </button>
          </div>
          {isAdvancedActionsOpen ? (
            <div id="advanced-actions-panel" data-testid="actions-advanced-panel" className="mt-3">
              <ActionShortcutsSection
                t={t}
                showShortcutsHelp={showShortcutsHelp}
                onToggleShortcutsHelp={onToggleShortcutsHelp}
                onFocusPending={onFocusPending}
                onToggleBatchOnly={onToggleBatchOnly}
                onOpenNextPending={onOpenNextPending}
              />
            </div>
          ) : null}
        </section>
    </section>
  )
}
