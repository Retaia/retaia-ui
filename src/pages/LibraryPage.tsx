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
        controller.t('page.library.constraint1'),
        controller.t('page.library.constraint3'),
      ]}
    >
      <WorkspaceScaffold
        toolbar={
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
