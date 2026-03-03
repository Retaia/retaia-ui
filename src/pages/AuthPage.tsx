import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ApiConnectionSettingsSection } from '../components/auth/ApiConnectionSettingsSection'
import { AuthAccountSection } from '../components/auth/AuthAccountSection'
import { useAuthPageController } from '../hooks/useAuthPageController'

export function AuthPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const controller = useAuthPageController()
  const confirmLeaveIfDirty = () => {
    if (!controller.hasUnsavedAuthInputs) {
      return true
    }
    return window.confirm(t('app.authUnsavedChangesConfirm'))
  }

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!controller.hasUnsavedAuthInputs) {
        return
      }
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [controller.hasUnsavedAuthInputs])

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-4">
      <div className="flex justify-between items-start gap-2 mb-3">
        <div>
          <h1 className="text-4xl font-bold mb-1">{t('app.authTitle')}</h1>
          <p className="text-gray-500 mb-0">{t('app.apiConnectionSubtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            onClick={() => {
              if (confirmLeaveIfDirty()) {
                navigate('/settings')
              }
            }}
          >
            {t('settings.openSettings')}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            onClick={() => {
              if (confirmLeaveIfDirty()) {
                navigate('/review')
              }
            }}
          >
            {t('app.backToContext', { context: t('app.nav.review') })}
          </button>
        </div>
      </div>
      <section className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm" aria-label={t('app.apiConnectionTitle')}>
        <h2 className="mb-3 text-base font-semibold text-gray-900">{t('app.apiConnectionTitle')}</h2>
        <AuthAccountSection t={t} controller={controller} />
        <ApiConnectionSettingsSection t={t} controller={controller} />
      </section>
    </main>
  )
}
