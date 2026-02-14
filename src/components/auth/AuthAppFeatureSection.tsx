import { Button } from 'react-bootstrap'
import type { TFunction } from 'i18next'

type AuthAppFeatureSectionProps = {
  t: TFunction
  appMfaFeatureEnabled: boolean
  appFeatureBusy: boolean
  appFeatureStatus: { kind: 'success' | 'error'; message: string } | null
  onToggle: () => Promise<void>
}

export function AuthAppFeatureSection({
  t,
  appMfaFeatureEnabled,
  appFeatureBusy,
  appFeatureStatus,
  onToggle,
}: AuthAppFeatureSectionProps) {
  return (
    <section className="border border-2 border-secondary-subtle rounded p-3 mt-3" aria-label={t('app.authAppFeatureTitle')}>
      <h4 className="h6 mb-2">{t('app.authAppFeatureTitle')}</h4>
      <p className="small text-secondary mb-2" data-testid="auth-app-feature-state">
        {appMfaFeatureEnabled ? t('app.authAppFeatureStateOn') : t('app.authAppFeatureStateOff')}
      </p>
      <Button
        type="button"
        size="sm"
        variant={appMfaFeatureEnabled ? 'outline-danger' : 'outline-primary'}
        data-testid="auth-app-feature-toggle"
        disabled={appFeatureBusy}
        onClick={() => void onToggle()}
      >
        {appMfaFeatureEnabled ? t('app.authAppFeatureDisable') : t('app.authAppFeatureEnable')}
      </Button>
      {appFeatureStatus ? (
        <p
          className={`small mt-2 mb-0 ${appFeatureStatus.kind === 'success' ? 'text-success' : 'text-danger'}`}
          data-testid="auth-app-feature-status"
          role="status"
          aria-live="polite"
        >
          {appFeatureStatus.message}
        </p>
      ) : null}
    </section>
  )
}
