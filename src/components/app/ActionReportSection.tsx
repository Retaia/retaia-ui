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
      <h3 className="mb-2 text-base font-semibold text-gray-900">
        <BsBarChart className="mr-1 inline-block" aria-hidden="true" />
        {t('actions.reportTitle')}
      </h3>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-blue-light-300 bg-white px-3 py-2 text-sm font-semibold text-blue-light-700 transition-colors hover:bg-blue-light-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void onRefreshBatchReport()}
          disabled={refreshReportDisabled}
        >
          <BsArrowClockwise className="mr-1" aria-hidden="true" />
          {t('actions.reportFetch')}
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onExportBatchReport('json')}
          disabled={!reportData}
        >
          <BsFileEarmarkArrowDown className="mr-1" aria-hidden="true" />
          {t('actions.reportExportJson')}
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onExportBatchReport('csv')}
          disabled={!reportData}
        >
          <BsFileEarmarkArrowDown className="mr-1" aria-hidden="true" />
          {t('actions.reportExportCsv')}
        </button>
        <p className="text-xs text-gray-500 mb-0">
          {reportBatchId ? `batch_id: ${reportBatchId}` : t('actions.reportEmpty')}
        </p>
      </div>
      {reportStatus ? (
        <p data-testid="batch-report-status" role="status" aria-live="polite" className="text-xs mt-2 mb-0 text-gray-500">
          {reportStatus}
        </p>
      ) : null}
      {displayedReport ? (
        showingRecentReport ? (
          <p className="text-xs text-gray-500 mt-2 mb-1" data-testid="batch-report-recent-note">
            {t('actions.reportRecentFallback', { batchId: lastSuccessfulReportBatchId ?? '-' })}
          </p>
        ) : null
      ) : (
        <div className="mt-2 rounded border border-gray-200 bg-gray-100 p-2" data-testid="batch-report-empty-state">
          <p className="text-xs font-semibold mb-1">{t('actions.reportEmptyTitle')}</p>
          <p className="text-xs text-gray-500 mb-2">
            {reportBatchId
              ? t('actions.reportEmptyHintWithBatch', { batchId: reportBatchId })
              : t('actions.reportEmptyHintNoBatch')}
          </p>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-brand-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:border-brand-600 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void onRefreshBatchReport()}
            disabled={refreshReportDisabled}
            data-testid="batch-report-empty-cta"
          >
            {t('actions.reportFetchCta')}
          </button>
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
        <p data-testid="batch-report-export-status" className="text-xs mt-2 mb-0 text-gray-500">
          {reportExportStatus}
        </p>
      ) : null}
    </section>
  )
}
