import { useNavigate } from 'react-router-dom'
import { AuthenticatedShell } from '../components/layout/AuthenticatedShell'
import { ReviewListDetailSection } from '../components/review/ReviewListDetailSection'
import { ReviewOverviewSection } from '../components/review/ReviewOverviewSection'
import { ReviewWorkspaceSection } from '../components/review/ReviewWorkspaceSection'
import { useReviewPageController } from '../hooks/useReviewPageController'

export default function ReviewWorkspacePage() {
  const controller = useReviewPageController({ view: 'workspace' })
  const navigate = useNavigate()
  const from = typeof window === 'undefined' ? '/review' : `${window.location.pathname}${window.location.search}`

  const standaloneHref = controller.selectedAsset
    ? `/review/asset/${controller.selectedAsset.id}?from=${encodeURIComponent(from)}`
    : undefined

  return (
    <AuthenticatedShell currentView="review">
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
            {controller.t('page.review.eyebrow')}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 dark:text-white">
            {controller.t('page.review.title')}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-300">
            {controller.t('page.review.body')}
          </p>
        </section>

        <ReviewOverviewSection
          t={controller.t}
          totalAssets={controller.assets.length}
          counts={controller.counts}
          filter={controller.filter}
          mediaTypeFilter={controller.mediaTypeFilter}
          dateFilter={controller.dateFilter}
          sort={controller.sort}
          search={controller.search}
          isApiAssetSource={controller.isApiAssetSource}
          assetsLoadState={controller.assetsLoadState}
          policyLoadState={controller.policyLoadState}
          bulkDecisionsEnabled={controller.bulkDecisionsEnabled}
          onFilterChange={controller.setFilter}
          onMediaTypeFilterChange={controller.setMediaTypeFilter}
          onDateFilterChange={controller.setDateFilter}
          onSortChange={controller.setSort}
          onSearchChange={controller.setSearch}
        />

        <ReviewWorkspaceSection
          t={controller.t}
          batchOnly={controller.batchOnly}
          densityMode={controller.densityMode}
          availability={controller.effectiveAvailability}
          batchIdsLength={controller.batchIds.length}
          batchScope={controller.batchScope}
          batchTimeline={controller.batchTimeline}
          pendingBatchExecution={controller.pendingBatchExecution}
          pendingBatchUndoSeconds={controller.pendingBatchUndoSeconds}
          previewingBatch={controller.previewingBatch}
          executingBatch={controller.executingBatch}
          previewStatus={controller.previewStatus}
          executeStatus={controller.executeStatus}
          retryStatus={controller.retryStatus}
          reportBatchId={controller.reportBatchId}
          reportStatus={controller.reportStatus}
          reportData={controller.reportData}
          lastSuccessfulReportBatchId={controller.lastSuccessfulReportBatchId}
          lastSuccessfulReportData={controller.lastSuccessfulReportData}
          reportExportStatus={controller.reportExportStatus}
          undoStackLength={controller.undoStack.length}
          todoAssets={controller.todoAssets}
          doneAssets={controller.doneAssets}
          onApplySavedView={controller.applySavedView}
          onApplyPresetPendingRecent={controller.applyPresetPendingRecent}
          onApplyPresetImagesRejected={controller.applyPresetImagesRejected}
          onApplyPresetMediaReview={controller.applyPresetMediaReview}
          onFocusPending={controller.focusPending}
          onToggleBatchOnly={controller.toggleBatchOnly}
          onApplyDecisionToVisible={controller.applyDecisionToVisible}
          onClearFilters={controller.clearFilters}
          onToggleDensityMode={controller.toggleDensityMode}
          onApplyDecisionToBatch={controller.applyDecisionToBatch}
          onClearBatch={controller.clearBatch}
          onPreviewBatchMove={controller.previewBatchMove}
          onExecuteBatchMove={controller.executeBatchMove}
          onCancelPendingBatchExecution={controller.cancelPendingBatchExecution}
          onRefreshBatchReport={controller.refreshBatchReport}
          onExportBatchReport={controller.exportBatchReport}
          onUndoLastAction={controller.undoLastAction}
          onOpenAsset={controller.openAsset}
        />

        <ReviewListDetailSection
          t={controller.t}
          visibleAssets={controller.visibleAssets}
          selectedAssetId={controller.selectedAssetId}
          batchIds={controller.batchIds}
          selectionStatusLabel={controller.selectionStatusLabel}
          densityMode={controller.densityMode}
          displayType={controller.displayType}
          emptyAssetsMessage={controller.emptyAssetsMessage}
          hasMoreAssets={controller.hasMoreAssets}
          loadingMoreAssets={controller.loadingMoreAssets}
          selectedAsset={controller.selectedAsset}
          availability={controller.effectiveAvailability}
          previewingPurge={controller.previewingPurge}
          executingPurge={controller.executingPurge}
          purgeStatus={controller.purgeStatus}
          decisionStatus={controller.decisionStatus}
          processingProfileStatus={controller.processingProfileStatus}
          savingProcessingProfile={controller.savingProcessingProfile}
          savingMetadata={controller.savingMetadata}
          metadataStatus={controller.metadataStatus}
          showRefreshAction={controller.shouldRefreshSelectedAsset}
          refreshingAsset={controller.refreshingSelectedAsset}
          assetListRegionRef={controller.assetListRegionRef}
          onDecision={controller.handleDecision}
          onAssetClick={controller.handleAssetClick}
          onBatchSelectionChange={controller.setBatchAssetSelected}
          onChooseProcessingProfile={controller.chooseSelectedAssetProcessingProfile}
          onDisplayTypeChange={controller.setDisplayType}
          onSaveMetadata={controller.saveSelectedAssetMetadata}
          onPreviewPurge={controller.previewSelectedAssetPurge}
          onExecutePurge={controller.executeSelectedAssetPurge}
          onRefreshAsset={controller.refreshSelectedAsset}
          onOpenStandaloneDetail={(assetId) => navigate(`/review/asset/${assetId}?from=${encodeURIComponent(from)}`)}
          standaloneHref={standaloneHref}
          onKeywordClick={controller.onKeywordClick}
          onLoadMoreAssets={controller.loadMoreAssets}
          onCloseDetail={controller.clearSelection}
        />
      </div>
    </AuthenticatedShell>
  )
}
