import { BsCheckCircleFill, BsExclamationTriangle, BsXCircle } from 'react-icons/bs'

type BatchReportViewProps = {
  report: unknown
  labels: {
    summary: string
    status: string
    moved: string
    failed: string
    errors: string
    noErrors: string
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
  const errors = parseErrors(parsed).sort((a, b) => a.assetId.localeCompare(b.assetId))

  return (
    <section className="mt-2" aria-label={labels.summary} data-testid="batch-report-summary">
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <span className={`badge text-bg-${statusVariant}`}>{status}</span>
        <span className="badge text-bg-success">
          <BsCheckCircleFill className="me-1" aria-hidden="true" />
          {`${labels.moved}: ${moved}`}
        </span>
        <span className="badge text-bg-danger">
          <BsXCircle className="me-1" aria-hidden="true" />
          {`${labels.failed}: ${failed}`}
        </span>
      </div>
      <div className="table-responsive">
        <table className="table table-sm table-bordered align-middle mb-2">
          <thead>
            <tr>
              <th>{labels.status}</th>
              <th>{labels.moved}</th>
              <th>{labels.failed}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td data-testid="batch-report-status-value">{status}</td>
              <td data-testid="batch-report-moved-value">{moved}</td>
              <td data-testid="batch-report-failed-value">{failed}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 className="h6 mt-3 mb-2">
        <BsExclamationTriangle className="me-1" aria-hidden="true" />
        {`${labels.errors} (${errors.length})`}
      </h4>
      {errors.length === 0 ? (
        <p className="small mb-0 text-secondary">{labels.noErrors}</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm table-striped align-middle mb-0">
            <thead>
              <tr>
                <th>asset_id</th>
                <th>reason</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((row, index) => (
                <tr key={`${row.assetId}-${index}`}>
                  <td data-testid="batch-report-error-asset">{row.assetId}</td>
                  <td data-testid="batch-report-error-reason">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
