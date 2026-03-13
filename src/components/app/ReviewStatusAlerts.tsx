import { BsExclamationTriangle, BsInfoCircle } from 'react-icons/bs'
import type { TFunction } from 'i18next'

type ReviewStatusAlertsProps = {
  t: TFunction
  isApiAssetSource: boolean
  assetsLoadState: 'idle' | 'loading' | 'ready' | 'error'
  policyLoadState: 'idle' | 'loading' | 'ready' | 'error'
  bulkDecisionsEnabled: boolean
}

export function ReviewStatusAlerts({
  t,
  isApiAssetSource,
  assetsLoadState,
  policyLoadState,
  bulkDecisionsEnabled,
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
      {policyLoadState === 'loading' ? (
        <div className="mt-3 mb-0 rounded-lg border border-blue-light-300 bg-blue-light-50 p-2 text-sm text-blue-light-800" data-testid="policy-loading-status">
          <BsInfoCircle className="mr-2 inline-block" aria-hidden="true" />
          {t('app.policyLoading')}
        </div>
      ) : null}
      {policyLoadState === 'error' ? (
        <div className="mt-3 mb-0 rounded-lg border border-warning-300 bg-warning-50 p-2 text-sm text-warning-800" data-testid="policy-error-status">
          <BsExclamationTriangle className="mr-2 inline-block" aria-hidden="true" />
          {t('app.policyUnavailable')}
        </div>
      ) : null}
      {policyLoadState === 'ready' && !bulkDecisionsEnabled ? (
        <div className="mt-3 mb-0 rounded-lg border border-gray-300 bg-gray-100 p-2 text-sm text-gray-700" data-testid="policy-bulk-disabled-status">
          <BsInfoCircle className="mr-2 inline-block" aria-hidden="true" />
          {t('app.bulkDisabledByPolicy')}
        </div>
      ) : null}
    </>
  )
}
