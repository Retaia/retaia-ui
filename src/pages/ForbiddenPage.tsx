import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-4">
      <h1 className="text-4xl font-bold mb-2">{t('errors.forbiddenTitle')}</h1>
      <p className="text-gray-500 mb-3">{t('errors.forbiddenBody')}</p>
      <div className="flex gap-2">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-brand-600 hover:bg-brand-600"
          onClick={() => navigate('/review')}
        >
          {t('app.nav.review')}
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
          onClick={() => navigate('/auth')}
        >
          {t('settings.openAuth')}
        </button>
      </div>
    </main>
  )
}
