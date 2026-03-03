import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/app/AppHeader'
import { ActivitySection } from '../components/review/ActivitySection'
import { BatchOperationsSection } from '../components/review/BatchOperationsSection'
import { BatchReportsSection } from '../components/review/BatchReportsSection'
import { ReviewListDetailSection } from '../components/review/ReviewListDetailSection'
import { ReviewOverviewSection } from '../components/review/ReviewOverviewSection'
import { ReviewWorkspaceSection } from '../components/review/ReviewWorkspaceSection'
import { useReviewPageController, type ReviewPageView } from '../hooks/useReviewPageController'
import { persistLastRoute, persistScrollY, readScrollY } from '../services/workspaceContextPersistence'
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard'

type ReviewPageProps = {
  view?: ReviewPageView
}

function ReviewPage({ view = 'workspace' }: ReviewPageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const controller = useReviewPageController({ view })
  const isScrollableView = view === 'workspace' || view === 'batch'

  useEffect(() => {
    persistLastRoute(location.pathname, location.search)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!isScrollableView || typeof window === 'undefined') {
      return
    }
    const savedScrollY = readScrollY('review')
    if (savedScrollY <= 0) {
      return
    }
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollY, left: 0, behavior: 'auto' })
    })
  }, [isScrollableView])

  useEffect(() => {
    if (!isScrollableView || typeof window === 'undefined') {
      return
    }
    const handleScroll = () => {
      persistScrollY('review', window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isScrollableView])
  const [hasUnsavedMetadata, setHasUnsavedMetadata] = useState(false)
  const confirmLeaveIfDirty = useUnsavedChangesGuard(hasUnsavedMetadata, controller.t('detail.unsavedChangesConfirm'))
  const getStandaloneReviewDetailHref = (assetId: string) => {
    const from =
      typeof window === 'undefined'
        ? '/review'
        : `${window.location.pathname}${window.location.search}`
    return `/review/detail/${assetId}?from=${encodeURIComponent(from)}`
  }
  const openBatchEditor = () => {
    if (typeof document === 'undefined') {
      return
    }
    window.requestAnimationFrame(() => {
      document.getElementById('batch-edit-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <AppHeader
      locale={controller.locale}
      t={controller.t}
      currentView={view === 'activity' ? 'activity' : 'workspace'}
      onOpenSettings={() => {
        if (confirmLeaveIfDirty()) {
          navigate('/settings')
        }
      }}
      onOpenAuth={() => {
        if (confirmLeaveIfDirty()) {
          navigate('/auth')
        }
      }}
      onOpenReview={() => {
        if (confirmLeaveIfDirty()) {
          navigate('/review')
        }
      }}
      onOpenActivity={() => {
        if (confirmLeaveIfDirty()) {
          navigate('/activity')
        }
      }}
      onOpenLibrary={() => {
        if (confirmLeaveIfDirty()) {
          navigate('/library')
        }
      }}
      onChangeLanguage={controller.onChangeLanguage}
    >
      {(controller.isWorkspaceView || controller.isBatchView) ? (
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
      ) : null}

      {controller.isWorkspaceView ? (
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
          activityLog={controller.activityLog}
          showShortcutsHelp={controller.showShortcutsHelp}
          nextPendingAsset={controller.nextPendingAsset}
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
          onClearActivityLog={controller.clearActivityLog}
          onToggleShortcutsHelp={controller.toggleShortcutsHelp}
          onOpenNextPending={controller.openNextPending}
          onDecision={controller.handleDecision}
        />
      ) : null}

      {controller.isBatchView ? (
        <BatchOperationsSection
          t={controller.t}
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
          onApplyDecisionToBatch={controller.applyDecisionToBatch}
          onClearBatch={controller.clearBatch}
          onPreviewBatchMove={controller.previewBatchMove}
          onExecuteBatchMove={controller.executeBatchMove}
          onCancelPendingBatchExecution={controller.cancelPendingBatchExecution}
        />
      ) : null}

      {controller.isReportsView ? (
        <BatchReportsSection
          t={controller.t}
          refreshReportDisabled={controller.effectiveAvailability.refreshReportDisabled}
          reportBatchId={controller.reportBatchId}
          reportStatus={controller.reportStatus}
          reportData={controller.reportData}
          lastSuccessfulReportBatchId={controller.lastSuccessfulReportBatchId}
          lastSuccessfulReportData={controller.lastSuccessfulReportData}
          reportExportStatus={controller.reportExportStatus}
          onRefreshBatchReport={controller.refreshBatchReport}
          onExportBatchReport={controller.exportBatchReport}
        />
      ) : null}

      {controller.isActivityView ? (
        <ActivitySection
          t={controller.t}
          undoDisabled={controller.effectiveAvailability.undoDisabled}
          undoStackLength={controller.undoStack.length}
          activityLog={controller.activityLog}
          onUndoLastAction={controller.undoLastAction}
          onClearActivityLog={controller.clearActivityLog}
        />
      ) : null}

      {(controller.isWorkspaceView || controller.isBatchView) ? (
        <ReviewListDetailSection
          t={controller.t}
          visibleAssets={controller.visibleAssets}
          selectedAssetId={controller.selectedAssetId}
          batchIds={controller.batchIds}
          selectionStatusLabel={controller.selectionStatusLabel}
          densityMode={controller.densityMode}
          emptyAssetsMessage={controller.emptyAssetsMessage}
          hasMoreAssets={controller.hasMoreAssets}
          loadingMoreAssets={controller.loadingMoreAssets}
          selectedAsset={controller.selectedAsset}
          availability={controller.effectiveAvailability}
          previewingPurge={controller.previewingPurge}
          executingPurge={controller.executingPurge}
          purgeStatus={controller.purgeStatus}
          decisionStatus={controller.decisionStatus}
          savingMetadata={controller.savingMetadata}
          metadataStatus={controller.metadataStatus}
          showRefreshAction={controller.shouldRefreshSelectedAsset && controller.isApiAssetSource}
          refreshingAsset={controller.refreshingSelectedAsset}
          assetListRegionRef={controller.assetListRegionRef}
          onDecision={controller.handleDecision}
          onAssetClick={controller.handleAssetClick}
          onBatchSelectionChange={controller.setBatchAssetSelected}
          onOpenBatchEditor={openBatchEditor}
          onSaveMetadata={controller.saveSelectedAssetMetadata}
          onPreviewPurge={controller.previewSelectedAssetPurge}
          onExecutePurge={controller.executeSelectedAssetPurge}
          onRefreshAsset={controller.refreshSelectedAsset}
          onOpenStandaloneDetail={(assetId) => {
            if (!confirmLeaveIfDirty()) {
              return
            }
            navigate(getStandaloneReviewDetailHref(assetId))
          }}
          standaloneHref={controller.selectedAsset ? getStandaloneReviewDetailHref(controller.selectedAsset.id) : undefined}
          onKeywordClick={controller.onKeywordClick}
          onLoadMoreAssets={controller.loadMoreAssets}
          onMetadataDirtyChange={setHasUnsavedMetadata}
        />
      ) : null}
    </AppHeader>
  )
}

export default ReviewPage
