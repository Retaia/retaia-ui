import { Button, Form } from 'react-bootstrap'
import type { TFunction } from 'i18next'

type AuthMfaSectionProps = {
  t: TFunction
  authUserMfaEnabled: boolean
  mfaFeatureAvailable: boolean
  mfaFeatureUserCanDisable: boolean
  mfaFeatureUserEnabled: boolean
  authMfaBusy: boolean
  authMfaSetup: { secret: string; otpauthUri: string } | null
  authMfaOtpAction: string
  setAuthMfaOtpAction: (value: string) => void
  authMfaStatus: { kind: 'success' | 'error'; message: string } | null
  onToggleUserFeature: () => Promise<void>
  onStartSetup: () => Promise<void>
  onEnableMfa: () => Promise<void>
  onDisableMfa: () => Promise<void>
}

export function AuthMfaSection({
  t,
  authUserMfaEnabled,
  mfaFeatureAvailable,
  mfaFeatureUserCanDisable,
  mfaFeatureUserEnabled,
  authMfaBusy,
  authMfaSetup,
  authMfaOtpAction,
  setAuthMfaOtpAction,
  authMfaStatus,
  onToggleUserFeature,
  onStartSetup,
  onEnableMfa,
  onDisableMfa,
}: AuthMfaSectionProps) {
  return (
    <section className="border border-2 border-secondary-subtle rounded p-3 mt-3" aria-label={t('app.authMfaTitle')}>
      <h4 className="h6 mb-2">{t('app.authMfaTitle')}</h4>
      {!mfaFeatureAvailable ? (
        <p className="small text-secondary mb-0" data-testid="auth-mfa-feature-disabled">
          {t('app.authMfaFeatureUnavailable')}
        </p>
      ) : (
        <>
          <p className="small text-secondary mb-2" data-testid="auth-mfa-state">
            {authUserMfaEnabled ? t('app.authMfaStateOn') : t('app.authMfaStateOff')}
          </p>
          {mfaFeatureUserCanDisable ? (
            <div className="d-flex flex-wrap gap-2 mb-2">
              <Button
                type="button"
                size="sm"
                variant={mfaFeatureUserEnabled ? 'outline-secondary' : 'outline-primary'}
                data-testid="auth-mfa-user-toggle"
                disabled={authMfaBusy}
                onClick={() => void onToggleUserFeature()}
              >
                {mfaFeatureUserEnabled ? t('app.authMfaFeatureOptOut') : t('app.authMfaFeatureOptIn')}
              </Button>
            </div>
          ) : null}
          {mfaFeatureUserEnabled ? (
            <>
              {!authUserMfaEnabled ? (
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline-primary"
                    data-testid="auth-mfa-setup"
                    disabled={authMfaBusy}
                    onClick={() => void onStartSetup()}
                  >
                    {t('app.authMfaSetup')}
                  </Button>
                </div>
              ) : null}
              {authMfaSetup ? (
                <div className="small text-secondary mb-2" data-testid="auth-mfa-setup-material">
                  <div>
                    {t('app.authMfaSecretLabel')}: {authMfaSetup.secret}
                  </div>
                  <div>
                    {t('app.authMfaUriLabel')}: {authMfaSetup.otpauthUri}
                  </div>
                </div>
              ) : null}
              <div className="d-flex flex-column gap-2">
                <div>
                  <Form.Label htmlFor="auth-mfa-otp-action-input" className="small mb-1">
                    {t('app.authOtpLabel')}
                  </Form.Label>
                  <Form.Control
                    id="auth-mfa-otp-action-input"
                    data-testid="auth-mfa-otp-action-input"
                    value={authMfaOtpAction}
                    type="text"
                    inputMode="numeric"
                    onChange={(event) => setAuthMfaOtpAction(event.target.value)}
                    disabled={authMfaBusy}
                  />
                </div>
                {!authUserMfaEnabled ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    data-testid="auth-mfa-enable"
                    disabled={authMfaBusy}
                    onClick={() => void onEnableMfa()}
                  >
                    {t('app.authMfaEnable')}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline-danger"
                    data-testid="auth-mfa-disable"
                    disabled={authMfaBusy}
                    onClick={() => void onDisableMfa()}
                  >
                    {t('app.authMfaDisable')}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <p className="small text-secondary mb-0" data-testid="auth-mfa-user-disabled">
              {t('app.authMfaFeatureUserDisabled')}
            </p>
          )}
        </>
      )}
      {authMfaStatus ? (
        <p
          className={`small mt-2 mb-0 ${authMfaStatus.kind === 'success' ? 'text-success' : 'text-danger'}`}
          data-testid="auth-mfa-status"
          role="status"
          aria-live="polite"
        >
          {authMfaStatus.message}
        </p>
      ) : null}
    </section>
  )
}
