import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { INITIAL_ASSETS } from '../data/mockAssets'
import {
  type Asset,
  type AssetDateFilter,
  type AssetFilter,
  type AssetMediaTypeFilter,
  type AssetSort,
  type AssetState,
  countAssetsByState,
  filterAssets,
  sortAssets,
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
import { useSelectionFlow } from '../hooks/useSelectionFlow'
import { type Locale } from '../i18n/resources'
import { applySingleReviewDecision } from '../application/review/applySingleReviewDecision'
import { summarizeBatchScope } from '../application/review/batchScopeSummary'
import { finalizeBulkDecisionResult } from '../application/review/bulkDecisionFinalization'
import { resolveReviewApiError } from '../application/review/errorResolution'
import { submitReviewDecisions } from '../application/review/submitReviewDecisions'
import {
  refreshReviewAsset,
  saveReviewAssetMetadata,
} from '../application/review/reviewAssetMaintenance'
import { useShortcutsHelpState } from '../hooks/useShortcutsHelpState'
import { useAssetListFocus } from '../hooks/useAssetListFocus'
import {
  isStateConflictApiError,
  mapReviewApiErrorToMessage,
} from '../infrastructure/review/apiReviewErrorAdapter'
import { reportUiIssue } from '../ui/telemetry'
import {
  resolveEffectiveAvailability,
  resolveEmptyAssetsMessage,
  resolveSelectionStatusLabel,
} from '../application/review/reviewPagePresentation'
import type { ListAssetsQuery } from '../api/contracts'
import {
  hydrateReviewWorkspace,
  setReviewBatchIds,
  setReviewBatchOnly,
  setReviewDateFilter,
  setReviewFilter,
  setReviewMediaTypeFilter,
  setReviewSearch,
  setReviewSort,
} from '../store/slices/reviewWorkspaceSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { readReviewFilterParams, writeReviewFilterParams } from '../services/workspaceQueryParams'
import { selectReviewWorkspaceQueryModel } from '../store/selectors/workspaceSelectors'
import { syncAssetDecisionThunk, syncAssetMetadataThunk } from '../store/thunks/assetSyncThunks'

export type ReviewPageView = 'workspace' | 'batch' | 'reports' | 'activity'

type ReviewPageProps = {
  view?: ReviewPageView
}

export function useReviewPageController({ view = 'workspace' }: ReviewPageProps = {}) {
  const assetListRegionRef = useRef<HTMLElement | null>(null)
  const { t, i18n } = useTranslation()
  const { apiClient, apiRuntimeKey, isApiAssetSource, retryStatus, setRetryStatus } = useReviewApiRuntime()
  const dispatch = useAppDispatch()
  const reviewWorkspace = useAppSelector(selectReviewWorkspaceQueryModel)
  const {
    filter,
    mediaTypeFilter,
    dateFilter,
    sort,
    search,
    batchOnly,
    batchIds,
  } = reviewWorkspace
  const setFilter = useCallback((value: AssetFilter) => {
    dispatch(setReviewFilter(value))
  }, [dispatch])
  const setMediaTypeFilter = useCallback((value: AssetMediaTypeFilter) => {
    dispatch(setReviewMediaTypeFilter(value))
  }, [dispatch])
  const setDateFilter = useCallback((value: AssetDateFilter) => {
    dispatch(setReviewDateFilter(value))
  }, [dispatch])
  const setSort = useCallback((value: AssetSort) => {
    dispatch(setReviewSort(value))
  }, [dispatch])
  const setSearch = useCallback((value: string) => {
    dispatch(setReviewSearch(value))
  }, [dispatch])
  const setBatchOnly = useCallback((value: boolean) => {
    dispatch(setReviewBatchOnly(value))
  }, [dispatch])
  const setBatchIds = useCallback((value: string[] | ((current: string[]) => string[])) => {
    const nextValue = typeof value === 'function' ? value(batchIds) : value
    dispatch(setReviewBatchIds(nextValue))
  }, [batchIds, dispatch])
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS)
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null)
  const applySelectedAssetId = useCallback((nextAssetId: string | null) => {
    setSelectedAssetId(nextAssetId)
    setSelectionAnchorId(nextAssetId)
  }, [])
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
  const listQuery = useMemo<ListAssetsQuery>(() => {
    const now = new Date()
    const from = new Date(now)
    if (dateFilter === 'LAST_7_DAYS') {
      from.setDate(from.getDate() - 7)
    } else if (dateFilter === 'LAST_30_DAYS') {
      from.setDate(from.getDate() - 30)
    }
    return {
      state: filter === 'ALL' ? undefined : filter,
      media_type:
        mediaTypeFilter === 'IMAGE'
          ? 'PHOTO'
          : mediaTypeFilter === 'ALL' || mediaTypeFilter === 'OTHER'
            ? undefined
            : mediaTypeFilter,
      q: search.trim().length > 0 ? search.trim() : undefined,
      sort,
      captured_at_from: dateFilter === 'ALL' ? undefined : from.toISOString(),
      captured_at_to: dateFilter === 'ALL' ? undefined : now.toISOString(),
    }
  }, [dateFilter, filter, mediaTypeFilter, search, sort])

  const {
    assetsLoadState,
    policyLoadState,
    bulkDecisionsEnabled,
    assetDetailLoadState,
    hasMoreAssets,
    loadingMoreAssets,
    loadMoreAssets,
  } =
    useReviewDataController({
      apiClient,
      apiRuntimeKey,
      isApiAssetSource,
      selectedAssetId,
      listQuery,
      setAssets,
    })
  const visibleAssets = useMemo(() => {
    const baseAssets = isApiAssetSource
      ? assets
      : sortAssets(
          filterAssets(assets, filter, search, {
            mediaType: mediaTypeFilter,
            date: dateFilter,
          }),
          sort,
        )
    if (!batchOnly) {
      return baseAssets
    }
    const batchIdSet = new Set(batchIds)
    return baseAssets.filter((asset) => batchIdSet.has(asset.id))
  }, [assets, batchIds, batchOnly, dateFilter, filter, isApiAssetSource, mediaTypeFilter, search, sort])

  const counts = useMemo(() => countAssetsByState(assets), [assets])
  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
  )

  useEffect(() => {
    writeReviewFilterParams({
      filter,
      mediaTypeFilter,
      dateFilter,
      sort,
      search,
    })
  }, [dateFilter, filter, mediaTypeFilter, search, sort])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const handlePopState = () => {
      const next = readReviewFilterParams()
      dispatch(
        hydrateReviewWorkspace({
          filter: next.filter ?? 'ALL',
          mediaTypeFilter: next.mediaTypeFilter ?? 'ALL',
          dateFilter: next.dateFilter ?? 'ALL',
          sort: next.sort ?? '-created_at',
          search: next.search ?? '',
        }),
      )
    }
    handlePopState()
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [dispatch])

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
    (error: unknown) =>
      resolveReviewApiError(error, {
        mapErrorToMessage: (value) => mapReviewApiErrorToMessage(value, t),
        isStateConflictError: isStateConflictApiError,
        flagStateConflictForRefresh: false,
      }).message,
    [t],
  )
  const mapDecisionErrorToMessage = useCallback(
    (error: unknown) => {
      const result = resolveReviewApiError(error, {
        mapErrorToMessage: (value) => mapReviewApiErrorToMessage(value, t),
        isStateConflictError: isStateConflictApiError,
      })
      if (result.shouldRefreshSelectedAsset) {
        setShouldRefreshSelectedAsset(true)
      }
      return result.message
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
  const emptyAssetsMessage = useMemo(
    () =>
      resolveEmptyAssetsMessage({
        batchOnly,
        filter,
        search,
        batchIdsLength: batchIds.length,
        t,
      }),
    [batchIds.length, batchOnly, filter, search, t],
  )
  const selectionStatusLabel = useMemo(
    () => resolveSelectionStatusLabel({ selectedAssetId, t }),
    [selectedAssetId, t],
  )

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
          submitAssetDecision: async (targetId, targetAction) => {
            if (targetAction !== 'KEEP' && targetAction !== 'REJECT') {
              return
            }
            await dispatch(syncAssetDecisionThunk({ assetId: targetId, action: targetAction }))
              .unwrap()
              .then(() => undefined)
          },
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
    [assets, dispatch, isApiAssetSource, mapDecisionErrorToMessage, recordAction, t],
  )

  const submitDecisionsForIds = useCallback(
    async (targetIds: string[], action: 'KEEP' | 'REJECT') => {
      return submitReviewDecisions({
        isApiAssetSource,
        targetIds,
        action,
        submitAssetDecision: (id, nextAction) =>
          dispatch(syncAssetDecisionThunk({ assetId: id, action: nextAction }))
            .unwrap()
            .then(() => undefined),
        mapErrorToMessage: mapDecisionErrorToMessage,
      })
    },
    [dispatch, isApiAssetSource, mapDecisionErrorToMessage],
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
            setBatchIds(batchIds.filter((id) => !successIds.includes(id)))
          },
        })
      }

      void run()
    },
    [batchIds, bulkDecisionsEnabled, finalizeBulkDecision, isApiAssetSource, setBatchIds, submitDecisionsForIds, t],
  )

  const clearBatch = useCallback(() => {
    setBatchIds([])
  }, [setBatchIds])
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
  }, [dateFilter, filter, mediaTypeFilter, recordAction, search, setDateFilter, setFilter, setMediaTypeFilter, setSearch, t])

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
  }, [applySelectedAssetId, assets, batchOnly, dateFilter, filter, mediaTypeFilter, recordAction, search, setBatchOnly, setDateFilter, setFilter, setMediaTypeFilter, setSearch, t])

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

  const mapStateConflictAwareErrorToMessage = useCallback(
    (error: unknown) => {
      const result = resolveReviewApiError(error, {
        mapErrorToMessage: (value) => mapReviewApiErrorToMessage(value, t),
        isStateConflictError: isStateConflictApiError,
      })
      if (result.shouldRefreshSelectedAsset) {
        setShouldRefreshSelectedAsset(true)
      }
      return result.message
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
    mapErrorToMessage: mapStateConflictAwareErrorToMessage,
    recordAction,
    onPurgeSuccess: (assetId) => {
      setAssets((current) => current.filter((asset) => asset.id !== assetId))
      setBatchIds(batchIds.filter((id) => id !== assetId))
      if (selectedAssetId === assetId) {
        applySelectedAssetId(null)
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
          updateAssetMetadata: (targetAssetId, targetPayload) =>
            dispatch(
              syncAssetMetadataThunk({
                assetId: targetAssetId,
                tags: targetPayload.tags ?? [],
                notes: targetPayload.notes ?? '',
              }),
            )
              .unwrap()
              .then(() => undefined),
        })
        if (result.kind === 'error') {
          setMetadataStatus({
            kind: 'error',
            message: t('detail.taggingError', {
              message: mapStateConflictAwareErrorToMessage(result.error),
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
    [dispatch, isApiAssetSource, mapStateConflictAwareErrorToMessage, recordAction, t],
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
        const resolved = resolveReviewApiError(result.error, {
          mapErrorToMessage: (value) => mapReviewApiErrorToMessage(value, t),
          isStateConflictError: isStateConflictApiError,
          flagStateConflictForRefresh: false,
        })
        setDecisionStatus({
          kind: 'error',
          message: t('detail.refreshError', {
            message: resolved.message,
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
    setBatchOnly(!batchOnly)
  }, [batchOnly, recordAction, setBatchOnly, t])

  const selectAllVisibleInBatch = useCallback(() => {
    const missingCount = visibleAssets.filter((asset) => !batchIds.includes(asset.id)).length
    if (missingCount === 0) {
      return
    }
    recordAction(t('activity.batchVisible', { count: missingCount }))
    const merged = new Set([...batchIds, ...visibleAssets.map((asset) => asset.id)])
    setBatchIds([...merged])
  }, [batchIds, recordAction, setBatchIds, t, visibleAssets])

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
  const effectiveAvailability = useMemo(
    () =>
      resolveEffectiveAvailability({
        availability,
        isApiAssetSource,
        bulkDecisionsEnabled,
      }),
    [availability, bulkDecisionsEnabled, isApiAssetSource],
  )

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

  useAssetListFocus({
    assetListRegionRef,
    selectedAssetId,
    visibleAssets,
  })

  const isWorkspaceView = view === 'workspace'
  const isBatchView = view === 'batch'
  const isReportsView = view === 'reports'
  const isActivityView = view === 'activity'

  const onChangeLanguage = useCallback(
    (value: Locale) => {
      void i18n.changeLanguage(value)
    },
    [i18n],
  )
  const onKeywordClick = useCallback((keyword: string) => {
    setSearch(keyword)
  }, [setSearch])

  return {
    t,
    locale,
    onChangeLanguage,
    view,
    isWorkspaceView,
    isBatchView,
    isReportsView,
    isActivityView,
    assets,
    counts,
    filter,
    mediaTypeFilter,
    dateFilter,
    sort,
    search,
    setFilter,
    setMediaTypeFilter,
    setDateFilter,
    setSort,
    setSearch,
    onKeywordClick,
    isApiAssetSource,
    assetsLoadState,
    hasMoreAssets,
    loadingMoreAssets,
    loadMoreAssets,
    policyLoadState,
    bulkDecisionsEnabled,
    batchOnly,
    densityMode,
    effectiveAvailability,
    batchIds,
    batchScope,
    batchTimeline,
    pendingBatchExecution,
    pendingBatchUndoSeconds,
    previewingBatch,
    executingBatch,
    previewStatus,
    executeStatus,
    retryStatus,
    reportBatchId,
    reportStatus,
    reportData,
    reportExportStatus,
    undoStack,
    activityLog,
    showShortcutsHelp,
    nextPendingAsset,
    applySavedView,
    applyPresetPendingRecent,
    applyPresetImagesRejected,
    applyPresetMediaReview,
    focusPending,
    toggleBatchOnly,
    applyDecisionToVisible,
    clearFilters,
    toggleDensityMode,
    applyDecisionToBatch,
    clearBatch,
    previewBatchMove,
    executeBatchMove,
    cancelPendingBatchExecution,
    refreshBatchReport,
    exportBatchReport,
    undoLastAction,
    clearActivityLog,
    toggleShortcutsHelp,
    openNextPending,
    handleDecision,
    visibleAssets,
    selectedAssetId,
    selectionStatusLabel,
    emptyAssetsMessage,
    selectedAsset,
    previewingPurge,
    executingPurge,
    purgeStatus,
    decisionStatus,
    savingMetadata,
    metadataStatus,
    shouldRefreshSelectedAsset,
    refreshingSelectedAsset,
    assetListRegionRef,
    handleAssetClick,
    saveSelectedAssetMetadata,
    previewSelectedAssetPurge,
    executeSelectedAssetPurge,
    refreshSelectedAsset,
  } as const
}
