import { BsCheckCircleFill, BsExclamationTriangle, BsInfoCircle, BsXCircle } from 'react-icons/bs'

type BatchReportViewProps = {
  report: unknown
  labels: {
    summary: string
    status: string
    moved: string
    failed: string
    errors: string
    noErrors: string
    statusDone: string
    statusPartial: string
    statusFailed: string
    statusUnknown: string
  }
}

type ReportErrorRow = {
  assetId: string
  reason: string
}

function getStatusVariant(status: string) {
  if (status === 'DONE') {
    return 'success'
  }
  if (status === 'PARTIAL') {
    return 'warning'
  }
  if (status === 'FAILED') {
    return 'danger'
  }
  return 'secondary'
}

function getStatusBadgeClass(statusVariant: ReturnType<typeof getStatusVariant>) {
  if (statusVariant === 'success') {
    return 'bg-success-100 text-success-800'
  }
  if (statusVariant === 'warning') {
    return 'bg-warning-100 text-warning-800'
  }
  if (statusVariant === 'danger') {
    return 'bg-error-100 text-error-800'
  }
  return 'bg-gray-100 text-gray-700'
}

function getStatusLabel(status: string, labels: BatchReportViewProps['labels']) {
  if (status === 'DONE') {
    return labels.statusDone
  }
  if (status === 'PARTIAL') {
    return labels.statusPartial
  }
  if (status === 'FAILED') {
    return labels.statusFailed
  }
  return labels.statusUnknown
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function asNumber(value: unknown) {
  return typeof value === 'number' ? value : 0
}

function parseErrors(report: Record<string, unknown>): ReportErrorRow[] {
  const rawErrors = report.errors
  if (!Array.isArray(rawErrors)) {
    return []
  }

  return rawErrors.flatMap((entry) => {
    const row = asRecord(entry)
    if (!row) {
      return []
    }
    const assetId = typeof row.asset_id === 'string' ? row.asset_id : 'n/a'
    const reason = typeof row.reason === 'string' ? row.reason : 'unknown'
    return [{ assetId, reason }]
  })
}

export function BatchReportView({ report, labels }: BatchReportViewProps) {
  const parsed = asRecord(report)
  if (!parsed) {
    return <pre className="small mt-2 mb-0 p-2 border rounded">{JSON.stringify(report, null, 2)}</pre>
  }

  const status = typeof parsed.status === 'string' ? parsed.status : 'UNKNOWN'
  const moved = asNumber(parsed.moved ?? parsed.moved_count)
  const failed = asNumber(parsed.failed ?? parsed.failed_count)
  const statusVariant = getStatusVariant(status)
  const statusLabel = getStatusLabel(status, labels)
  const errors = parseErrors(parsed).sort((a, b) => a.assetId.localeCompare(b.assetId))

  return (
    <section className="mt-2" aria-label={labels.summary} data-testid="batch-report-summary">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`badge ${getStatusBadgeClass(statusVariant)}`}>{statusLabel}</span>
        <span className="badge bg-success-100 text-success-800">
          <BsCheckCircleFill className="me-1" aria-hidden="true" />
          {`${labels.moved}: ${moved}`}
        </span>
        <span className="badge bg-error-100 text-error-800">
          <BsXCircle className="me-1" aria-hidden="true" />
          {`${labels.failed}: ${failed}`}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm mb-2">
          <thead>
            <tr>
              <th className="border border-gray-200 p-2 text-left align-middle">{labels.status}</th>
              <th className="border border-gray-200 p-2 text-left align-middle">{labels.moved}</th>
              <th className="border border-gray-200 p-2 text-left align-middle">{labels.failed}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 p-2 align-middle" data-testid="batch-report-status-value">{statusLabel}</td>
              <td className="border border-gray-200 p-2 align-middle" data-testid="batch-report-moved-value">{moved}</td>
              <td className="border border-gray-200 p-2 align-middle" data-testid="batch-report-failed-value">{failed}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 className="h6 mt-3 mb-2">
        <BsExclamationTriangle className="me-1" aria-hidden="true" />
        {`${labels.errors} (${errors.length})`}
      </h4>
      {errors.length === 0 ? (
        <p className="small mb-0 text-gray-500">
          <BsInfoCircle className="me-1" aria-hidden="true" />
          {labels.noErrors}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm mb-0">
            <thead>
              <tr>
                <th className="border border-gray-200 p-2 text-left align-middle">asset_id</th>
                <th className="border border-gray-200 p-2 text-left align-middle">reason</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((row, index) => (
                <tr key={`${row.assetId}-${index}`} className="odd:bg-gray-50">
                  <td className="border border-gray-200 p-2 align-middle" data-testid="batch-report-error-asset">{row.assetId}</td>
                  <td className="border border-gray-200 p-2 align-middle" data-testid="batch-report-error-reason">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
