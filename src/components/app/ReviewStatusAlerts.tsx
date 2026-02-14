import { Alert } from 'react-bootstrap'
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
        <Alert variant="info" className="py-2 mt-3 mb-0" data-testid="assets-loading-status">
          <BsInfoCircle className="me-2" aria-hidden="true" />
          {t('assets.loading')}
        </Alert>
      ) : null}
      {assetsLoadState === 'error' ? (
        <Alert variant="warning" className="py-2 mt-3 mb-0" data-testid="assets-error-status">
          <BsExclamationTriangle className="me-2" aria-hidden="true" />
          {t('assets.loadError')}
        </Alert>
      ) : null}
      {policyLoadState === 'loading' ? (
        <Alert variant="info" className="py-2 mt-3 mb-0" data-testid="policy-loading-status">
          <BsInfoCircle className="me-2" aria-hidden="true" />
          {t('app.policyLoading')}
        </Alert>
      ) : null}
      {policyLoadState === 'error' ? (
        <Alert variant="warning" className="py-2 mt-3 mb-0" data-testid="policy-error-status">
          <BsExclamationTriangle className="me-2" aria-hidden="true" />
          {t('app.policyUnavailable')}
        </Alert>
      ) : null}
      {policyLoadState === 'ready' && !bulkDecisionsEnabled ? (
        <Alert variant="secondary" className="py-2 mt-3 mb-0" data-testid="policy-bulk-disabled-status">
          <BsInfoCircle className="me-2" aria-hidden="true" />
          {t('app.bulkDisabledByPolicy')}
        </Alert>
      ) : null}
    </>
  )
}
