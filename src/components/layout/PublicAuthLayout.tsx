import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { BsFlagFill, BsGlobe2, BsMoonStarsFill, BsSunFill } from 'react-icons/bs'
import { useTailadminTheme } from '../../ui/tailadmin-theme'

type Props = {
  title: string
  body: string
  children: ReactNode
}

export function PublicAuthLayout({ title, body, children }: Props) {
  const { t, i18n } = useTranslation()
  const { mode, resolvedTheme, toggleMode } = useTailadminTheme()

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-6 text-gray-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#111827_100%)] dark:text-gray-100">
      <div className="mx-auto flex max-w-6xl items-center justify-end gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          onClick={toggleMode}
          aria-label={t('app.themeToggle')}
          title={`${t('app.themeToggle')} (${mode})`}
        >
          {resolvedTheme === 'dark' ? <BsSunFill aria-hidden="true" /> : <BsMoonStarsFill aria-hidden="true" />}
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-brand-500 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:bg-gray-900 dark:text-brand-300 dark:hover:bg-brand-500/20"
          onClick={() => void i18n.changeLanguage('fr')}
          aria-label={t('app.language.fr')}
        >
          <BsFlagFill aria-hidden="true" />
          FR
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-brand-500 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:bg-gray-900 dark:text-brand-300 dark:hover:bg-brand-500/20"
          onClick={() => void i18n.changeLanguage('en')}
          aria-label={t('app.language.en')}
        >
          <BsGlobe2 aria-hidden="true" />
          EN
        </button>
      </div>

      <div className="mx-auto mt-6 grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-2xl border border-white/70 bg-white/85 p-8 shadow-theme-xl backdrop-blur dark:border-gray-800 dark:bg-gray-900/85">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
            {t('app.title')}
          </p>
          <h1 className="mt-4 max-w-lg text-4xl font-bold tracking-tight text-gray-950 dark:text-white">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600 dark:text-gray-300">
            {body}
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xl dark:border-gray-800 dark:bg-gray-900">
          {children}
        </section>
      </div>
    </main>
  )
}
