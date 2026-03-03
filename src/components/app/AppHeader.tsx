import type { ReactNode } from 'react'
import {
  BsArchiveFill,
  BsFlagFill,
  BsGearFill,
  BsGlobe2,
  BsMoonStarsFill,
  BsShieldLockFill,
  BsSunFill,
  BsXOctagonFill,
} from 'react-icons/bs'
import type { Locale } from '../../i18n/resources'
import { reportUiNavigationAction } from '../../ui/telemetry'
import { useTailadminTheme } from '../../ui/tailadmin-theme'

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
  const { mode, resolvedTheme, toggleMode } = useTailadminTheme()

  const navButtonClass = (active: boolean) =>
    [
      'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
      active
        ? 'border-brand-500 bg-brand-50 text-brand-600'
        : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-600',
    ].join(' ')

  const adminButtonClass =
    'inline-flex w-full items-center justify-start gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100'

  const langButtonClass = (active: boolean) =>
    [
      'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
      active
        ? 'border-brand-500 bg-brand-500 text-white'
        : 'border-brand-500 bg-white text-brand-600 hover:bg-brand-50',
    ].join(' ')

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
    <div className="grid min-h-screen grid-cols-1 bg-gray-50 lg:grid-cols-[272px_minmax(0,1fr)]">
      <aside
        className="flex flex-col gap-4 border-b border-gray-200 bg-white/90 p-4 backdrop-blur-sm lg:sticky lg:top-0 lg:min-h-screen lg:border-b-0 lg:border-r"
        aria-label={t('app.navigation')}
      >
        <div className="flex items-center gap-3">
          <img
            src="/retaia-logo-512.png"
            width={28}
            height={28}
            className="rounded-md align-text-top"
            alt=""
            aria-hidden="true"
          />
          <div>
            <h1 className="text-lg font-bold leading-tight text-gray-900">{t('app.title')}</h1>
            <p className="mt-0.5 text-xs text-gray-500">{t('app.subtitle')}</p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch" aria-label={t('app.navigation')}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={navButtonClass(currentView === item.id)}
              onClick={item.onClick}
            >
              <item.icon className="shrink-0" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex flex-wrap gap-2 lg:mt-auto lg:flex-col">
          <div className="w-full text-xs font-bold uppercase tracking-wide text-gray-500">{t('app.adminMenu')}</div>
          <button
            type="button"
            className={adminButtonClass}
            onClick={() => trackNavigationAction('sidebar:settings', '/settings', onOpenSettings)}
          >
            <BsGearFill className="shrink-0" aria-hidden="true" />
            {t('settings.openSettings')}
          </button>
          <button
            type="button"
            className={adminButtonClass}
            onClick={() => trackNavigationAction('sidebar:auth', '/auth', onOpenAuth)}
          >
            <BsShieldLockFill className="shrink-0" aria-hidden="true" />
            {t('settings.openAuth')}
          </button>
          <div className="inline-flex gap-2" aria-label={t('app.language')}>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              onClick={toggleMode}
              aria-label={t('app.themeToggle')}
              title={`${t('app.themeToggle')} (${mode})`}
            >
              {resolvedTheme === 'dark' ? <BsSunFill aria-hidden="true" /> : <BsMoonStarsFill aria-hidden="true" />}
            </button>
            <button
              type="button"
              className={langButtonClass(locale === 'fr')}
              onClick={() => onChangeLanguage('fr')}
              aria-label={t('app.language.fr')}
            >
              <BsFlagFill className="mr-1" aria-hidden="true" />
              FR
            </button>
            <button
              type="button"
              className={langButtonClass(locale === 'en')}
              onClick={() => onChangeLanguage('en')}
              aria-label={t('app.language.en')}
            >
              <BsGlobe2 className="mr-1" aria-hidden="true" />
              EN
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0">
        <div className="mx-auto max-w-[1440px] p-4 lg:px-6 lg:py-5">{children}</div>
      </main>
    </div>
  )
}
