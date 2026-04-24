import { Link } from 'react-router-dom'
import { BsArrowRight, BsClockHistory, BsFiles, BsLink45Deg } from 'react-icons/bs'
import { ActivityLogSection } from '../components/activity/ActivityLogSection'
import { AuthenticatedShell } from '../components/layout/AuthenticatedShell'
import { useActivityPageController } from '../hooks/useActivityPageController'

export default function ActivityPage() {
  const controller = useActivityPageController()

  return (
    <AuthenticatedShell currentView="activity">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_45%),linear-gradient(135deg,_rgba(59,130,246,0.08),_transparent_58%)] px-6 py-6 dark:border-gray-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.20),_transparent_45%),linear-gradient(135deg,_rgba(96,165,250,0.12),_transparent_58%)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
                  {controller.t('page.activity.eyebrow')}
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 dark:text-white">
                  {controller.t('page.activity.title')}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-300">
                  {controller.t('page.activity.body')}
                </p>
              </div>

              <div className="inline-flex rounded-full border border-gray-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 dark:border-gray-700 dark:bg-gray-950/80 dark:text-gray-300">
                {controller.t('page.activity.localOnly')}
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-b border-gray-200 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_240px_auto] dark:border-gray-800">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                {controller.t('page.activity.filterSearch')}
              </span>
              <input
                type="search"
                value={controller.search}
                onChange={(event) => controller.setSearch(event.currentTarget.value)}
                placeholder={controller.t('page.activity.filterSearchPlaceholder')}
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                {controller.t('page.activity.filterScope')}
              </span>
              <select
                value={controller.scope}
                onChange={(event) => controller.setScope(event.currentTarget.value as 'ALL' | 'review' | 'library' | 'rejects')}
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              >
                <option value="ALL">{controller.t('page.activity.scope.ALL')}</option>
                <option value="review">{controller.t('page.activity.scope.review')}</option>
                <option value="library">{controller.t('page.activity.scope.library')}</option>
                <option value="rejects">{controller.t('page.activity.scope.rejects')}</option>
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-950/70 dark:text-gray-200">
              <input
                type="checkbox"
                checked={controller.linkedOnly}
                onChange={(event) => controller.setLinkedOnly(event.currentTarget.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-300"
              />
              <span>{controller.t('page.activity.filterLinkedOnly')}</span>
            </label>
          </div>

          <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
            <article className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/70">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                {controller.t('page.activity.summaryEntries')}
              </p>
              <p className="mt-3 text-3xl font-semibold text-gray-950 dark:text-white">{controller.visibleEntries.length}</p>
              {controller.hasActiveFilters ? (
                <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {controller.t('page.activity.summaryFiltered', { count: controller.totalEntries })}
                </p>
              ) : null}
            </article>

            <article className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/70">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                {controller.t('page.activity.summaryAssets')}
              </p>
              <p className="mt-3 text-3xl font-semibold text-gray-950 dark:text-white">{controller.linkedAssetCount}</p>
            </article>

            <article className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/70">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                {controller.t('page.activity.summaryUpdated')}
              </p>
              <p className="mt-3 text-sm font-semibold text-gray-950 dark:text-white">
                {controller.latestEntry
                  ? controller.formatTimestamp(controller.latestEntry.createdAt)
                  : controller.t('page.activity.summaryEmpty')}
              </p>
            </article>
          </div>

          <div className="flex flex-wrap gap-3 px-6 pb-6 text-xs text-gray-500 dark:text-gray-400">
            <span>{controller.t('page.activity.scopeCount.review', { count: controller.scopeCounts.review })}</span>
            <span>{controller.t('page.activity.scopeCount.library', { count: controller.scopeCounts.library })}</span>
            <span>{controller.t('page.activity.scopeCount.rejects', { count: controller.scopeCounts.rejects })}</span>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
          <ActivityLogSection
            t={controller.t}
            entries={controller.visibleEntries}
            onClear={controller.clearActivityLog}
            formatTimestamp={controller.formatTimestamp}
          />

          <aside className="space-y-6">
            <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 shadow-theme-sm dark:border-amber-900/60 dark:bg-amber-950/20">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800 dark:text-amber-200">
                {controller.t('page.activity.rulesEyebrow')}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-amber-950 dark:text-amber-100">
                {controller.t('page.activity.rulesTitle')}
              </h2>
              <p className="mt-2 text-sm leading-7 text-amber-950/90 dark:text-amber-50/90">
                {controller.t('page.activity.rulesBody')}
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-amber-950 dark:text-amber-50">
                <li className="flex gap-3">
                  <BsClockHistory className="mt-1 shrink-0" aria-hidden="true" />
                  <span>{controller.t('page.activity.constraint1')}</span>
                </li>
                <li className="flex gap-3">
                  <BsFiles className="mt-1 shrink-0" aria-hidden="true" />
                  <span>{controller.t('page.activity.constraint2')}</span>
                </li>
                <li className="flex gap-3">
                  <BsLink45Deg className="mt-1 shrink-0" aria-hidden="true" />
                  <span>{controller.t('page.activity.constraint3')}</span>
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
                {controller.t('page.activity.nextEyebrow')}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
                {controller.t('page.activity.nextTitle')}
              </h2>
              <div className="mt-4 space-y-3">
                <Link
                  to="/review"
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-4 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950/70 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  <span>{controller.t('page.activity.openReview')}</span>
                  <BsArrowRight aria-hidden="true" />
                </Link>
                <Link
                  to="/library"
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-4 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950/70 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  <span>{controller.t('page.activity.openLibrary')}</span>
                  <BsArrowRight aria-hidden="true" />
                </Link>
                <Link
                  to="/rejects"
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-4 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950/70 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  <span>{controller.t('page.activity.openRejects')}</span>
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
