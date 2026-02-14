import { Button, Card, Stack } from 'react-bootstrap'
import {
  BsArrowClockwise,
  BsTools,
} from 'react-icons/bs'
import { ActionBatchSection } from './ActionBatchSection'
import { ActionJournalSection } from './ActionJournalSection'
import { ActionQuickPanelSection } from './ActionQuickPanelSection'
import { ActionReportSection } from './ActionReportSection'
import { ActionShortcutsSection } from './ActionShortcutsSection'
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
  return (
    <Card as="section" className="shadow-sm border-0 mt-3">
      <Card.Body>
        <h2 className="h5 mb-3">
          <BsTools className="me-2" aria-hidden="true" />
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
        {previewStatus ? (
          <p
            data-testid="batch-preview-status"
            role="status"
            aria-live="polite"
            className={[
              'mt-2',
              'mb-0',
              previewStatus.kind === 'success' ? 'text-success' : 'text-danger',
            ].join(' ')}
          >
            {previewStatus.message}
          </p>
        ) : null}
        {executeStatus ? (
          <p
            data-testid="batch-execute-status"
            role="status"
            aria-live="polite"
            className={[
              'mt-2',
              'mb-0',
              executeStatus.kind === 'success' ? 'text-success' : 'text-danger',
            ].join(' ')}
          >
            {executeStatus.message}
          </p>
        ) : null}
        {retryStatus ? (
          <p data-testid="api-retry-status" role="status" aria-live="polite" className="small mt-2 mb-0 text-warning">
            {retryStatus}
          </p>
        ) : null}
        <ActionReportSection
          t={t}
          refreshReportDisabled={availability.refreshReportDisabled}
          reportBatchId={reportBatchId}
          reportStatus={reportStatus}
          reportData={reportData}
          reportExportStatus={reportExportStatus}
          onRefreshBatchReport={onRefreshBatchReport}
          onExportBatchReport={onExportBatchReport}
        />
        <Stack direction="horizontal" className="flex-wrap align-items-center gap-2 mt-3">
          <Button
            type="button"
            variant="warning"
            onClick={onUndoLastAction}
            disabled={availability.undoDisabled}
          >
            <BsArrowClockwise className="me-1" aria-hidden="true" />
            {t('actions.undo')}
          </Button>
          <p className="mb-0 fw-semibold text-secondary">
            {t('actions.history', { count: undoStackLength })}
          </p>
        </Stack>
        <ActionJournalSection t={t} activityLog={activityLog} onClearActivityLog={onClearActivityLog} />
        <ActionShortcutsSection
          t={t}
          showShortcutsHelp={showShortcutsHelp}
          onToggleShortcutsHelp={onToggleShortcutsHelp}
          onFocusPending={onFocusPending}
          onToggleBatchOnly={onToggleBatchOnly}
          onOpenNextPending={onOpenNextPending}
        />
      </Card.Body>
    </Card>
  )
}
