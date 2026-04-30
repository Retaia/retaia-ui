import type { ReviewRefreshReason } from '../../infrastructure/review/apiReviewErrorAdapter'

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
  scope: 'selected_asset' | 'asset_list'
  reason: ReviewRefreshReason
  onRefresh: () => void
  refreshing?: boolean
  className?: string
  testIdPrefix?: string
}

function resolveReasonLabelKey(reason: ReviewRefreshReason) {
  if (reason === 'state_conflict') {
    return 'reviewResolution.reasonStateConflict'
  }
  if (reason === 'precondition_required') {
    return 'reviewResolution.reasonPreconditionRequired'
  }
  if (reason === 'precondition_failed') {
    return 'reviewResolution.reasonPreconditionFailed'
  }
  return 'reviewResolution.reasonLock'
}

export function ReviewRefreshResolutionAlert({
  t,
  scope,
  reason,
  onRefresh,
  refreshing = false,
  className,
  testIdPrefix = 'review-refresh-resolution',
}: Props) {
  const actionLabel = scope === 'selected_asset'
    ? t('reviewResolution.actionRefreshSelectedAsset')
    : t('reviewResolution.actionRefreshAssetList')

  return (
    <section
      className={[
        'mt-3 rounded-lg border border-warning-300 bg-warning-50 p-3',
        className ?? '',
      ].join(' ').trim()}
      aria-label={t('reviewResolution.title')}
      data-testid={`${testIdPrefix}-panel`}
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-warning-800">
        {t('reviewResolution.title')}
      </p>
      <p
        className="mb-2 text-sm text-warning-900"
        data-testid={`${testIdPrefix}-message`}
      >
        {t('reviewResolution.body', {
          reason: t(resolveReasonLabelKey(reason)),
        })}
      </p>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-lg border border-warning-400 bg-white px-2.5 py-1.5 text-xs font-semibold text-warning-900 transition-colors hover:bg-warning-100 disabled:cursor-not-allowed disabled:opacity-50"
        data-testid={`${testIdPrefix}-action`}
        onClick={onRefresh}
        disabled={refreshing}
      >
        {refreshing ? t('reviewResolution.refreshing') : actionLabel}
      </button>
    </section>
  )
}
