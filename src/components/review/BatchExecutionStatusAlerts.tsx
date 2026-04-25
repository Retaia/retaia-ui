type StatusMessage = {
  kind: 'success' | 'error'
  message: string
}

type Props = {
  previewStatus: StatusMessage | null
  executeStatus: StatusMessage | null
  shouldRefreshAssetsAfterConflict?: boolean
  onRefreshAssetsAfterConflict?: () => Promise<void>
  refreshAssetsLabel?: string
  retryStatus: string | null
}

export function BatchExecutionStatusAlerts({
  previewStatus,
  executeStatus,
  shouldRefreshAssetsAfterConflict = false,
  onRefreshAssetsAfterConflict,
  refreshAssetsLabel = 'Refresh asset list',
  retryStatus,
}: Props) {
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
        <div className="mt-2">
          <p
            data-testid="batch-execute-status"
            role="status"
            aria-live="polite"
            className={[
              'mb-0',
              executeStatus.kind === 'success' ? 'text-success' : 'text-danger',
            ].join(' ')}
          >
            {executeStatus.message}
          </p>
          {shouldRefreshAssetsAfterConflict && onRefreshAssetsAfterConflict ? (
            <button
              type="button"
              className="mt-2 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              data-testid="batch-refresh-assets-action"
              onClick={() => void onRefreshAssetsAfterConflict()}
            >
              {refreshAssetsLabel}
            </button>
          ) : null}
        </div>
      ) : null}
      {retryStatus ? (
        <p data-testid="api-retry-status" role="status" aria-live="polite" className="small mt-2 mb-0 text-warning">
          {retryStatus}
        </p>
      ) : null}
    </>
  )
}
