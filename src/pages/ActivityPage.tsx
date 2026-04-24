import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BsArrowRight, BsClockHistory, BsFiles, BsLink45Deg } from 'react-icons/bs'
import { ActivityLogSection } from '../components/activity/ActivityLogSection'
import { AuthenticatedShell } from '../components/layout/AuthenticatedShell'
import { useActivityLog } from '../hooks/useActivityLog'
import { clearActivityLog } from '../services/activityLogPersistence'

export default function ActivityPage() {
  const { t, i18n } = useTranslation()
  const activityLog = useActivityLog()

  const linkedAssetCount = useMemo(
    () => new Set(activityLog.flatMap((entry) => (entry.assetId ? [entry.assetId] : []))).size,
    [activityLog],
  )
  const latestEntry = activityLog[0] ?? null
  const formatTimestamp = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.resolvedLanguage === 'fr' ? 'fr-BE' : 'en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [i18n.resolvedLanguage],
  )

  return (
    <AuthenticatedShell currentView="activity">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_45%),linear-gradient(135deg,_rgba(59,130,246,0.08),_transparent_58%)] px-6 py-6 dark:border-gray-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.20),_transparent_45%),linear-gradient(135deg,_rgba(96,165,250,0.12),_transparent_58%)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
                  {t('page.activity.eyebrow')}
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 dark:text-white">
                  {t('page.activity.title')}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-300">
                  {t('page.activity.body')}
                </p>
              </div>

              <div className="inline-flex rounded-full border border-gray-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 dark:border-gray-700 dark:bg-gray-950/80 dark:text-gray-300">
                {t('page.activity.localOnly')}
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
            <article className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/70">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                {t('page.activity.summaryEntries')}
              </p>
              <p className="mt-3 text-3xl font-semibold text-gray-950 dark:text-white">{activityLog.length}</p>
            </article>

            <article className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/70">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                {t('page.activity.summaryAssets')}
              </p>
              <p className="mt-3 text-3xl font-semibold text-gray-950 dark:text-white">{linkedAssetCount}</p>
            </article>

            <article className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/70">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                {t('page.activity.summaryUpdated')}
              </p>
              <p className="mt-3 text-sm font-semibold text-gray-950 dark:text-white">
                {latestEntry ? formatTimestamp.format(new Date(latestEntry.createdAt)) : t('page.activity.summaryEmpty')}
              </p>
            </article>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
          <ActivityLogSection
            t={t}
            entries={activityLog}
            onClear={clearActivityLog}
            formatTimestamp={(value) => formatTimestamp.format(new Date(value))}
          />

          <aside className="space-y-6">
            <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 shadow-theme-sm dark:border-amber-900/60 dark:bg-amber-950/20">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800 dark:text-amber-200">
                {t('page.activity.rulesEyebrow')}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-amber-950 dark:text-amber-100">
                {t('page.activity.rulesTitle')}
              </h2>
              <p className="mt-2 text-sm leading-7 text-amber-950/90 dark:text-amber-50/90">
                {t('page.activity.rulesBody')}
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-amber-950 dark:text-amber-50">
                <li className="flex gap-3">
                  <BsClockHistory className="mt-1 shrink-0" aria-hidden="true" />
                  <span>{t('page.activity.constraint1')}</span>
                </li>
                <li className="flex gap-3">
                  <BsFiles className="mt-1 shrink-0" aria-hidden="true" />
                  <span>{t('page.activity.constraint2')}</span>
                </li>
                <li className="flex gap-3">
                  <BsLink45Deg className="mt-1 shrink-0" aria-hidden="true" />
                  <span>{t('page.activity.constraint3')}</span>
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
                {t('page.activity.nextEyebrow')}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
                {t('page.activity.nextTitle')}
              </h2>
              <div className="mt-4 space-y-3">
                <Link
                  to="/review"
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-4 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950/70 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  <span>{t('page.activity.openReview')}</span>
                  <BsArrowRight aria-hidden="true" />
                </Link>
                <Link
                  to="/library"
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-4 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950/70 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  <span>{t('page.activity.openLibrary')}</span>
                  <BsArrowRight aria-hidden="true" />
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AuthenticatedShell>
  )
}
