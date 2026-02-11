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
  const errors = parseErrors(parsed)

  return (
    <section className="mt-2" aria-label={labels.summary}>
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
              <td>{status}</td>
              <td>{moved}</td>
              <td>{failed}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 className="h6 mt-3 mb-2">{labels.errors}</h4>
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
                  <td>{row.assetId}</td>
                  <td>{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
