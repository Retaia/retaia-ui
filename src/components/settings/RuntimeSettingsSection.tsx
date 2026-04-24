import type { TFunction } from 'i18next'
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
