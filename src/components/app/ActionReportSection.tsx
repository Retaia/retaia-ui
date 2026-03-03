import { Button, Stack } from '@tailadmin'
import { BsArrowClockwise, BsBarChart, BsFileEarmarkArrowDown } from 'react-icons/bs'
import { BatchReportView } from '../BatchReportView'

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
  refreshReportDisabled: boolean
  reportBatchId: string | null
  reportStatus: string | null
  reportData: unknown
  lastSuccessfulReportBatchId: string | null
  lastSuccessfulReportData: unknown
  reportExportStatus: string | null
  onRefreshBatchReport: () => Promise<void>
  onExportBatchReport: (format: 'json' | 'csv') => void
}

export function ActionReportSection({
  t,
  refreshReportDisabled,
  reportBatchId,
  reportStatus,
  reportData,
  lastSuccessfulReportBatchId,
  lastSuccessfulReportData,
  reportExportStatus,
  onRefreshBatchReport,
  onExportBatchReport,
}: Props) {
  const displayedReport = reportData ?? lastSuccessfulReportData
  const showingRecentReport = !reportData && Boolean(lastSuccessfulReportData)

  return (
    <section className="border border-2 border-gray-200 rounded p-3 mt-3">
      <h3 className="h6 mb-2">
        <BsBarChart className="me-1" aria-hidden="true" />
        {t('actions.reportTitle')}
      </h3>
      <Stack direction="horizontal" className="flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline-info"
          onClick={() => void onRefreshBatchReport()}
          disabled={refreshReportDisabled}
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
        <p className="small text-gray-500 mb-0">
          {reportBatchId ? `batch_id: ${reportBatchId}` : t('actions.reportEmpty')}
        </p>
      </Stack>
      {reportStatus ? (
        <p data-testid="batch-report-status" role="status" aria-live="polite" className="small mt-2 mb-0 text-gray-500">
          {reportStatus}
        </p>
      ) : null}
      {displayedReport ? (
        showingRecentReport ? (
          <p className="small text-gray-500 mt-2 mb-1" data-testid="batch-report-recent-note">
            {t('actions.reportRecentFallback', { batchId: lastSuccessfulReportBatchId ?? '-' })}
          </p>
        ) : null
      ) : (
        <div className="mt-2 p-2 rounded border bg-body-tertiary" data-testid="batch-report-empty-state">
          <p className="small font-semibold mb-1">{t('actions.reportEmptyTitle')}</p>
          <p className="small text-gray-500 mb-2">
            {reportBatchId
              ? t('actions.reportEmptyHintWithBatch', { batchId: reportBatchId })
              : t('actions.reportEmptyHintNoBatch')}
          </p>
          <Button
            type="button"
            size="sm"
            variant="primary"
            onClick={() => void onRefreshBatchReport()}
            disabled={refreshReportDisabled}
            data-testid="batch-report-empty-cta"
          >
            {t('actions.reportFetchCta')}
          </Button>
        </div>
      )}
      {displayedReport ? (
        <BatchReportView
          report={displayedReport}
          labels={{
            summary: t('actions.reportSummary'),
            status: t('actions.reportStatusLabel'),
            moved: t('actions.reportMovedLabel'),
            failed: t('actions.reportFailedLabel'),
            errors: t('actions.reportErrorsLabel'),
            noErrors: t('actions.reportNoErrors'),
            statusDone: t('actions.reportStatusDone'),
            statusPartial: t('actions.reportStatusPartial'),
            statusFailed: t('actions.reportStatusFailed'),
            statusUnknown: t('actions.reportStatusUnknown'),
          }}
        />
      ) : null}
      {reportExportStatus ? (
        <p data-testid="batch-report-export-status" className="small mt-2 mb-0 text-gray-500">
          {reportExportStatus}
        </p>
      ) : null}
    </section>
  )
}
