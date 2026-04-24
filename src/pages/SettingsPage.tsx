import { useTranslation } from 'react-i18next'
import { BsFlagFill, BsGlobe2 } from 'react-icons/bs'
import { AuthenticatedShell } from '../components/layout/AuthenticatedShell'
import { RuntimeSettingsSection } from '../components/settings/RuntimeSettingsSection'
import { useAuthPageController } from '../hooks/useAuthPageController'
import { useTailadminTheme } from '../ui/tailadmin-theme'

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const controller = useAuthPageController()
  const { mode, setMode } = useTailadminTheme()

  return (
    <AuthenticatedShell currentView="settings">
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
            {t('page.settings.eyebrow')}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 dark:text-white">
            {t('page.settings.title')}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-300">
            {t('page.settings.body')}
          </p>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('page.settings.preferences')}
            </h2>
            <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
              {t('settings.preferencesBody')}
            </p>

            <div className="mt-5 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t('app.themeToggle')}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(['system', 'light', 'dark'] as const).map((nextMode) => (
                    <button
                      key={nextMode}
                      type="button"
                      className={[
                        'rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                        mode === nextMode
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800',
                      ].join(' ')}
                      onClick={() => setMode(nextMode)}
                    >
                      {t(`page.settings.theme.${nextMode}`)}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  {t('settings.currentTheme', { value: t(`page.settings.theme.${mode}`) })}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t('app.language')}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800"
                    onClick={() => void i18n.changeLanguage('fr')}
                  >
                    <BsFlagFill aria-hidden="true" />
                    {t('app.language.fr')}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800"
                    onClick={() => void i18n.changeLanguage('en')}
                  >
                    <BsGlobe2 aria-hidden="true" />
                    {t('app.language.en')}
                  </button>
                </div>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  {t('settings.currentLanguage', {
                    value: i18n.resolvedLanguage === 'en' ? t('app.language.en') : t('app.language.fr'),
                  })}
                </p>
              </div>
            </div>
          </section>

          <RuntimeSettingsSection t={t} controller={controller} />
        </div>
      </div>
    </AuthenticatedShell>
  )
}
