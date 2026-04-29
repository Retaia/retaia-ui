import { useNavigate } from 'react-router-dom'
import { AssetDetailPanel } from '../components/app/AssetDetailPanel'
import { AssetListSection } from '../components/app/AssetListSection'
import { AuthenticatedShell } from '../components/layout/AuthenticatedShell'
import { WorkspaceScaffold } from '../components/layout/WorkspaceScaffold'
import { useRejectsPageController } from '../hooks/useRejectsPageController'

const SORT_OPTIONS = [
  { value: '-created_at', labelKey: 'toolbar.sortCreatedAtDesc' },
  { value: 'created_at', labelKey: 'toolbar.sortCreatedAtAsc' },
  { value: '-updated_at', labelKey: 'toolbar.sortUpdatedAtDesc' },
  { value: 'updated_at', labelKey: 'toolbar.sortUpdatedAtAsc' },
  { value: 'name', labelKey: 'toolbar.sortNameAsc' },
  { value: '-name', labelKey: 'toolbar.sortNameDesc' },
] as const

export function RejectsPage() {
  const controller = useRejectsPageController()
  const navigate = useNavigate()
  const from = typeof window === 'undefined' ? '/rejects' : `${window.location.pathname}${window.location.search}`

  const standaloneHref = controller.selectedAsset
    ? `/rejects/asset/${controller.selectedAsset.id}?from=${encodeURIComponent(from)}`
    : undefined

  return (
    <AuthenticatedShell
      currentView="rejects"
      contextEyebrow={controller.t('page.rejects.eyebrow')}
      contextTitle={controller.t('page.rejects.title')}
      contextDescription={controller.t('rejects.subtitle')}
      contextMeta={[
        controller.t('rejects.scopeSummary', { count: controller.assets.length }),
        controller.t('page.rejects.constraint1'),
        controller.t('page.rejects.constraint2'),
      ]}
    >
      <WorkspaceScaffold
        toolbar={
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                {controller.t('toolbar.search')}
              </span>
              <input
                type="search"
                value={controller.search}
                onChange={(event) => controller.setSearch(event.currentTarget.value)}
                placeholder={controller.t('rejects.searchPlaceholder')}
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                {controller.t('toolbar.sortBy')}
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
            visibleAssets={controller.assets}
            selectedAssetId={controller.selectedAssetId}
            batchIds={[]}
            selectionStatusLabel={controller.selectionStatusLabel}
            densityMode={controller.densityMode}
            displayType={controller.displayType}
            emptyAssetsMessage={controller.emptyAssetsMessage}
            hasMoreAssets={controller.hasMoreAssets}
            loadingMoreAssets={controller.loadingMoreAssets}
            showDecisionActions={false}
            helpText={controller.t('rejects.help')}
            onDecision={() => {}}
            onAssetClick={(assetId) => controller.onAssetClick(assetId)}
            onDisplayTypeChange={controller.setDisplayType}
            assetListRegionRef={controller.assetListRegionRef}
            onLoadMoreAssets={controller.loadMoreAssets}
          />
        }
        inspector={
          <AssetDetailPanel
            selectedAsset={controller.selectedAsset}
            availability={controller.availability}
            previewingPurge={controller.previewingPurge}
            executingPurge={controller.executingPurge}
            purgeStatus={controller.purgeStatus}
            decisionStatus={
              controller.retryStatus
                ? { kind: 'error', message: controller.retryStatus }
                : null
            }
            savingMetadata={controller.savingMetadata}
            metadataStatus={controller.metadataStatus}
            t={controller.t}
            onSaveMetadata={controller.onSaveMetadata}
            showLibraryActions
            onReopenAsset={controller.onReopenAsset}
            onReprocessAsset={controller.onReprocessAsset}
            reopeningAsset={controller.reopeningAsset}
            reprocessingAsset={controller.reprocessingAsset}
            transitionStatus={controller.transitionStatus}
            onPreviewPurge={controller.onPreviewPurge}
            onExecutePurge={controller.onExecutePurge}
            showDecisionActions={false}
            showPurgeActions
            onOpenStandaloneDetail={(assetId) =>
              navigate(`/rejects/asset/${assetId}?from=${encodeURIComponent(from)}`)
            }
            standaloneHref={standaloneHref}
            onKeywordClick={controller.onKeywordClick}
            layoutMode="sidebar"
            onClose={controller.clearSelection}
          />
        }
      />
    </AuthenticatedShell>
  )
}
