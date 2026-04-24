import { Link } from 'react-router-dom'
import { BsArrowUpRight, BsClockHistory, BsTrash3Fill } from 'react-icons/bs'
import type { ActivityLogEntry } from '../../services/activityLogPersistence'

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
  entries: ActivityLogEntry[]
  onClear: () => void
  formatTimestamp: (value: string) => string
}

function resolveAssetHref(entry: ActivityLogEntry): string | null {
  if (!entry.assetId) {
    return null
  }

  return `/${entry.scope}/asset/${entry.assetId}?from=${encodeURIComponent('/activity')}`
}

export function ActivityLogSection({ t, entries, onClear, formatTimestamp }: Props) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
            {t('page.activity.logEyebrow')}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
            {t('page.activity.logTitle')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
            {t('page.activity.logBody')}
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"
          onClick={onClear}
          disabled={entries.length === 0}
        >
          <BsTrash3Fill className="mr-2" aria-hidden="true" />
          {t('actions.journalClear')}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{t('page.activity.emptyTitle')}</p>
          <p className="mt-2">{t('page.activity.emptyBody')}</p>
          <Link
            to="/review"
            className="mt-4 inline-flex items-center rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-900/60 dark:bg-brand-950/40 dark:text-brand-200 dark:hover:bg-brand-950/70"
          >
            {t('page.activity.openReview')}
          </Link>
        </div>
      ) : (
        <ol className="mt-6 space-y-3">
          {entries.map((entry) => {
            const assetHref = resolveAssetHref(entry)
            return (
              <li
                key={entry.id}
                className="rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-4 dark:border-gray-800 dark:bg-gray-950/70"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{entry.label}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                        {t(`page.activity.scope.${entry.scope}`)}
                      </span>
                      {entry.assetId ? (
                        <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700 dark:border-brand-900/60 dark:bg-brand-950/40 dark:text-brand-200">
                          {t('page.activity.assetBadge', { id: entry.assetId })}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                      <BsClockHistory aria-hidden="true" />
                      <span>{formatTimestamp(entry.createdAt)}</span>
                    </p>
                  </div>

                  {assetHref ? (
                    <Link
                      to={assetHref}
                      className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      {t('page.activity.openAsset')}
                      <BsArrowUpRight className="ml-2" aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
