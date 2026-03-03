import { Button, Card, Container } from '@tailadmin'
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
    <Container as="main" className="py-4">
      <div className="flex justify-between items-start gap-2 mb-3">
        <div>
          <h1 className="text-4xl font-bold mb-1">{t('app.authTitle')}</h1>
          <p className="text-gray-500 mb-0">{t('app.apiConnectionSubtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline-secondary"
            onClick={() => {
              if (confirmLeaveIfDirty()) {
                navigate('/settings')
              }
            }}
          >
            {t('settings.openSettings')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline-secondary"
            onClick={() => {
              if (confirmLeaveIfDirty()) {
                navigate('/review')
              }
            }}
          >
            {t('app.backToContext', { context: t('app.nav.review') })}
          </Button>
        </div>
      </div>
      <Card as="section" className="shadow-sm border-0 mt-3" aria-label={t('app.apiConnectionTitle')}>
        <Card.Body>
          <h2 className="h6 mb-3">{t('app.apiConnectionTitle')}</h2>
          <AuthAccountSection t={t} controller={controller} />
          <ApiConnectionSettingsSection t={t} controller={controller} />
        </Card.Body>
      </Card>
    </Container>
  )
}
