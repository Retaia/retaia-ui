import { Button, Container } from '@ui-kit'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <Container as="main" className="py-4">
      <h1 className="display-6 fw-bold mb-2">{t('errors.notFoundTitle')}</h1>
      <p className="text-secondary mb-3">{t('errors.notFoundBody')}</p>
      <div className="d-flex gap-2">
        <Button type="button" variant="primary" onClick={() => navigate('/review')}>
          {t('app.nav.review')}
        </Button>
        <Button type="button" variant="outline-secondary" onClick={() => navigate('/auth')}>
          {t('settings.openAuth')}
        </Button>
      </div>
    </Container>
  )
}

