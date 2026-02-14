import { Button, Card, Container } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ApiConnectionSettingsSection } from '../components/auth/ApiConnectionSettingsSection'
import { AuthAccountSection } from '../components/auth/AuthAccountSection'
import { useAuthPageController } from '../hooks/useAuthPageController'

export function AuthPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const controller = useAuthPageController()

  return (
    <Container as="main" className="py-4">
      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h1 className="display-6 fw-bold mb-1">{t('app.authTitle')}</h1>
          <p className="text-secondary mb-0">{t('app.apiConnectionSubtitle')}</p>
        </div>
        <Button type="button" size="sm" variant="outline-secondary" onClick={() => navigate('/review')}>
          {t('app.backToReview')}
        </Button>
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
