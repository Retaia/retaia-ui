import type { TFunction } from 'i18next'
import { BsArrowClockwise } from 'react-icons/bs'
import { ApiConnectionSettingsSection } from '../auth/ApiConnectionSettingsSection'
import { AuthAppFeatureSection } from '../auth/AuthAppFeatureSection'
import type { useAuthPageController } from '../../hooks/useAuthPageController'

type RuntimeSettingsSectionProps = {
  t: TFunction
  controller: ReturnType<typeof useAuthPageController>
}

export function RuntimeSettingsSection({ t, controller }: RuntimeSettingsSectionProps) {
  const {
    authUser,
    appMfaFeatureKey,
    appMfaFeatureEnabled,
    appFeatureBusy,
    appFeatureStatus,
    setAppFeature,
    isApiAuthLockedByEnv,
    runtimeDiagnostics,
  } = controller

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {t('settings.runtimeTitle')}
      </h2>
      <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
        {t('settings.runtimeBody')}
      </p>

      <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t('app.apiConnectionTitle')}
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {t('settings.runtimeConnectionBody')}
        </p>
        {isApiAuthLockedByEnv ? (
          <p className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-400">
            {t('app.authEnvLocked')}
          </p>
        ) : null}
        <div className="mt-4">
          <ApiConnectionSettingsSection t={t} controller={controller} />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('settings.runtimeDiagnosticsTitle')}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {t('settings.runtimeDiagnosticsBody')}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={() => runtimeDiagnostics.refresh()}
            disabled={runtimeDiagnostics.loading || !authUser}
            data-testid="runtime-diagnostics-refresh"
          >
            <BsArrowClockwise aria-hidden="true" />
            {t('settings.runtimeDiagnosticsRefresh')}
          </button>
        </div>

        {!authUser ? (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            {t('settings.runtimeDiagnosticsSignedOut')}
          </p>
        ) : (
          <>
            <dl className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t('settings.runtimeReadinessLabel')}
                </dt>
                <dd className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100" data-testid="runtime-readiness-status">
                  {runtimeDiagnostics.health
                    ? t(`settings.runtimeReadinessStatus.${runtimeDiagnostics.health.status}`)
                    : t('settings.runtimeDiagnosticsUnknown')}
                </dd>
                {runtimeDiagnostics.healthError ? (
                  <p className="mt-1 text-xs text-error-700 dark:text-error-400" data-testid="runtime-readiness-error">
                    {t('settings.runtimeReadinessUnavailable', {
                      message: runtimeDiagnostics.healthError,
                    })}
                  </p>
                ) : null}
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t('settings.runtimeSelfHealingLabel')}
                </dt>
                <dd className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100" data-testid="runtime-self-healing-status">
                  {runtimeDiagnostics.health
                    ? (
                        runtimeDiagnostics.health.self_healing.active
                          ? t('settings.runtimeSelfHealingActive')
                          : t('settings.runtimeSelfHealingInactive')
                      )
                    : t('settings.runtimeDiagnosticsUnknown')}
                </dd>
                {runtimeDiagnostics.health?.self_healing.max_self_healing_seconds ? (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('settings.runtimeSelfHealingWindow', {
                      seconds: runtimeDiagnostics.health.self_healing.max_self_healing_seconds,
                    })}
                  </p>
                ) : null}
              </div>
            </dl>

            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="mb-0 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t('settings.runtimeFeatureFlagsLabel')}
                </p>
                <p className="mb-0 text-xs text-gray-500 dark:text-gray-400" data-testid="runtime-feature-flags-count">
                  {runtimeDiagnostics.policy
                    ? t('settings.runtimeFeatureFlagsCount', {
                        count: runtimeDiagnostics.featureFlags.length,
                      })
                    : t('settings.runtimeDiagnosticsUnknown')}
                </p>
              </div>
              {runtimeDiagnostics.featureFlags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2" data-testid="runtime-feature-flags-list">
                  {runtimeDiagnostics.featureFlags.map(([key, value]) => (
                    <span
                      key={key}
                      className={[
                        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                        value
                          ? 'bg-success-100 text-success-800'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                      ].join(' ')}
                    >
                      {key}: {value ? t('settings.runtimeFlagEnabled') : t('settings.runtimeFlagDisabled')}
                    </span>
                  ))}
                </div>
              ) : runtimeDiagnostics.policyError ? (
                <p className="mt-3 text-sm text-error-700 dark:text-error-400" data-testid="runtime-feature-flags-error">
                  {t('settings.runtimePolicyUnavailable', {
                    message: runtimeDiagnostics.policyError,
                  })}
                </p>
              ) : runtimeDiagnostics.policy ? (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  {t('settings.runtimeFeatureFlagsEmpty')}
                </p>
              ) : (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  {t('settings.runtimeDiagnosticsUnknown')}
                </p>
              )}
            </div>

            {runtimeDiagnostics.status ? (
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400" data-testid="runtime-diagnostics-status">
                {runtimeDiagnostics.status}
              </p>
            ) : null}
          </>
        )}
      </div>

      {authUser?.isAdmin && appMfaFeatureKey ? (
        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.runtimeAdminTitle')}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {t('settings.runtimeAdminBody')}
          </p>
          <AuthAppFeatureSection
            t={t}
            appMfaFeatureEnabled={appMfaFeatureEnabled}
            appFeatureBusy={appFeatureBusy}
            appFeatureStatus={appFeatureStatus}
            onToggle={() => setAppFeature(!appMfaFeatureEnabled)}
          />
        </div>
      ) : null}
    </section>
  )
}
