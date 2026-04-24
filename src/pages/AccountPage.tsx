import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AccountProfileSection } from '../components/account/AccountProfileSection'
import { AccountSessionsSection } from '../components/auth/AccountSessionsSection'
import { AuthMfaSection } from '../components/auth/AuthMfaSection'
import { AuthenticatedShell } from '../components/layout/AuthenticatedShell'
import { useAuthSessionsController } from '../hooks/auth/useAuthSessionsController'
import { useAuthPageController } from '../hooks/useAuthPageController'

export function AccountPage() {
  const { t } = useTranslation()
  const controller = useAuthPageController()
  const sessionsController = useAuthSessionsController({
    apiClient: controller.apiClient,
    t,
    enabled: Boolean(controller.authUser && controller.effectiveApiToken),
  })

  return (
    <AuthenticatedShell currentView="account">
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
            {t('page.account.eyebrow')}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 dark:text-white">
            {t('page.account.title')}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-300">
            {t('page.account.body')}
          </p>
        </section>

        <AccountProfileSection t={t} controller={controller} />

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            {t('account.securityEyebrow')}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-gray-950 dark:text-white">
            {t('account.securityTitle')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-300">
            {t('account.securityBody')}
          </p>

          {controller.authUser && controller.mfaFeatureKey ? (
            <AuthMfaSection
              t={t}
              authUserMfaEnabled={controller.authUser.mfaEnabled}
              mfaFeatureAvailable={controller.mfaFeatureAvailable}
              mfaFeatureUserCanDisable={controller.mfaFeatureUserCanDisable}
              mfaFeatureUserEnabled={controller.mfaFeatureUserEnabled}
              authMfaBusy={controller.authMfaBusy}
              authMfaSetup={controller.authMfaSetup}
              authMfaOtpAction={controller.authMfaOtpAction}
              setAuthMfaOtpAction={controller.setAuthMfaOtpAction}
              authMfaStatus={controller.authMfaStatus}
              onToggleUserFeature={() => controller.setUserFeature(!controller.mfaFeatureUserEnabled)}
              onStartSetup={controller.startMfaSetup}
              onEnableMfa={controller.enableMfa}
              onDisableMfa={controller.disableMfa}
            />
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
              <p>{t(controller.authUser ? 'account.securityUnavailable' : 'account.identitySignedOut')}</p>
              {!controller.authUser ? (
                <Link
                  to="/auth"
                  className="mt-3 inline-flex items-center rounded-lg border border-brand-500 bg-white px-3 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:bg-transparent"
                >
                  {t('account.identityOpenAuth')}
                </Link>
              ) : null}
            </div>
          )}
        </section>

        <AccountSessionsSection
          t={t}
          sessions={sessionsController.sessions}
          loading={sessionsController.loading}
          busySessionId={sessionsController.busySessionId}
          revokingOthers={sessionsController.revokingOthers}
          status={sessionsController.status}
          onRefresh={sessionsController.loadSessions}
          onRevokeSession={sessionsController.revokeSession}
          onRevokeOthers={sessionsController.revokeOthers}
        />
      </div>
    </AuthenticatedShell>
  )
}
