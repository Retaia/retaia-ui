import { useNavigate } from 'react-router-dom'
import { AssetDetailPanel } from '../components/app/AssetDetailPanel'
import { AssetListSection } from '../components/app/AssetListSection'
import { AuthenticatedShell } from '../components/layout/AuthenticatedShell'
import { WorkspaceScaffold } from '../components/layout/WorkspaceScaffold'
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
  const from = typeof window === 'undefined' ? '/library' : `${window.location.pathname}${window.location.search}`

  const standaloneHref = controller.selectedAsset
    ? `/library/asset/${controller.selectedAsset.id}?from=${encodeURIComponent(from)}`
    : undefined

  return (
    <AuthenticatedShell
      currentView="library"
      contextEyebrow={controller.t('page.library.eyebrow')}
      contextTitle={controller.t('page.library.title')}
      contextDescription={controller.t('library.subtitle')}
      contextMeta={[
        controller.t('library.scopeSummary', { count: controller.visibleAssets.length }),
        controller.t('library.scopeMediaSummary', {
          video: controller.visibleMediaTypeCounts.VIDEO,
          audio: controller.visibleMediaTypeCounts.AUDIO,
          image: controller.visibleMediaTypeCounts.IMAGE,
        }),
        controller.t('page.library.constraint1'),
        controller.t('page.library.constraint3'),
      ]}
    >
      <WorkspaceScaffold
        toolbar={
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/60">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  {controller.t('summary.total')}
                </div>
                <div className="mt-2 text-xl font-semibold text-gray-950 dark:text-white">
                  {controller.visibleAssets.length}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/60">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  {controller.t('toolbar.mediaTypeVideo')}
                </div>
                <div className="mt-2 text-xl font-semibold text-gray-950 dark:text-white">
                  {controller.visibleMediaTypeCounts.VIDEO}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/60">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  {controller.t('toolbar.mediaTypeAudio')}
                </div>
                <div className="mt-2 text-xl font-semibold text-gray-950 dark:text-white">
                  {controller.visibleMediaTypeCounts.AUDIO}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/60">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  {controller.t('toolbar.mediaTypeImage')}
                </div>
                <div className="mt-2 text-xl font-semibold text-gray-950 dark:text-white">
                  {controller.visibleMediaTypeCounts.IMAGE}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px_240px]">
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
                  {controller.t('toolbar.mediaType')}
                </span>
                <select
                  value={controller.mediaTypeFilter}
                  onChange={(event) => controller.setMediaTypeFilter(event.currentTarget.value as typeof controller.mediaTypeFilter)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                >
                  <option value="ALL">{controller.t('toolbar.all')}</option>
                  <option value="VIDEO">{controller.t('toolbar.mediaTypeVideo')}</option>
                  <option value="AUDIO">{controller.t('toolbar.mediaTypeAudio')}</option>
                  <option value="IMAGE">{controller.t('toolbar.mediaTypeImage')}</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                  {controller.t('toolbar.date')}
                </span>
                <select
                  value={controller.dateFilter}
                  onChange={(event) => controller.setDateFilter(event.currentTarget.value as typeof controller.dateFilter)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                >
                  <option value="ALL">{controller.t('toolbar.all')}</option>
                  <option value="LAST_7_DAYS">{controller.t('toolbar.date7d')}</option>
                  <option value="LAST_30_DAYS">{controller.t('toolbar.date30d')}</option>
                </select>
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

            <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
              {controller.t('library.requalificationBody')}
            </p>
          </div>
        }
        main={
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
        }
        inspector={
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
        }
      />
    </AuthenticatedShell>
  )
}
