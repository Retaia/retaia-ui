import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { ApiConnectionSettingsSection } from '../components/auth/ApiConnectionSettingsSection'
import { AuthAccountSection } from '../components/auth/AuthAccountSection'
import { PublicAuthLayout } from '../components/layout/PublicAuthLayout'
import { useAuthPageController } from '../hooks/useAuthPageController'

export function AuthPage() {
  const controller = useAuthPageController()
  const { t } = useTranslation()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/auth/reset-password') {
      controller.setLostPasswordMode('reset')
    }
    if (location.pathname === '/auth/verify-email') {
      controller.setVerifyEmailMode('confirm')
    }
  }, [controller, location.pathname])

  const body =
    location.pathname === '/auth/reset-password'
      ? t('page.auth.resetBody')
      : location.pathname === '/auth/verify-email'
        ? t('page.auth.verifyBody')
        : t('page.auth.body')

  return (
    <PublicAuthLayout title={t('page.auth.title')} body={body}>
      <div className="space-y-6">
        <AuthAccountSection t={t} controller={controller} />
        <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('app.apiConnectionTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {t('app.apiConnectionSubtitle')}
          </p>
          <div className="mt-4">
            <ApiConnectionSettingsSection t={t} controller={controller} />
          </div>
        </section>
      </div>
    </PublicAuthLayout>
  )
}
