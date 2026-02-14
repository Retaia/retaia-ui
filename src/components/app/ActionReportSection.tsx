import { Button, Stack } from 'react-bootstrap'
import { BsArrowClockwise, BsBarChart, BsFileEarmarkArrowDown } from 'react-icons/bs'
import { BatchReportView } from '../BatchReportView'

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
  refreshReportDisabled: boolean
  reportBatchId: string | null
  reportStatus: string | null
  reportData: unknown
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
  reportExportStatus,
  onRefreshBatchReport,
  onExportBatchReport,
}: Props) {
  return (
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
        <p className="small text-secondary mb-0">
          {reportBatchId ? `batch_id: ${reportBatchId}` : t('actions.reportEmpty')}
        </p>
      </Stack>
      {reportStatus ? (
        <p data-testid="batch-report-status" role="status" aria-live="polite" className="small mt-2 mb-0 text-secondary">
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
  )
}
