import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AppButton } from '../components/ui/AppButton'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-4">
      <h1 className="text-4xl font-bold mb-2">{t('errors.forbiddenTitle')}</h1>
      <p className="text-gray-500 mb-3">{t('errors.forbiddenBody')}</p>
      <div className="flex gap-2">
        <AppButton variant="primary" onClick={() => navigate('/review')} className="px-3 py-2">
          {t('app.nav.review')}
        </AppButton>
        <AppButton
          variant="secondary"
          onClick={() => navigate('/auth')}
          className="px-3 py-2"
        >
          {t('settings.openAuth')}
        </AppButton>
      </div>
    </main>
  )
}
