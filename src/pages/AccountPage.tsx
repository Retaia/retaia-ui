import { useTranslation } from 'react-i18next'
import { AuthAccountSection } from '../components/auth/AuthAccountSection'
import { AuthenticatedShell } from '../components/layout/AuthenticatedShell'
import { useAuthPageController } from '../hooks/useAuthPageController'

export function AccountPage() {
  const { t } = useTranslation()
  const controller = useAuthPageController()

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

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <AuthAccountSection t={t} controller={controller} />
        </section>
      </div>
    </AuthenticatedShell>
  )
}
