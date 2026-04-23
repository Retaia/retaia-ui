import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AssetDetailPanel } from '../components/app/AssetDetailPanel'
import { AssetListSection } from '../components/app/AssetListSection'
import { AuthenticatedShell } from '../components/layout/AuthenticatedShell'
import { useLibraryPageController } from '../hooks/useLibraryPageController'

const SORT_OPTIONS = [
  { value: '-created_at', labelKey: 'library.sortCreatedAtDesc' },
  { value: 'created_at', labelKey: 'library.sortCreatedAtAsc' },
  { value: '-updated_at', labelKey: 'library.sortUpdatedAtDesc' },
  { value: 'updated_at', labelKey: 'library.sortUpdatedAtAsc' },
  { value: 'name', labelKey: 'library.sortNameAsc' },
  { value: '-name', labelKey: 'library.sortNameDesc' },
] as const

export function LibraryPage() {
  const controller = useLibraryPageController()
  const navigate = useNavigate()
  const location = useLocation()
  const from = useMemo(
    () => `${location.pathname}${location.search}`,
    [location.pathname, location.search],
  )

  const standaloneHref = controller.selectedAsset
    ? `/library/asset/${controller.selectedAsset.id}?from=${encodeURIComponent(from)}`
    : undefined

  return (
    <AuthenticatedShell currentView="library">
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
            {controller.t('page.library.eyebrow')}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 dark:text-white">
            {controller.t('page.library.title')}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-300">
            {controller.t('library.subtitle')}
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                {controller.t('library.search')}
              </span>
              <input
                type="search"
                value={controller.search}
                onChange={(event) => controller.setSearch(event.currentTarget.value)}
                placeholder={controller.t('library.searchPlaceholder')}
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                {controller.t('library.sortBy')}
              </span>
              <select
                value={controller.sort}
                onChange={(event) => controller.setSort(event.currentTarget.value as typeof controller.sort)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {controller.t(option.labelKey)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>{controller.t('library.scopeSummary', { count: controller.visibleAssets.length })}</span>
            <span>{controller.t('page.library.constraint1')}</span>
            <span>{controller.t('page.library.constraint3')}</span>
          </div>
        </section>

        <section className="mt-1 flex flex-wrap gap-4">
          <AssetListSection
            t={controller.t}
            visibleAssets={controller.visibleAssets}
            selectedAssetId={controller.selectedAssetId}
            batchIds={[]}
            selectionStatusLabel={
              controller.selectedAssetId
                ? controller.t('assets.selectionStatusOne', { id: controller.selectedAssetId })
                : controller.t('assets.selectionStatusNone')
            }
            densityMode={controller.densityMode}
            displayType={controller.displayType}
            emptyAssetsMessage={controller.search.trim().length > 0 ? controller.t('assets.emptyFiltered') : controller.t('library.empty')}
            hasMoreAssets={controller.hasMoreAssets}
            loadingMoreAssets={controller.loadingMoreAssets}
            showDecisionActions={false}
            helpText={controller.t('library.help')}
            onDecision={() => {}}
            onAssetClick={(assetId) => controller.onAssetClick(assetId)}
            onDisplayTypeChange={controller.setDisplayType}
            assetListRegionRef={{ current: null }}
            onLoadMoreAssets={controller.loadMoreAssets}
          />
        </section>

        <aside
          data-testid="library-detail-sidebar"
          className={[
            'fixed right-0 top-0 z-40 h-screen w-full max-w-2xl border-l border-gray-200 bg-gray-50/90 p-4 backdrop-blur-sm transition-transform duration-300 dark:border-gray-700 dark:bg-gray-900/90',
            controller.selectedAsset ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
          aria-hidden={!controller.selectedAsset}
        >
          <div className="h-full overflow-y-auto">
            <AssetDetailPanel
              selectedAsset={controller.selectedAsset}
              decisionStatus={null}
              savingMetadata={controller.savingMetadata}
              metadataStatus={controller.metadataStatus}
              t={controller.t}
              onSaveMetadata={controller.onSaveMetadata}
              showDecisionActions={false}
              showPurgeActions={false}
              showLibraryActions
              onReopenAsset={controller.onReopenAsset}
              onReprocessAsset={controller.onReprocessAsset}
              reopeningAsset={controller.reopeningAsset}
              reprocessingAsset={controller.reprocessingAsset}
              transitionStatus={controller.transitionStatus}
              onOpenStandaloneDetail={(assetId) =>
                navigate(`/library/asset/${assetId}?from=${encodeURIComponent(from)}`)
              }
              standaloneHref={standaloneHref}
              onKeywordClick={controller.onKeywordClick}
              layoutMode="sidebar"
              onClose={() => controller.openAsset(null)}
            />
          </div>
        </aside>
      </div>
    </AuthenticatedShell>
  )
}
