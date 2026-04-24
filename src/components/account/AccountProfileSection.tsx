import type { TFunction } from 'i18next'
import { Link } from 'react-router-dom'
import type { useAuthPageController } from '../../hooks/useAuthPageController'

type AccountProfileSectionProps = {
  t: TFunction
  controller: ReturnType<typeof useAuthPageController>
}

export function AccountProfileSection({ t, controller }: AccountProfileSectionProps) {
  const {
    authUser,
    authLoading,
    handleLogout,
  } = controller

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              {t('account.identityEyebrow')}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-gray-950 dark:text-white">
              {t('account.identityTitle')}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
              {t('account.identityBody')}
            </p>
          </div>

          {authUser ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t('account.identityNameLabel')}
                </dt>
                <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {authUser.displayName ?? t('account.identityNameFallback')}
                </dd>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t('account.identityEmailLabel')}
                </dt>
                <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {authUser.email}
                </dd>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t('account.identityRoleLabel')}
                </dt>
                <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {authUser.isAdmin ? t('account.identityRoleAdmin') : t('account.identityRoleOperator')}
                </dd>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t('account.identityMfaLabel')}
                </dt>
                <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {authUser.mfaEnabled ? t('account.identityMfaOn') : t('account.identityMfaOff')}
                </dd>
              </div>
            </dl>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
              <p>{t('account.identitySignedOut')}</p>
              <Link
                to="/auth"
                className="mt-3 inline-flex items-center rounded-lg border border-brand-500 bg-white px-3 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:bg-transparent"
              >
                {t('account.identityOpenAuth')}
              </Link>
            </div>
          )}
        </div>

        {authUser ? (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800"
            data-testid="account-profile-logout"
            disabled={authLoading}
            onClick={() => void handleLogout()}
          >
            {t('app.authLogout')}
          </button>
        ) : null}
      </div>
    </section>
  )
}
