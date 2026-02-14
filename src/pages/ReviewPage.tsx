import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Container, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ActionPanels } from '../components/app/ActionPanels'
import { AssetListSection } from '../components/app/AssetListSection'
import { AppHeader } from '../components/app/AppHeader'
import { AssetDetailPanel } from '../components/app/AssetDetailPanel'
import { NextPendingCard } from '../components/app/NextPendingCard'
import { ReviewStatusAlerts } from '../components/app/ReviewStatusAlerts'
import { ReviewSummary } from '../components/ReviewSummary'
import { ReviewToolbar } from '../components/ReviewToolbar'
import { ApiError } from '../api/client'
import { mapApiErrorToMessage } from '../api/errorMapping'
import { INITIAL_ASSETS } from '../data/mockAssets'
import {
  type Asset,
  type AssetDateFilter,
  type AssetFilter,
  type AssetMediaTypeFilter,
  type AssetState,
  countAssetsByState,
  filterAssets,
  type DecisionAction,
  updateAssetsState,
} from '../domain/assets'
import { getActionAvailability } from '../domain/actionAvailability'
import { useDensityMode } from '../hooks/useDensityMode'
import { useBatchExecution } from '../hooks/useBatchExecution'
import { usePurgeFlow } from '../hooks/usePurgeFlow'
import { useQuickFilters } from '../hooks/useQuickFilters'
import { useReviewApiRuntime } from '../hooks/useReviewApiRuntime'
import { useReviewDataController } from '../hooks/useReviewDataController'
import { useReviewHistory } from '../hooks/useReviewHistory'
import { useReviewKeyboardShortcuts } from '../hooks/useReviewKeyboardShortcuts'
import { useReviewRouteSelection } from '../hooks/useReviewRouteSelection'
import { useSelectionFlow } from '../hooks/useSelectionFlow'
import { type Locale } from '../i18n/resources'
import { applySingleReviewDecision } from '../application/review/applySingleReviewDecision'
import { resolveAssetListFocusTarget } from '../application/review/assetListFocus'
import { summarizeBatchScope } from '../application/review/batchScopeSummary'
import { finalizeBulkDecisionResult } from '../application/review/bulkDecisionFinalization'
import { submitReviewDecisions } from '../application/review/submitReviewDecisions'
import {
  refreshReviewAsset,
  saveReviewAssetMetadata,
} from '../application/review/reviewAssetMaintenance'
import { useShortcutsHelpState } from '../hooks/useShortcutsHelpState'
import { isTypingContext } from '../ui/keyboard'
import { reportUiIssue } from '../ui/telemetry'

function isStateConflictError(error: unknown) {
  return error instanceof ApiError && error.payload?.code === 'STATE_CONFLICT'
}

function ReviewPage() {
  const assetListRegionRef = useRef<HTMLElement | null>(null)
  const { t, i18n } = useTranslation()
  const { apiClient, isApiAssetSource, retryStatus, setRetryStatus } = useReviewApiRuntime()
  const [filter, setFilter] = useState<AssetFilter>('ALL')
  const [mediaTypeFilter, setMediaTypeFilter] = useState<AssetMediaTypeFilter>('ALL')
  const [dateFilter, setDateFilter] = useState<AssetDateFilter>('ALL')
  const [search, setSearch] = useState('')
  const [batchOnly, setBatchOnly] = useState(false)
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS)
  const {
    selectedAssetId,
    setSelectedAssetId,
    selectionAnchorId,
    setSelectionAnchorId,
    applySelectedAssetId,
  } = useReviewRouteSelection(INITIAL_ASSETS, assets)
  const [batchIds, setBatchIds] = useState<string[]>([])
  const { showShortcutsHelp, toggleShortcutsHelp } = useShortcutsHelpState()
  const { densityMode, toggleDensityMode } = useDensityMode()
  const [savingMetadata, setSavingMetadata] = useState(false)
  const [metadataStatus, setMetadataStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [decisionStatus, setDecisionStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [shouldRefreshSelectedAsset, setShouldRefreshSelectedAsset] = useState(false)
  const [refreshingSelectedAsset, setRefreshingSelectedAsset] = useState(false)
  const { assetsLoadState, policyLoadState, bulkDecisionsEnabled, assetDetailLoadState } =
    useReviewDataController({
      apiClient,
      isApiAssetSource,
      selectedAssetId,
      setAssets,
    })
  const visibleAssets = useMemo(() => {
    const filtered = filterAssets(assets, filter, search, {
      mediaType: mediaTypeFilter,
      date: dateFilter,
    })
    if (!batchOnly) {
      return filtered
    }
    const batchIdSet = new Set(batchIds)
    return filtered.filter((asset) => batchIdSet.has(asset.id))
  }, [assets, batchIds, batchOnly, dateFilter, filter, mediaTypeFilter, search])

  const counts = useMemo(() => countAssetsByState(assets), [assets])
  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
  )

  useEffect(() => {
    if (isApiAssetSource && assetsLoadState === 'error') {
      reportUiIssue('api.assets.load.error', {
        source: 'api',
      })
    }
  }, [assetsLoadState, isApiAssetSource])

  useEffect(() => {
    if (isApiAssetSource && selectedAssetId && assetDetailLoadState === 'error') {
      reportUiIssue('api.asset.detail.load.error', {
        source: 'api',
        assetId: selectedAssetId,
      })
    }
  }, [assetDetailLoadState, isApiAssetSource, selectedAssetId])

  const batchScope = useMemo(() => summarizeBatchScope(assets, batchIds), [assets, batchIds])
  const nextPendingAsset = useMemo(
    () => assets.find((asset) => asset.state === 'DECISION_PENDING') ?? null,
    [assets],
  )
  const selectedAssetState = selectedAsset?.state ?? null
  const mapBatchErrorToMessage = useCallback(
    (error: unknown) => mapApiErrorToMessage(error, t),
    [t],
  )
  const mapDecisionErrorToMessage = useCallback(
    (error: unknown) => {
      if (isStateConflictError(error)) {
        setShouldRefreshSelectedAsset(true)
      }
      return mapApiErrorToMessage(error, t)
    },
    [t],
  )
  const {
    previewingBatch,
    executingBatch,
    pendingBatchExecution,
    previewStatus,
    executeStatus,
    reportBatchId,
    reportLoading,
    reportStatus,
    reportData,
    reportExportStatus,
    batchTimeline,
    pendingBatchUndoSeconds,
    previewBatchMove,
    executeBatchMove,
    cancelPendingBatchExecution,
    refreshBatchReport,
    exportBatchReport,
  } = useBatchExecution({
    apiClient,
    batchIds,
    t,
    setRetryStatus,
    mapErrorToMessage: mapBatchErrorToMessage,
  })
  const locale = (i18n.resolvedLanguage ?? 'fr') as Locale
  const emptyAssetsMessage = useMemo(() => {
    if (!batchOnly) {
      if (filter !== 'ALL' || search.trim() !== '') {
        return t('assets.emptyFiltered')
      }
      return t('assets.empty')
    }
    if (batchIds.length === 0) {
      return t('assets.emptyBatchNone')
    }
    return t('assets.emptyBatch')
  }, [batchIds.length, batchOnly, filter, search, t])
  const selectionStatusLabel = selectedAssetId
    ? t('assets.selectionStatusOne', { id: selectedAssetId })
    : t('assets.selectionStatusNone')

  const {
    undoStack,
    activityLog,
    recordAction,
    clearActivityLog,
    undoLastAction,
  } = useReviewHistory({
    assets,
    selectedAssetId,
    batchIds,
    setAssets,
    setSelectedAssetId: applySelectedAssetId,
    setBatchIds,
    t,
  })

  const handleDecision = useCallback(
    (id: string, action: DecisionAction) => {
      const run = async () => {
        setDecisionStatus(null)
        const result = await applySingleReviewDecision({
          assets,
          targetId: id,
          action,
          isApiAssetSource,
          submitAssetDecision: (targetId, targetAction) =>
            apiClient.submitAssetDecision(targetId, { action: targetAction }, crypto.randomUUID()),
          mapErrorToMessage: mapDecisionErrorToMessage,
        })

        if (result.kind === 'noop') {
          return
        }
        if (result.kind === 'error') {
          setDecisionStatus({
            kind: 'error',
            message: t('detail.decisionError', {
              message: result.message,
            }),
          })
          return
        }

        recordAction(t('activity.actionDecision', { action, id }))
        setAssets(result.updatedAssets)
        setDecisionStatus({
          kind: 'success',
          message: t('detail.decisionSaved', { id, action }),
        })
      }

      void run()
    },
    [apiClient, assets, isApiAssetSource, mapDecisionErrorToMessage, recordAction, t],
  )

  const submitDecisionsForIds = useCallback(
    async (targetIds: string[], action: 'KEEP' | 'REJECT') => {
      return submitReviewDecisions({
        isApiAssetSource,
        targetIds,
        action,
        submitAssetDecision: (id, nextAction) =>
          apiClient.submitAssetDecision(id, { action: nextAction }, crypto.randomUUID()),
        mapErrorToMessage: mapDecisionErrorToMessage,
      })
    },
    [apiClient, isApiAssetSource, mapDecisionErrorToMessage],
  )

  const finalizeBulkDecision = useCallback(
    ({
      action,
      targetIds,
      successIds,
      firstErrorMessage,
      activityMessage,
      onSuccess,
    }: {
      action: 'KEEP' | 'REJECT'
      targetIds: string[]
      successIds: string[]
      firstErrorMessage: string | null
      activityMessage: string
      onSuccess?: () => void
    }) => {
      const result = finalizeBulkDecisionResult({
        action,
        targetIds,
        successIds,
        firstErrorMessage,
      })

      if (result.kind === 'none') {
        return
      }

      if (result.kind === 'error') {
        setDecisionStatus({
          kind: 'error',
          message: t('detail.decisionError', { message: result.errorMessage }),
        })
        return
      }

      recordAction(activityMessage)
      setAssets((current) => updateAssetsState(current, result.successIds, result.nextState))
      onSuccess?.()

      if (result.kind === 'partial') {
        setDecisionStatus({
          kind: 'error',
          message: t('detail.decisionPartial', {
            success: result.successCount,
            failed: result.failedCount,
            message: result.errorMessage,
          }),
        })
        return
      }

      setDecisionStatus({
        kind: 'success',
        message: t('detail.decisionBulkSaved', { action, count: result.successCount }),
      })
    },
    [recordAction, t],
  )

  const applyDecisionToVisible = useCallback(
    (action: 'KEEP' | 'REJECT') => {
      if (isApiAssetSource && !bulkDecisionsEnabled) {
        setDecisionStatus({
          kind: 'error',
          message: t('detail.bulkDisabledByPolicy'),
        })
        return
      }
      const targetIds = visibleAssets.map((asset) => asset.id)
      if (targetIds.length === 0) {
        return
      }

      const run = async () => {
        setDecisionStatus(null)
        const { successIds, firstErrorMessage } = await submitDecisionsForIds(targetIds, action)
        finalizeBulkDecision({
          action,
          targetIds,
          successIds,
          firstErrorMessage,
          activityMessage: t('activity.actionVisible', { action, count: successIds.length }),
        })
      }

      void run()
    },
    [bulkDecisionsEnabled, finalizeBulkDecision, isApiAssetSource, submitDecisionsForIds, t, visibleAssets],
  )

  const applyDecisionToBatch = useCallback(
    (action: 'KEEP' | 'REJECT') => {
      if (isApiAssetSource && !bulkDecisionsEnabled) {
        setDecisionStatus({
          kind: 'error',
          message: t('detail.bulkDisabledByPolicy'),
        })
        return
      }
      if (batchIds.length === 0) {
        return
      }

      const run = async () => {
        setDecisionStatus(null)
        const targetIds = [...batchIds]
        const { successIds, firstErrorMessage } = await submitDecisionsForIds(targetIds, action)
        finalizeBulkDecision({
          action,
          targetIds,
          successIds,
          firstErrorMessage,
          activityMessage: t('activity.actionBatch', { action, count: successIds.length }),
          onSuccess: () => {
            setBatchIds((current) => current.filter((id) => !successIds.includes(id)))
          },
        })
      }

      void run()
    },
    [batchIds, bulkDecisionsEnabled, finalizeBulkDecision, isApiAssetSource, submitDecisionsForIds, t],
  )

  const clearBatch = useCallback(() => {
    setBatchIds([])
  }, [])
  const applyDecisionToSelected = useCallback(
    (action: DecisionAction) => {
      if (!selectedAssetId) {
        return
      }
      handleDecision(selectedAssetId, action)
    },
    [selectedAssetId, handleDecision],
  )

  const focusPending = useCallback(() => {
    if (filter === 'DECISION_PENDING' && mediaTypeFilter === 'ALL' && dateFilter === 'ALL' && search === '') {
      return
    }
    recordAction(t('activity.filterPending'))
    setFilter('DECISION_PENDING')
    setMediaTypeFilter('ALL')
    setDateFilter('ALL')
    setSearch('')
  }, [dateFilter, filter, mediaTypeFilter, recordAction, search, t])

  const openNextPending = useCallback(() => {
    const target = assets.find((asset) => asset.state === 'DECISION_PENDING')
    if (!target) {
      return
    }
    if (filter !== 'ALL' || mediaTypeFilter !== 'ALL' || dateFilter !== 'ALL' || search !== '' || batchOnly) {
      recordAction(t('activity.openNextPending'))
      setFilter('ALL')
      setMediaTypeFilter('ALL')
      setDateFilter('ALL')
      setSearch('')
      setBatchOnly(false)
    }
    applySelectedAssetId(target.id)
  }, [applySelectedAssetId, assets, batchOnly, dateFilter, filter, mediaTypeFilter, recordAction, search, t])

  const {
    clearFilters,
    applySavedView,
    applyPresetPendingRecent,
    applyPresetImagesRejected,
    applyPresetMediaReview,
  } = useQuickFilters({
    filter,
    mediaTypeFilter,
    dateFilter,
    search,
    batchOnly,
    t,
    recordAction,
    setFilter,
    setMediaTypeFilter,
    setDateFilter,
    setSearch,
    setBatchOnly,
  })

  const mapPurgeErrorToMessage = useCallback(
    (error: unknown) => {
      if (isStateConflictError(error)) {
        setShouldRefreshSelectedAsset(true)
      }
      return mapApiErrorToMessage(error, t)
    },
    [t],
  )
  const mapMetadataErrorToMessage = useCallback(
    (error: unknown) => {
      if (isStateConflictError(error)) {
        setShouldRefreshSelectedAsset(true)
      }
      return mapApiErrorToMessage(error, t)
    },
    [t],
  )
  const {
    previewingPurge,
    executingPurge,
    purgePreviewAssetId,
    purgeStatus,
    setPurgePreviewAssetId,
    setPurgeStatus,
    previewSelectedAssetPurge,
    executeSelectedAssetPurge,
  } = usePurgeFlow({
    apiClient,
    selectedAsset,
    t,
    setRetryStatus,
    mapErrorToMessage: mapPurgeErrorToMessage,
    recordAction,
    onPurgeSuccess: (assetId) => {
      setAssets((current) => current.filter((asset) => asset.id !== assetId))
      setBatchIds((current) => current.filter((id) => id !== assetId))
      if (selectedAssetId === assetId) {
        applySelectedAssetId(null, 'replace')
      } else if (selectionAnchorId === assetId) {
        setSelectionAnchorId(null)
      }
    },
  })

  useEffect(() => {
    setMetadataStatus(null)
  }, [selectedAssetId])

  useEffect(() => {
    setDecisionStatus(null)
    setShouldRefreshSelectedAsset(false)
  }, [selectedAssetId])

  const saveSelectedAssetMetadata = useCallback(
    async (assetId: string, payload: { tags: string[]; notes: string }) => {
      setSavingMetadata(true)
      setMetadataStatus(null)
      try {
        const result = await saveReviewAssetMetadata({
          isApiAssetSource,
          assetId,
          payload,
          updateAssetMetadata: apiClient.updateAssetMetadata,
        })
        if (result.kind === 'error') {
          setMetadataStatus({
            kind: 'error',
            message: t('detail.taggingError', {
              message: mapMetadataErrorToMessage(result.error),
            }),
          })
          return
        }
        setAssets(result.apply)
        recordAction(t('activity.tagging', { id: assetId }))
        setMetadataStatus({
          kind: 'success',
          message: t('detail.taggingSaved', { id: assetId }),
        })
      } finally {
        setSavingMetadata(false)
      }
    },
    [apiClient.updateAssetMetadata, isApiAssetSource, mapMetadataErrorToMessage, recordAction, t],
  )

  const refreshSelectedAsset = useCallback(async () => {
    if (!isApiAssetSource || !selectedAssetId || refreshingSelectedAsset) {
      return
    }
    setRefreshingSelectedAsset(true)
    setRetryStatus(null)
    try {
      const result = await refreshReviewAsset({
        isApiAssetSource,
        selectedAssetId,
        getAssetDetail: apiClient.getAssetDetail,
      })
      if (result.kind === 'error') {
        setDecisionStatus({
          kind: 'error',
          message: t('detail.refreshError', {
            message: mapApiErrorToMessage(result.error, t),
          }),
        })
        return
      }
      if (result.kind === 'noop') {
        return
      }
      setAssets(result.apply)
      setPurgeStatus(null)
      setMetadataStatus(null)
      setDecisionStatus({
        kind: 'success',
        message: t('detail.refreshDone'),
      })
      setShouldRefreshSelectedAsset(false)
    } finally {
      setRefreshingSelectedAsset(false)
      setRetryStatus(null)
    }
  }, [
    apiClient.getAssetDetail,
    isApiAssetSource,
    refreshingSelectedAsset,
    selectedAssetId,
    setPurgeStatus,
    setRetryStatus,
    t,
  ])
  const setSelectedAssetIdFromSelectionFlow = useCallback(
    (value: string | null | ((current: string | null) => string | null)) => {
      if (typeof value === 'function') {
        setSelectedAssetId(value)
        return
      }
      applySelectedAssetId(value)
    },
    [applySelectedAssetId, setSelectedAssetId],
  )

  const {
    handleAssetClick,
    selectVisibleByOffset,
    toggleBatchForSelectedAsset,
    clearSelection,
    selectFirstVisibleAsset,
    selectLastVisibleAsset,
  } = useSelectionFlow({
    visibleAssets,
    selectedAssetId,
    selectionAnchorId,
    recordAction,
    t,
    setSelectedAssetId: setSelectedAssetIdFromSelectionFlow,
    setSelectionAnchorId,
    setBatchIds,
    setPurgePreviewAssetId,
    setPurgeStatus,
  })

  const toggleBatchOnly = useCallback(() => {
    recordAction(
      batchOnly ? t('activity.batchOnlyOff') : t('activity.batchOnlyOn'),
    )
    setBatchOnly((current) => !current)
  }, [batchOnly, recordAction, t])

  const selectAllVisibleInBatch = useCallback(() => {
    const missingCount = visibleAssets.filter((asset) => !batchIds.includes(asset.id)).length
    if (missingCount === 0) {
      return
    }
    recordAction(t('activity.batchVisible', { count: missingCount }))
    setBatchIds((current) => {
      const merged = new Set([...current, ...visibleAssets.map((asset) => asset.id)])
      return [...merged]
    })
  }, [batchIds, recordAction, t, visibleAssets])

  const availability = useMemo(
    () =>
      getActionAvailability({
        visibleCount: visibleAssets.length,
        batchCount: batchIds.length,
        previewingBatch,
        executingBatch,
        schedulingBatchExecution: !!pendingBatchExecution,
        reportBatchId,
        reportLoading,
        undoCount: undoStack.length,
        selectedAssetState: selectedAssetState as AssetState | null,
        previewingPurge,
        executingPurge,
        purgePreviewMatchesSelected:
          !!selectedAsset && purgePreviewAssetId === selectedAsset.id,
      }),
    [
      visibleAssets.length,
      batchIds.length,
      previewingBatch,
      executingBatch,
      pendingBatchExecution,
      reportBatchId,
      reportLoading,
      undoStack.length,
      selectedAsset,
      selectedAssetState,
      previewingPurge,
      executingPurge,
      purgePreviewAssetId,
    ],
  )
  const effectiveAvailability = useMemo(() => {
    if (!isApiAssetSource || bulkDecisionsEnabled) {
      return availability
    }
    return {
      ...availability,
      keepVisibleDisabled: true,
      rejectVisibleDisabled: true,
      keepBatchDisabled: true,
      rejectBatchDisabled: true,
    }
  }, [availability, bulkDecisionsEnabled, isApiAssetSource])

  const executeBatchMoveNow = useCallback(() => {
    void executeBatchMove()
  }, [executeBatchMove])

  const applyDecisionKeepToSelected = useCallback(() => {
    applyDecisionToSelected('KEEP')
  }, [applyDecisionToSelected])

  const applyDecisionRejectToSelected = useCallback(() => {
    applyDecisionToSelected('REJECT')
  }, [applyDecisionToSelected])

  const applyDecisionClearToSelected = useCallback(() => {
    applyDecisionToSelected('CLEAR')
  }, [applyDecisionToSelected])

  useReviewKeyboardShortcuts({
    selectedAssetId,
    visibleAssets,
    hasPendingBatchExecution: !!pendingBatchExecution,
    onSetSearch: setSearch,
    onSelectAllVisibleInBatch: selectAllVisibleInBatch,
    onUndoLastAction: undoLastAction,
    onExecuteBatchMoveNow: executeBatchMoveNow,
    onToggleBatchForSelectedAsset: toggleBatchForSelectedAsset,
    onClearSelection: clearSelection,
    onFocusPending: focusPending,
    onToggleBatchOnly: toggleBatchOnly,
    onOpenNextPending: openNextPending,
    onToggleDensityMode: toggleDensityMode,
    onSelectFirstVisible: selectFirstVisibleAsset,
    onSelectLastVisible: selectLastVisibleAsset,
    onRefreshBatchReport: refreshBatchReport,
    onClearActivityLog: clearActivityLog,
    onApplyPresetPendingRecent: applyPresetPendingRecent,
    onApplyPresetImagesRejected: applyPresetImagesRejected,
    onApplyPresetMediaReview: applyPresetMediaReview,
    onApplyDecisionKeep: applyDecisionKeepToSelected,
    onApplyDecisionReject: applyDecisionRejectToSelected,
    onApplyDecisionClear: applyDecisionClearToSelected,
    onToggleShortcutsHelp: toggleShortcutsHelp,
    onSelectVisibleByOffset: selectVisibleByOffset,
  })

  useEffect(() => {
    const activeElement = document.activeElement
    const focusTarget = resolveAssetListFocusTarget({
      region: assetListRegionRef.current,
      selectedAssetId,
      isActiveElementTypingContext: isTypingContext(activeElement),
    })
    if (!focusTarget || activeElement === focusTarget) {
      return
    }
    focusTarget.focus()
    if (typeof focusTarget.scrollIntoView === 'function') {
      focusTarget.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedAssetId, visibleAssets])

  return (
    <Container as="main" className="py-4">
      <AppHeader
        locale={locale}
        t={t}
        onChangeLanguage={(value) => {
          void i18n.changeLanguage(value)
        }}
      />
      <ReviewSummary
        total={assets.length}
        counts={counts}
        labels={{
          region: t('summary.region'),
          total: t('summary.total'),
          pending: t('summary.pending'),
          keep: t('summary.keep'),
          reject: t('summary.reject'),
        }}
      />
      <ReviewToolbar
        filter={filter}
        mediaTypeFilter={mediaTypeFilter}
        dateFilter={dateFilter}
        search={search}
        labels={{
          filter: t('toolbar.filter'),
          mediaType: t('toolbar.mediaType'),
          date: t('toolbar.date'),
          search: t('toolbar.search'),
          searchPlaceholder: t('toolbar.placeholder'),
          all: t('toolbar.all'),
          date7d: t('toolbar.date7d'),
          date30d: t('toolbar.date30d'),
        }}
        onFilterChange={setFilter}
        onMediaTypeFilterChange={setMediaTypeFilter}
        onDateFilterChange={setDateFilter}
        onSearchChange={setSearch}
      />
      <ReviewStatusAlerts
        t={t}
        isApiAssetSource={isApiAssetSource}
        assetsLoadState={assetsLoadState}
        policyLoadState={policyLoadState}
        bulkDecisionsEnabled={bulkDecisionsEnabled}
      />

      <ActionPanels
        t={t}
        batchOnly={batchOnly}
        densityMode={densityMode}
        availability={effectiveAvailability}
        batchIdsLength={batchIds.length}
        batchScope={batchScope}
        batchTimeline={batchTimeline}
        pendingBatchExecution={pendingBatchExecution}
        pendingBatchUndoSeconds={pendingBatchUndoSeconds}
        previewingBatch={previewingBatch}
        executingBatch={executingBatch}
        previewStatus={previewStatus}
        executeStatus={executeStatus}
        retryStatus={retryStatus}
        reportBatchId={reportBatchId}
        reportStatus={reportStatus}
        reportData={reportData}
        reportExportStatus={reportExportStatus}
        undoStackLength={undoStack.length}
        activityLog={activityLog}
        showShortcutsHelp={showShortcutsHelp}
        onApplySavedView={applySavedView}
        onApplyPresetPendingRecent={applyPresetPendingRecent}
        onApplyPresetImagesRejected={applyPresetImagesRejected}
        onApplyPresetMediaReview={applyPresetMediaReview}
        onFocusPending={focusPending}
        onToggleBatchOnly={toggleBatchOnly}
        onApplyDecisionToVisible={applyDecisionToVisible}
        onClearFilters={clearFilters}
        onToggleDensityMode={toggleDensityMode}
        onApplyDecisionToBatch={applyDecisionToBatch}
        onClearBatch={clearBatch}
        onPreviewBatchMove={previewBatchMove}
        onExecuteBatchMove={executeBatchMove}
        onCancelPendingBatchExecution={cancelPendingBatchExecution}
        onRefreshBatchReport={refreshBatchReport}
        onExportBatchReport={exportBatchReport}
        onUndoLastAction={undoLastAction}
        onClearActivityLog={clearActivityLog}
        onToggleShortcutsHelp={toggleShortcutsHelp}
        onOpenNextPending={openNextPending}
      />

      <NextPendingCard
        nextPendingAsset={nextPendingAsset}
        t={t}
        onOpenNextPending={openNextPending}
        onDecision={handleDecision}
      />

      <Row as="section" className="g-3 mt-1">
        <AssetListSection
          t={t}
          visibleAssets={visibleAssets}
          selectedAssetId={selectedAssetId}
          batchIds={batchIds}
          selectionStatusLabel={selectionStatusLabel}
          densityMode={densityMode}
          emptyAssetsMessage={emptyAssetsMessage}
          onDecision={handleDecision}
          onAssetClick={handleAssetClick}
          assetListRegionRef={assetListRegionRef}
        />

        <AssetDetailPanel
          selectedAsset={selectedAsset}
          availability={effectiveAvailability}
          previewingPurge={previewingPurge}
          executingPurge={executingPurge}
          purgeStatus={purgeStatus}
          decisionStatus={decisionStatus}
          savingMetadata={savingMetadata}
          metadataStatus={metadataStatus}
          t={t}
          onDecision={handleDecision}
          onSaveMetadata={saveSelectedAssetMetadata}
          onPreviewPurge={previewSelectedAssetPurge}
          onExecutePurge={executeSelectedAssetPurge}
          onRefreshAsset={refreshSelectedAsset}
          showRefreshAction={shouldRefreshSelectedAsset && isApiAssetSource}
          refreshingAsset={refreshingSelectedAsset}
        />
      </Row>
    </Container>
  )
}

export default ReviewPage
