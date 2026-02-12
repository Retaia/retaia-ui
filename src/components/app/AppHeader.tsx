import { Button, Stack } from 'react-bootstrap'
import type { Locale } from '../../i18n/resources'

type Props = {
  locale: Locale
  t: (key: string) => string
  onChangeLanguage: (locale: Locale) => void
}

export function AppHeader({ locale, t, onChangeLanguage }: Props) {
  return (
    <header className="mb-3">
      <Stack direction="horizontal" className="justify-content-between align-items-start gap-2">
        <div>
          <h1 className="display-6 fw-bold mb-1">{t('app.title')}</h1>
          <p className="text-secondary mb-0">{t('app.subtitle')}</p>
        </div>
        <Stack direction="horizontal" gap={2} aria-label={t('app.language')}>
          <Button
            type="button"
            size="sm"
            variant={locale === 'fr' ? 'primary' : 'outline-primary'}
            onClick={() => onChangeLanguage('fr')}
            aria-label={t('app.language.fr')}
          >
            FR
          </Button>
          <Button
            type="button"
            size="sm"
            variant={locale === 'en' ? 'primary' : 'outline-primary'}
            onClick={() => onChangeLanguage('en')}
            aria-label={t('app.language.en')}
          >
            EN
          </Button>
        </Stack>
      </Stack>
    </header>
  )
}
