import type { ReviewRefreshReason } from '../../infrastructure/review/apiReviewErrorAdapter'
import { ReviewRefreshResolutionAlert } from './ReviewRefreshResolutionAlert'

type StatusMessage = {
  kind: 'success' | 'error'
  message: string
}

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
  previewStatus: StatusMessage | null
  executeStatus: StatusMessage | null
  shouldRefreshAssetsAfterConflict?: boolean
  refreshRecommendationReason?: ReviewRefreshReason | null
  onRefreshAssetsAfterConflict?: () => Promise<void>
  retryStatus: string | null
}

export function BatchExecutionStatusAlerts({
  t,
  previewStatus,
  executeStatus,
  shouldRefreshAssetsAfterConflict = false,
  refreshRecommendationReason = null,
  onRefreshAssetsAfterConflict,
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
          {shouldRefreshAssetsAfterConflict && onRefreshAssetsAfterConflict && refreshRecommendationReason ? (
            <ReviewRefreshResolutionAlert
              t={t}
              scope="asset_list"
              reason={refreshRecommendationReason}
              onRefresh={() => {
                void onRefreshAssetsAfterConflict()
              }}
              testIdPrefix="batch-refresh-resolution"
              className="mt-2"
            />
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
