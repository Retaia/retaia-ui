import { ActionPanels } from '../app/ActionPanels'
import { ReviewTodoDonePanel } from '../app/ReviewTodoDonePanel'
import type { Asset } from '../../domain/assets'
import { getActionAvailability } from '../../domain/actionAvailability'
import type { DensityMode } from '../../hooks/useDensityMode'

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
  batchOnly: boolean
  densityMode: DensityMode
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
  reportBatchId: string | null
  reportStatus: string | null
  reportData: unknown
  lastSuccessfulReportBatchId: string | null
  lastSuccessfulReportData: unknown
  reportExportStatus: string | null
  undoStackLength: number
  todoAssets: Asset[]
  doneAssets: Asset[]
  onApplySavedView: (view: 'DEFAULT' | 'PENDING' | 'BATCH') => void
  onApplyPresetPendingRecent: () => void
  onApplyPresetImagesRejected: () => void
  onApplyPresetMediaReview: () => void
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
  onOpenAsset: (assetId: string) => void
}

export function ReviewWorkspaceSection(props: Props) {
  const {
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
    todoAssets,
    doneAssets,
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
    onOpenAsset,
  } = props

  return (
    <>
      <ActionPanels
        t={t}
        batchOnly={batchOnly}
        densityMode={densityMode}
        availability={availability}
        batchIdsLength={batchIdsLength}
        batchScope={batchScope}
        batchTimeline={batchTimeline}
        pendingBatchExecution={pendingBatchExecution}
        pendingBatchUndoSeconds={pendingBatchUndoSeconds}
        previewingBatch={previewingBatch}
        executingBatch={executingBatch}
        previewStatus={previewStatus}
        executeStatus={executeStatus}
        retryStatus={retryStatus}
        reportBatchId={reportBatchId}
        reportStatus={reportStatus}
        reportData={reportData}
        lastSuccessfulReportBatchId={lastSuccessfulReportBatchId}
        lastSuccessfulReportData={lastSuccessfulReportData}
        reportExportStatus={reportExportStatus}
        undoStackLength={undoStackLength}
        onApplySavedView={onApplySavedView}
        onApplyPresetPendingRecent={onApplyPresetPendingRecent}
        onApplyPresetImagesRejected={onApplyPresetImagesRejected}
        onApplyPresetMediaReview={onApplyPresetMediaReview}
        onFocusPending={onFocusPending}
        onToggleBatchOnly={onToggleBatchOnly}
        onApplyDecisionToVisible={onApplyDecisionToVisible}
        onClearFilters={onClearFilters}
        onToggleDensityMode={onToggleDensityMode}
        onApplyDecisionToBatch={onApplyDecisionToBatch}
        onClearBatch={onClearBatch}
        onPreviewBatchMove={onPreviewBatchMove}
        onExecuteBatchMove={onExecuteBatchMove}
        onCancelPendingBatchExecution={onCancelPendingBatchExecution}
        onRefreshBatchReport={onRefreshBatchReport}
        onExportBatchReport={onExportBatchReport}
        onUndoLastAction={onUndoLastAction}
      />
      <ReviewTodoDonePanel
        t={t}
        todoAssets={todoAssets}
        doneAssets={doneAssets}
        onOpenAsset={onOpenAsset}
      />
    </>
  )
}
