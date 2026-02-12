import { Button, Card, Col, Row, Stack } from 'react-bootstrap'
import {
  BsArrowRightCircle,
  BsArrowClockwise,
  BsArrowsCollapse,
  BsCameraVideo,
  BsCheck2Circle,
  BsClockHistory,
  BsColumnsGap,
  BsEraser,
  BsEye,
  BsEyeSlash,
  BsFileEarmarkArrowDown,
  BsFilter,
  BsFilterCircle,
  BsFolderCheck,
  BsImages,
  BsKeyboard,
  BsListUl,
  BsPinAngle,
  BsSlashCircle,
  BsTools,
  BsTrash3,
  BsTrash3Fill,
  BsXCircle,
  BsLayers,
  BsLightningCharge,
  BsBarChart,
  BsInbox,
} from 'react-icons/bs'
import { BatchReportView } from '../BatchReportView'
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
        <section className="border border-2 border-secondary-subtle rounded p-3 mt-2">
          <h3 className="h6 mb-2">
            <BsLightningCharge className="me-1" aria-hidden="true" />
            {t('actions.quickPanel')}
          </h3>
          <Stack direction="horizontal" className="flex-wrap gap-2 mb-2" aria-label={t('actions.savedViews')}>
            <Button type="button" size="sm" variant="outline-secondary" onClick={() => onApplySavedView('DEFAULT')}>
              <BsColumnsGap className="me-1" aria-hidden="true" />
              {t('actions.viewDefault')}
            </Button>
            <Button type="button" size="sm" variant="outline-secondary" onClick={() => onApplySavedView('PENDING')}>
              <BsClockHistory className="me-1" aria-hidden="true" />
              {t('actions.viewPending')}
            </Button>
            <Button type="button" size="sm" variant="outline-secondary" onClick={() => onApplySavedView('BATCH')}>
              <BsFolderCheck className="me-1" aria-hidden="true" />
              {t('actions.viewBatch')}
            </Button>
          </Stack>
          <Stack direction="horizontal" className="flex-wrap gap-2 mb-2" aria-label={t('actions.filterPresets')}>
            <Button type="button" size="sm" variant="outline-secondary" onClick={onApplyPresetPendingRecent}>
              <BsFilter className="me-1" aria-hidden="true" />
              {t('actions.filterPresetPendingRecent')}
            </Button>
            <Button type="button" size="sm" variant="outline-secondary" onClick={onApplyPresetImagesRejected}>
              <BsImages className="me-1" aria-hidden="true" />
              {t('actions.filterPresetRejectedImages')}
            </Button>
            <Button type="button" size="sm" variant="outline-secondary" onClick={onApplyPresetMediaReview}>
              <BsCameraVideo className="me-1" aria-hidden="true" />
              {t('actions.filterPresetMediaReview')}
            </Button>
          </Stack>
          <Stack direction="horizontal" className="flex-wrap gap-2">
            <Button type="button" variant="outline-primary" onClick={onFocusPending}>
              <BsClockHistory className="me-1" aria-hidden="true" />
              {t('actions.focusPending')}
            </Button>
            <Button type="button" variant={batchOnly ? 'primary' : 'outline-primary'} onClick={onToggleBatchOnly}>
              <BsPinAngle className="me-1" aria-hidden="true" />
              {batchOnly ? t('actions.batchOnlyOn') : t('actions.batchOnlyOff')}
            </Button>
            <Button
              type="button"
              variant="outline-success"
              onClick={() => onApplyDecisionToVisible('KEEP')}
              disabled={availability.keepVisibleDisabled}
            >
              <BsCheck2Circle className="me-1" aria-hidden="true" />
              {t('actions.keepVisible')}
            </Button>
            <Button
              type="button"
              variant="outline-danger"
              onClick={() => onApplyDecisionToVisible('REJECT')}
              disabled={availability.rejectVisibleDisabled}
            >
              <BsXCircle className="me-1" aria-hidden="true" />
              {t('actions.rejectVisible')}
            </Button>
            <Button type="button" variant="outline-secondary" onClick={onClearFilters}>
              <BsEraser className="me-1" aria-hidden="true" />
              {t('actions.clearFilters')}
            </Button>
            <Button type="button" variant="outline-secondary" onClick={onToggleDensityMode}>
              <BsArrowsCollapse className="me-1" aria-hidden="true" />
              {densityMode === 'COMPACT'
                ? t('actions.densityCompact')
                : t('actions.densityComfortable')}
            </Button>
          </Stack>
        </section>
        <section className="border border-2 border-secondary-subtle rounded p-3 mt-3">
          <h3 className="h6 mb-2">
            <BsLayers className="me-1" aria-hidden="true" />
            {t('actions.batchPanel')}
          </h3>
          <Stack direction="horizontal" className="flex-wrap align-items-center gap-2">
            <p className="mb-0 fw-semibold text-secondary">
              {t('actions.batchSelected', { count: batchIdsLength })}
            </p>
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
            <p className="mb-1 small text-secondary">
              {t('actions.batchScopeCount', { count: batchIdsLength })}
            </p>
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
              <Button
                type="button"
                size="sm"
                variant="outline-warning"
                onClick={onCancelPendingBatchExecution}
              >
                <BsSlashCircle className="me-1" aria-hidden="true" />
                {t('actions.executeCancel')}
              </Button>
            </Stack>
          ) : null}
        </section>
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
        <section className="border border-2 border-secondary-subtle rounded p-3 mt-3">
          <h3 className="h6 mb-2">
            <BsBarChart className="me-1" aria-hidden="true" />
            {t('actions.reportTitle')}
          </h3>
          <Stack direction="horizontal" className="flex-wrap align-items-center gap-2">
            <Button
              type="button"
              variant="outline-info"
              onClick={() => void onRefreshBatchReport()}
              disabled={availability.refreshReportDisabled}
            >
              <BsArrowClockwise className="me-1" aria-hidden="true" />
              {t('actions.reportFetch')}
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => onExportBatchReport('json')}
              disabled={!reportData}
            >
              <BsFileEarmarkArrowDown className="me-1" aria-hidden="true" />
              {t('actions.reportExportJson')}
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => onExportBatchReport('csv')}
              disabled={!reportData}
            >
              <BsFileEarmarkArrowDown className="me-1" aria-hidden="true" />
              {t('actions.reportExportCsv')}
            </Button>
            <p className="small text-secondary mb-0">
              {reportBatchId ? `batch_id: ${reportBatchId}` : t('actions.reportEmpty')}
            </p>
          </Stack>
          {reportStatus ? (
            <p
              data-testid="batch-report-status"
              role="status"
              aria-live="polite"
              className="small mt-2 mb-0 text-secondary"
            >
              {reportStatus}
            </p>
          ) : null}
          {reportData ? (
            <BatchReportView
              report={reportData}
              labels={{
                summary: t('actions.reportSummary'),
                status: t('actions.reportStatusLabel'),
                moved: t('actions.reportMovedLabel'),
                failed: t('actions.reportFailedLabel'),
                errors: t('actions.reportErrorsLabel'),
                noErrors: t('actions.reportNoErrors'),
              }}
            />
          ) : null}
          {reportExportStatus ? (
            <p data-testid="batch-report-export-status" className="small mt-2 mb-0 text-secondary">
              {reportExportStatus}
            </p>
          ) : null}
        </section>
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
        <section className="border border-2 border-secondary-subtle rounded p-3 mt-3" aria-label={t('actions.journal')}>
          <Stack direction="horizontal" className="justify-content-between align-items-center gap-2 mb-2">
            <h3 className="h6 mb-0">
              <BsListUl className="me-1" aria-hidden="true" />
              {t('actions.journal')}
            </h3>
            <Button
              type="button"
              size="sm"
              variant="outline-secondary"
              onClick={onClearActivityLog}
              disabled={activityLog.length === 0}
            >
              <BsTrash3Fill className="me-1" aria-hidden="true" />
              {t('actions.journalClear')}
            </Button>
          </Stack>
          {activityLog.length === 0 ? (
            <p className="text-secondary mb-0">
              <BsInbox className="me-1" aria-hidden="true" />
              {t('actions.journalEmpty')}
            </p>
          ) : (
            <ul className="mb-0">
              {activityLog.map((entry) => (
                <li key={entry.id}>{entry.label}</li>
              ))}
            </ul>
          )}
        </section>
        <section className="border border-2 border-secondary-subtle rounded p-3 mt-3">
          <Stack direction="horizontal" className="justify-content-between align-items-center gap-2">
            <h3 className="h6 mb-0">
              <BsKeyboard className="me-1" aria-hidden="true" />
              {t('actions.shortcutsTitle')}
            </h3>
            <Button
              type="button"
              size="sm"
              variant="outline-secondary"
              onClick={onToggleShortcutsHelp}
            >
              {showShortcutsHelp ? (
                <BsEyeSlash className="me-1" aria-hidden="true" />
              ) : (
                <BsEye className="me-1" aria-hidden="true" />
              )}
              {showShortcutsHelp
                ? t('actions.shortcutsToggleHide')
                : t('actions.shortcutsToggleShow')}
            </Button>
          </Stack>
          {showShortcutsHelp ? (
            <section data-testid="shortcuts-overlay" className="mt-3 border border-secondary rounded p-3">
              <p className="small text-secondary mb-2">{t('actions.shortcuts')}</p>
              <Row className="g-3">
                <Col xs={12} md={4}>
                  <h4 className="h6 mb-2">{t('actions.shortcutsNavTitle')}</h4>
                  <ul className="small mb-0">
                    <li>{t('actions.shortcutsNavList')}</li>
                  </ul>
                </Col>
                <Col xs={12} md={4}>
                  <h4 className="h6 mb-2">{t('actions.shortcutsBatchTitle')}</h4>
                  <ul className="small mb-0">
                    <li>{t('actions.shortcutsBatchList')}</li>
                  </ul>
                </Col>
                <Col xs={12} md={4}>
                  <h4 className="h6 mb-2">{t('actions.shortcutsFlowTitle')}</h4>
                  <ul className="small mb-0">
                    <li>{t('actions.shortcutsFlowList')}</li>
                  </ul>
                </Col>
              </Row>
              <Stack direction="horizontal" className="flex-wrap gap-2 mt-3">
                <Button size="sm" variant="outline-primary" onClick={onFocusPending}>
                  <BsClockHistory className="me-1" aria-hidden="true" />
                  {t('actions.shortcutsActionPending')}
                </Button>
                <Button size="sm" variant="outline-primary" onClick={onToggleBatchOnly}>
                  <BsPinAngle className="me-1" aria-hidden="true" />
                  {t('actions.shortcutsActionBatch')}
                </Button>
                <Button size="sm" variant="outline-primary" onClick={onOpenNextPending}>
                  <BsArrowRightCircle className="me-1" aria-hidden="true" />
                  {t('actions.shortcutsActionNext')}
                </Button>
              </Stack>
            </section>
          ) : null}
        </section>
      </Card.Body>
    </Card>
  )
}
