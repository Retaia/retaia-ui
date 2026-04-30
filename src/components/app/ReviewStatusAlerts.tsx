import { BsExclamationTriangle, BsInfoCircle } from 'react-icons/bs'
import type { TFunction } from 'i18next'

type ReviewStatusAlertsProps = {
  t: TFunction
  isApiAssetSource: boolean
  assetsLoadState: 'idle' | 'loading' | 'ready' | 'error'
  policyLoadState: 'idle' | 'loading' | 'ready' | 'error'
  bulkAvailabilityLoadState: 'idle' | 'loading' | 'ready' | 'error'
  bulkDecisionsEnabled: boolean
  policySummary: {
    featureFlagsCount: number
    contractVersion: string | null
    pollIntervalSeconds: number
  } | null
  refreshingPolicy: boolean
  onRefreshPolicy: () => Promise<void> | void
}

export function ReviewStatusAlerts({
  t,
  isApiAssetSource,
  assetsLoadState,
  policyLoadState,
  bulkAvailabilityLoadState,
  bulkDecisionsEnabled,
  policySummary,
  refreshingPolicy,
  onRefreshPolicy,
}: ReviewStatusAlertsProps) {
  if (!isApiAssetSource) {
    return null
  }

  return (
    <>
      {assetsLoadState === 'loading' ? (
        <div className="mt-3 mb-0 rounded-lg border border-blue-light-300 bg-blue-light-50 p-2 text-sm text-blue-light-800" data-testid="assets-loading-status">
          <BsInfoCircle className="mr-2 inline-block" aria-hidden="true" />
          {t('assets.loading')}
        </div>
      ) : null}
      {assetsLoadState === 'error' ? (
        <div className="mt-3 mb-0 rounded-lg border border-warning-300 bg-warning-50 p-2 text-sm text-warning-800" data-testid="assets-error-status">
          <BsExclamationTriangle className="mr-2 inline-block" aria-hidden="true" />
          {t('assets.loadError')}
        </div>
      ) : null}
      {bulkAvailabilityLoadState === 'loading' ? (
        <div className="mt-3 mb-0 rounded-lg border border-blue-light-300 bg-blue-light-50 p-2 text-sm text-blue-light-800" data-testid="policy-loading-status">
          <BsInfoCircle className="mr-2 inline-block" aria-hidden="true" />
          {t('app.policyLoading')}
        </div>
      ) : null}
      {bulkAvailabilityLoadState === 'error' ? (
        <div className="mt-3 mb-0 rounded-lg border border-warning-300 bg-warning-50 p-2 text-sm text-warning-800" data-testid="policy-error-status">
          <BsExclamationTriangle className="mr-2 inline-block" aria-hidden="true" />
          {t('app.policyUnavailable')}
        </div>
      ) : null}
      {bulkAvailabilityLoadState === 'ready' && !bulkDecisionsEnabled ? (
        <div className="mt-3 mb-0 rounded-lg border border-gray-300 bg-gray-100 p-2 text-sm text-gray-700" data-testid="policy-bulk-disabled-status">
          <BsInfoCircle className="mr-2 inline-block" aria-hidden="true" />
          {t('app.bulkDisabledByPolicy')}
        </div>
      ) : null}
      {policyLoadState === 'ready' && policySummary ? (
        <section
          className="mt-3 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          data-testid="policy-runtime-summary"
          aria-label={t('app.policySummaryTitle')}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                {t('app.policySummaryTitle')}
              </div>
              <p className="mt-1 mb-0 text-xs text-gray-500 dark:text-gray-400">
                {t('app.policySummaryBody')}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"
              data-testid="policy-refresh-action"
              onClick={() => void onRefreshPolicy()}
              disabled={refreshingPolicy}
            >
              {refreshingPolicy ? t('app.policyRefreshing') : t('app.policyRefresh')}
            </button>
          </div>
          <dl className="mt-3 grid gap-3 md:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t('app.policyContractVersion')}
              </dt>
              <dd className="mt-1 mb-0" data-testid="policy-contract-version">
                {policySummary.contractVersion ?? t('app.policyUnknown')}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t('app.policyFlagCount')}
              </dt>
              <dd className="mt-1 mb-0" data-testid="policy-flag-count">
                {t('app.policyFlagCountValue', { count: policySummary.featureFlagsCount })}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t('app.policyPollInterval')}
              </dt>
              <dd className="mt-1 mb-0" data-testid="policy-poll-interval">
                {t('app.policyPollIntervalValue', { seconds: policySummary.pollIntervalSeconds })}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}
    </>
  )
}
