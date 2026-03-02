import type { ReactNode } from 'react'
import {
  BsArchiveFill,
  BsFlagFill,
  BsGearFill,
  BsGlobe2,
  BsShieldLockFill,
  BsXOctagonFill,
} from 'react-icons/bs'
import type { Locale } from '../../i18n/resources'
import { reportUiNavigationAction } from '../../ui/telemetry'

type Props = {
  locale: Locale
  t: (key: string, values?: Record<string, string | number>) => string
  onChangeLanguage: (locale: Locale) => void
  onOpenSettings: () => void
  onOpenAuth: () => void
  onOpenReview: () => void
  onOpenActivity: () => void
  onOpenLibrary: () => void
  currentView?: 'workspace' | 'activity' | 'library'
  children?: ReactNode
}

export function AppHeader({
  locale,
  t,
  onChangeLanguage,
  onOpenSettings,
  onOpenAuth,
  onOpenReview,
  onOpenActivity,
  onOpenLibrary,
  currentView = 'workspace',
  children,
}: Props) {
  const trackNavigationAction = (origin: string, pathname: string, run: () => void) => {
    reportUiNavigationAction({ origin, pathname })
    run()
  }

  const navItems = [
    {
      id: 'workspace',
      icon: BsShieldLockFill,
      label: t('app.nav.review'),
      onClick: () => trackNavigationAction('sidebar:review', '/review', onOpenReview),
    },
    {
      id: 'library',
      icon: BsArchiveFill,
      label: t('app.nav.library'),
      onClick: () => trackNavigationAction('sidebar:library', '/library', onOpenLibrary),
    },
    {
      id: 'activity',
      icon: BsXOctagonFill,
      label: t('app.nav.rejects'),
      onClick: () => trackNavigationAction('sidebar:activity', '/activity', onOpenActivity),
    },
  ] as const

  return (
    <div className="retaia-shell">
      <aside className="retaia-shell__sidebar" aria-label={t('app.navigation')}>
        <div className="retaia-shell__brand">
          <img
            src="/retaia-logo-512.png"
            width={28}
            height={28}
            className="rounded-2 align-text-top"
            alt=""
            aria-hidden="true"
          />
          <div>
            <h1 className="retaia-shell__title">{t('app.title')}</h1>
            <p className="retaia-shell__subtitle">{t('app.subtitle')}</p>
          </div>
        </div>

        <nav className="retaia-shell__nav" aria-label={t('app.navigation')}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={currentView === item.id ? 'retaia-nav-button is-active' : 'retaia-nav-button'}
              onClick={item.onClick}
            >
              <item.icon className="retaia-nav-button__icon" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="retaia-shell__sidebar-footer">
          <div className="retaia-shell__admin-label">{t('app.adminMenu')}</div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm retaia-admin-button"
            onClick={() => trackNavigationAction('sidebar:settings', '/settings', onOpenSettings)}
          >
            <BsGearFill className="retaia-nav-button__icon" aria-hidden="true" />
            {t('settings.openSettings')}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm retaia-admin-button"
            onClick={() => trackNavigationAction('sidebar:auth', '/auth', onOpenAuth)}
          >
            <BsShieldLockFill className="retaia-nav-button__icon" aria-hidden="true" />
            {t('settings.openAuth')}
          </button>
          <div className="retaia-shell__lang" aria-label={t('app.language')}>
            <button
              type="button"
              className={locale === 'fr' ? 'btn btn-primary btn-sm' : 'btn btn-outline-primary btn-sm'}
              onClick={() => onChangeLanguage('fr')}
              aria-label={t('app.language.fr')}
            >
              <BsFlagFill className="me-1" aria-hidden="true" />
              FR
            </button>
            <button
              type="button"
              className={locale === 'en' ? 'btn btn-primary btn-sm' : 'btn btn-outline-primary btn-sm'}
              onClick={() => onChangeLanguage('en')}
              aria-label={t('app.language.en')}
            >
              <BsGlobe2 className="me-1" aria-hidden="true" />
              EN
            </button>
          </div>
        </div>
      </aside>

      <main className="retaia-shell__main">
        <div className="retaia-shell__content">{children}</div>
      </main>
    </div>
  )
}
