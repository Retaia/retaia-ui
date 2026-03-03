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
    <section className="border border-2 border-gray-200 rounded p-3 mt-3" aria-label={t('app.authAppFeatureTitle')}>
      <h4 className="mb-2 text-sm font-semibold text-gray-900">{t('app.authAppFeatureTitle')}</h4>
      <p className="text-xs text-gray-500 mb-2" data-testid="auth-app-feature-state">
        {appMfaFeatureEnabled ? t('app.authAppFeatureStateOn') : t('app.authAppFeatureStateOff')}
      </p>
      <button
        type="button"
        className={[
          'inline-flex items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          appMfaFeatureEnabled
            ? 'border-error-300 bg-white text-error-700 hover:bg-error-50'
            : 'border-brand-500 bg-white text-brand-600 hover:bg-brand-50',
        ].join(' ')}
        data-testid="auth-app-feature-toggle"
        disabled={appFeatureBusy}
        onClick={() => void onToggle()}
      >
        {appMfaFeatureEnabled ? t('app.authAppFeatureDisable') : t('app.authAppFeatureEnable')}
      </button>
      {appFeatureStatus ? (
        <p
          className={`text-xs mt-2 mb-0 ${appFeatureStatus.kind === 'success' ? 'text-success-700' : 'text-error-700'}`}
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
