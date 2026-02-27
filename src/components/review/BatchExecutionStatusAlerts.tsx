type StatusMessage = {
  kind: 'success' | 'error'
  message: string
}

type Props = {
  previewStatus: StatusMessage | null
  executeStatus: StatusMessage | null
  retryStatus: string | null
}

export function BatchExecutionStatusAlerts({ previewStatus, executeStatus, retryStatus }: Props) {
  return (
    <>
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
    </>
  )
}
