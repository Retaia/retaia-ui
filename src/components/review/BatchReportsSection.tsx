import { Card } from 'react-bootstrap'
import { BsBarChart } from 'react-icons/bs'
import { ActionReportSection } from '../app/ActionReportSection'

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

export function BatchReportsSection({
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
    <Card as="section" className="shadow-sm border-0 mt-3">
      <Card.Body>
        <h2 className="h5 mb-3">
          <BsBarChart className="me-2" aria-hidden="true" />
          {t('app.nav.reports')}
        </h2>
        <ActionReportSection
          t={t}
          refreshReportDisabled={refreshReportDisabled}
          reportBatchId={reportBatchId}
          reportStatus={reportStatus}
          reportData={reportData}
          reportExportStatus={reportExportStatus}
          onRefreshBatchReport={onRefreshBatchReport}
          onExportBatchReport={onExportBatchReport}
        />
      </Card.Body>
    </Card>
  )
}
