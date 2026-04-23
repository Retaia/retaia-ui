import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function ForbiddenPage() {
  const { t } = useTranslation()

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
          403
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">{t('errors.forbiddenTitle')}</h1>
        <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">{t('errors.forbiddenBody')}</p>
        <div className="mt-6">
          <Link className="rounded-lg border border-brand-500 bg-brand-500 px-4 py-2 text-sm font-semibold text-white" to="/review">
            {t('app.nav.review')}
          </Link>
        </div>
      </div>
    </main>
  )
}
