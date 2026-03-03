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
    <section className="border border-2 border-gray-200 rounded p-3 mt-3" aria-label={t('app.authMfaTitle')}>
      <h4 className="mb-2 text-sm font-semibold text-gray-900">{t('app.authMfaTitle')}</h4>
      {!mfaFeatureAvailable ? (
        <p className="text-xs text-gray-500 mb-0" data-testid="auth-mfa-feature-disabled">
          {t('app.authMfaFeatureUnavailable')}
        </p>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-2" data-testid="auth-mfa-state">
            {authUserMfaEnabled ? t('app.authMfaStateOn') : t('app.authMfaStateOff')}
          </p>
          {mfaFeatureUserCanDisable ? (
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                className={[
                  'inline-flex items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                  mfaFeatureUserEnabled
                    ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                    : 'border-brand-500 bg-white text-brand-600 hover:bg-brand-50',
                ].join(' ')}
                data-testid="auth-mfa-user-toggle"
                disabled={authMfaBusy}
                onClick={() => void onToggleUserFeature()}
              >
                {mfaFeatureUserEnabled ? t('app.authMfaFeatureOptOut') : t('app.authMfaFeatureOptIn')}
              </button>
            </div>
          ) : null}
          {mfaFeatureUserEnabled ? (
            <>
              {!authUserMfaEnabled ? (
                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid="auth-mfa-setup"
                    disabled={authMfaBusy}
                    onClick={() => void onStartSetup()}
                  >
                    {t('app.authMfaSetup')}
                  </button>
                </div>
              ) : null}
              {authMfaSetup ? (
                <div className="text-xs text-gray-500 mb-2" data-testid="auth-mfa-setup-material">
                  <div>
                    {t('app.authMfaSecretLabel')}: {authMfaSetup.secret}
                  </div>
                  <div>
                    {t('app.authMfaUriLabel')}: {authMfaSetup.otpauthUri}
                  </div>
                </div>
              ) : null}
              <div className="flex flex-col gap-2">
                <div>
                  <label htmlFor="auth-mfa-otp-action-input" className="mb-1 inline-block text-xs font-medium text-gray-700">
                    {t('app.authOtpLabel')}
                  </label>
                  <input
                    id="auth-mfa-otp-action-input"
                    data-testid="auth-mfa-otp-action-input"
                    value={authMfaOtpAction}
                    type="text"
                    inputMode="numeric"
                    onChange={(event) => setAuthMfaOtpAction(event.target.value)}
                    disabled={authMfaBusy}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                {!authUserMfaEnabled ? (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-brand-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:border-brand-600 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid="auth-mfa-enable"
                    disabled={authMfaBusy}
                    onClick={() => void onEnableMfa()}
                  >
                    {t('app.authMfaEnable')}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border border-error-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-error-700 transition-colors hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid="auth-mfa-disable"
                    disabled={authMfaBusy}
                    onClick={() => void onDisableMfa()}
                  >
                    {t('app.authMfaDisable')}
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-500 mb-0" data-testid="auth-mfa-user-disabled">
              {t('app.authMfaFeatureUserDisabled')}
            </p>
          )}
        </>
      )}
      {authMfaStatus ? (
        <p
          className={`text-xs mt-2 mb-0 ${authMfaStatus.kind === 'success' ? 'text-success-700' : 'text-error-700'}`}
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
