import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation } from 'react-router-dom'
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

  if (controller.authSessionLoadState === 'loading' && controller.effectiveApiToken) {
    return (
      <PublicAuthLayout title={t('page.auth.title')} body={body}>
        <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t('page.auth.redirectLoading')}
          </p>
        </section>
      </PublicAuthLayout>
    )
  }

  if (controller.authUser) {
    return <Navigate to="/account" replace />
  }

  return (
    <PublicAuthLayout title={t('page.auth.title')} body={body}>
      <AuthAccountSection t={t} controller={controller} />
    </PublicAuthLayout>
  )
}
