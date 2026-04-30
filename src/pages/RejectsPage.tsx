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
        controller.t('rejects.scopeSummary', { count: controller.visibleAssets.length }),
        controller.t('rejects.scopeMediaSummary', {
          video: controller.visibleMediaTypeCounts.VIDEO,
          audio: controller.visibleMediaTypeCounts.AUDIO,
          image: controller.visibleMediaTypeCounts.IMAGE,
        }),
        controller.t('rejects.retentionSummary', { count: controller.olderThan30DaysCount }),
        controller.t('page.rejects.constraint1'),
        controller.t('page.rejects.constraint2'),
      ]}
    >
      <WorkspaceScaffold
        toolbar={
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-5">
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
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/30">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                  {controller.t('rejects.retentionOlderThan30Days')}
                </div>
                <div className="mt-2 text-xl font-semibold text-amber-950 dark:text-amber-100">
                  {controller.olderThan30DaysCount}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px_240px]">
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

            {controller.workspaceStatus ? (
              <p
                role="status"
                aria-live="polite"
                className={[
                  'text-sm',
                  controller.workspaceStatus.kind === 'success' ? 'text-success-700' : 'text-error-700',
                ].join(' ')}
                >
                  {controller.workspaceStatus.message}
                </p>
              ) : null}

            <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
              {controller.t('rejects.requalificationBody')}
            </p>
          </div>
        }
        main={
          <AssetListSection
            t={controller.t}
            visibleAssets={controller.visibleAssets}
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
