import { BsBarChart } from 'react-icons/bs'
import { ActionReportSection } from '../app/ActionReportSection'

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

export function BatchReportsSection({
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
  return (
    <section className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          <BsBarChart className="mr-2 inline-block" aria-hidden="true" />
          {t('app.nav.reports')}
        </h2>
        <ActionReportSection
          t={t}
          refreshReportDisabled={refreshReportDisabled}
          reportBatchId={reportBatchId}
          reportStatus={reportStatus}
          reportData={reportData}
          lastSuccessfulReportBatchId={lastSuccessfulReportBatchId}
          lastSuccessfulReportData={lastSuccessfulReportData}
          reportExportStatus={reportExportStatus}
          onRefreshBatchReport={onRefreshBatchReport}
          onExportBatchReport={onExportBatchReport}
        />
    </section>
  )
}
