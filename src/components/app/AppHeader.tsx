import { Button, Stack } from 'react-bootstrap'
import { BsFlagFill, BsGlobe2 } from 'react-icons/bs'
import type { Locale } from '../../i18n/resources'

type Props = {
  locale: Locale
  t: (key: string, values?: Record<string, string | number>) => string
  onChangeLanguage: (locale: Locale) => void
  onOpenSettings: () => void
  onOpenAuth: () => void
  onOpenReview: () => void
  onOpenBatch: () => void
  onOpenBatchReports: () => void
  onOpenActivity: () => void
  onOpenLibrary: () => void
  currentView?: 'workspace' | 'batch' | 'reports' | 'activity' | 'library'
}

export function AppHeader({
  locale,
  t,
  onChangeLanguage,
  onOpenSettings,
  onOpenAuth,
  onOpenReview,
  onOpenBatch,
  onOpenBatchReports,
  onOpenActivity,
  onOpenLibrary,
  currentView = 'workspace',
}: Props) {
  return (
    <header className="mb-3">
      <Stack direction="horizontal" className="justify-content-between align-items-start gap-2 flex-wrap">
        <div>
          <h1 className="display-6 fw-bold mb-1">
            <img
              src="/retaia-logo-512.png"
              width={28}
              height={28}
              className="me-2 rounded-2 align-text-top"
              alt=""
              aria-hidden="true"
            />
            {t('app.title')}
          </h1>
          <p className="text-secondary mb-0">{t('app.subtitle')}</p>
          <Stack direction="horizontal" className="flex-wrap gap-2 mt-2" aria-label={t('app.navigation')}>
            <Button
              type="button"
              size="sm"
              variant={currentView === 'workspace' ? 'primary' : 'outline-primary'}
              onClick={onOpenReview}
            >
              {t('app.nav.review')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={currentView === 'batch' ? 'primary' : 'outline-primary'}
              onClick={onOpenBatch}
            >
              {t('app.nav.batch')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={currentView === 'reports' ? 'primary' : 'outline-primary'}
              onClick={onOpenBatchReports}
            >
              {t('app.nav.reports')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={currentView === 'activity' ? 'primary' : 'outline-primary'}
              onClick={onOpenActivity}
            >
              {t('app.nav.activity')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={currentView === 'library' ? 'primary' : 'outline-primary'}
              onClick={onOpenLibrary}
            >
              {t('app.nav.library')}
            </Button>
          </Stack>
        </div>
        <Stack direction="horizontal" gap={2} aria-label={t('app.language')}>
          <Button type="button" size="sm" variant="outline-secondary" onClick={onOpenSettings}>
            {t('settings.openSettings')}
          </Button>
          <Button type="button" size="sm" variant="outline-secondary" onClick={onOpenAuth}>
            {t('settings.openAuth')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={locale === 'fr' ? 'primary' : 'outline-primary'}
            onClick={() => onChangeLanguage('fr')}
            aria-label={t('app.language.fr')}
          >
            <BsFlagFill className="me-1" aria-hidden="true" />
            FR
          </Button>
          <Button
            type="button"
            size="sm"
            variant={locale === 'en' ? 'primary' : 'outline-primary'}
            onClick={() => onChangeLanguage('en')}
            aria-label={t('app.language.en')}
          >
            <BsGlobe2 className="me-1" aria-hidden="true" />
            EN
          </Button>
        </Stack>
      </Stack>
    </header>
  )
}
