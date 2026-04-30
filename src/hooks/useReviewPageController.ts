import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { INITIAL_ASSETS } from '../data/mockAssets'
import {
  type Asset,
  type AssetDateFilter,
  type AssetFilter,
  type AssetMediaTypeFilter,
  getStateFromDecision,
  type AssetSort,
  type AssetState,
  countAssetsByState,
  filterAssets,
  type ProcessingProfile,
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
import { useAssetListFocus } from '../hooks/useAssetListFocus'
import { useDisplayType } from '../hooks/useDisplayType'
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
import {
  syncAssetDecisionThunk,
  syncAssetMetadataThunk,
  syncAssetProcessingProfileThunk,
} from '../store/thunks/assetSyncThunks'
import { persistSelectedAssetId, readSelectedAssetId } from '../services/workspaceContextPersistence'

export type ReviewPageView = 'workspace' | 'batch' | 'reports' | 'activity'

type ReviewPageProps = {
  view?: ReviewPageView
}

function getDecisionActionLabel(t: TFunction, action: 'KEEP' | 'REJECT' | 'CLEAR'): string {
  if (action === 'KEEP') {
    return t('actions.decisionKeep')
  }
  if (action === 'REJECT') {
    return t('actions.decisionReject')
  }
  return t('actions.decisionClear')
}

function getProcessingProfileLabelKey(profile: ProcessingProfile) {
  if (profile === 'audio_music') {
    return 'detail.processingProfileAudioMusic'
  }
  if (profile === 'audio_voice') {
    return 'detail.processingProfileAudioVoice'
  }
  if (profile === 'audio_undefined') {
    return 'detail.processingProfileAudioUndefined'
  }
  if (profile === 'video_standard') {
    return 'detail.processingProfileVideoStandard'
  }
  return 'detail.processingProfilePhotoStandard'
}

function resolveDecisionEligibleIds(
  assets: Asset[],
  targetIds: string[],
  action: 'KEEP' | 'REJECT',
) {
  return targetIds.filter((id) => {
    const asset = assets.find((candidate) => candidate.id === id)
    if (!asset) {
      return false
    }
    return getStateFromDecision(action, asset.state) !== asset.state
  })
}

function resolveLocalProcessingProfileState(profile: ProcessingProfile): AssetState {
  if (profile === 'audio_voice') {
    return 'READY'
  }
  if (profile === 'audio_music') {
    return 'DECISION_PENDING'
  }
  return 'REVIEW_PENDING_PROFILE'
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
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(() => readSelectedAssetId('review'))
  const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null)
  const { densityMode, toggleDensityMode } = useDensityMode()
  const { displayType, setDisplayType } = useDisplayType('retaia_ui_review_asset_display_type')
  const [savingMetadata, setSavingMetadata] = useState(false)
  const [metadataStatus, setMetadataStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [decisionStatus, setDecisionStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [processingProfileStatus, setProcessingProfileStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [savingProcessingProfile, setSavingProcessingProfile] = useState(false)
  const [shouldRefreshSelectedAsset, setShouldRefreshSelectedAsset] = useState(false)
  const [refreshingSelectedAsset, setRefreshingSelectedAsset] = useState(false)
  const applySelectedAssetId = useCallback((nextAssetId: string | null) => {
    setMetadataStatus(null)
    setDecisionStatus(null)
    setProcessingProfileStatus(null)
    setShouldRefreshSelectedAsset(false)
    setSelectedAssetId(nextAssetId)
    setSelectionAnchorId(nextAssetId)
  }, [setDecisionStatus, setMetadataStatus, setProcessingProfileStatus, setSelectedAssetId, setSelectionAnchorId, setShouldRefreshSelectedAsset])
  const listQuery = useMemo<ListAssetsQuery>(() => {
    const now = new Date()
    const from = new Date(now)
    if (dateFilter === 'LAST_7_DAYS') {
      from.setDate(from.getDate() - 7)
    } else if (dateFilter === 'LAST_30_DAYS') {
      from.setDate(from.getDate() - 30)
    }
    return {
      state: filter === 'ALL' || filter === 'WORK_QUEUE' ? undefined : filter,
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
    policySummary,
    refreshingPolicy,
    refreshPolicy,
    assetDetailLoadState,
    hasMoreAssets,
    loadingMoreAssets,
    loadMoreAssets,
    refreshAssets,
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
    const baseAssets = sortAssets(
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
  }, [assets, batchIds, batchOnly, dateFilter, filter, mediaTypeFilter, search, sort])

  const counts = useMemo(() => countAssetsByState(assets), [assets])
  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
  )

  useEffect(() => {
    writeReviewFilterParams(
      {
        filter,
        mediaTypeFilter,
        dateFilter,
        sort,
        search,
      },
      'replace',
    )
  }, [dateFilter, filter, mediaTypeFilter, search, sort])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const handlePopState = () => {
      const next = readReviewFilterParams()
      dispatch(
        hydrateReviewWorkspace({
          filter: next.filter ?? 'WORK_QUEUE',
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
  const todoAssets = useMemo(
    () => assets.filter((asset) => asset.state === 'DECISION_PENDING'),
    [assets],
  )
  const doneAssets = useMemo(
    () => assets.filter((asset) => asset.state !== 'DECISION_PENDING'),
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
    [setShouldRefreshSelectedAsset, t],
  )
  const {
    previewingBatch,
    executingBatch,
    pendingBatchExecution,
    previewStatus,
    executeStatus,
    shouldRefreshAssetsAfterConflict,
    reportBatchId,
    reportLoading,
    reportStatus,
    reportData,
    lastSuccessfulReport,
    reportExportStatus,
    batchTimeline,
    pendingBatchUndoSeconds,
    previewBatchMove,
    executeBatchMove,
    cancelPendingBatchExecution,
    acknowledgeBatchRefreshRecommendation,
    refreshBatchReport,
    exportBatchReport,
  } = useBatchExecution({
    apiClient,
    assets,
    batchIds,
    isApiAssetSource,
    t,
    setRetryStatus,
    mapErrorToMessage: mapBatchErrorToMessage,
    isRefreshRecommendedError: isStateConflictApiError,
    onBatchExecutionApplied: (successIds, nextStatesById) => {
      setAssets((current) =>
        current.map((asset) => {
          const nextState = nextStatesById[asset.id]
          return nextState ? { ...asset, state: nextState } : asset
        }),
      )
      setBatchIds((current) => current.filter((id) => !successIds.includes(id)))
      recordAction(t('activity.applyDecisions', { count: successIds.length }))
    },
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
            const targetAsset = assets.find((asset) => asset.id === targetId)
            await dispatch(
              syncAssetDecisionThunk({
                assetId: targetId,
                action: targetAction,
                revisionEtag: targetAsset?.revisionEtag,
              }),
            )
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

        const actionLabel = getDecisionActionLabel(t, action)
        recordAction(t('activity.actionDecision', { action: actionLabel, id }), { assetId: id })
        setAssets(result.updatedAssets)
        setDecisionStatus({
          kind: 'success',
          message: t('detail.decisionSaved', { id, action: actionLabel }),
        })
      }

      void run()
    },
    [assets, dispatch, isApiAssetSource, mapDecisionErrorToMessage, recordAction, setDecisionStatus, t],
  )

  const submitDecisionsForIds = useCallback(
    async (targetIds: string[], action: 'KEEP' | 'REJECT') => {
      const eligibleTargetIds = resolveDecisionEligibleIds(assets, targetIds, action)
      return submitReviewDecisions({
        isApiAssetSource,
        targetIds: eligibleTargetIds,
        action,
        submitAssetDecision: (id, nextAction) =>
          dispatch(
            syncAssetDecisionThunk({
              assetId: id,
              action: nextAction,
              revisionEtag: assets.find((asset) => asset.id === id)?.revisionEtag,
            }),
          )
            .unwrap()
            .then(() => undefined),
        mapErrorToMessage: mapDecisionErrorToMessage,
      })
    },
    [assets, dispatch, isApiAssetSource, mapDecisionErrorToMessage],
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

      const actionLabel = getDecisionActionLabel(t, action)
      setDecisionStatus({
        kind: 'success',
        message: t('detail.decisionBulkSaved', { action: actionLabel, count: result.successCount }),
      })
    },
    [recordAction, setDecisionStatus, t],
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
      const eligibleTargetIds = resolveDecisionEligibleIds(assets, targetIds, action)
      if (eligibleTargetIds.length === 0) {
        setDecisionStatus({
          kind: 'error',
          message: t('detail.decisionBlockedByProfile'),
        })
        return
      }

      const run = async () => {
        setDecisionStatus(null)
        const { successIds, firstErrorMessage } = await submitDecisionsForIds(eligibleTargetIds, action)
        finalizeBulkDecision({
          action,
          targetIds: eligibleTargetIds,
          successIds,
          firstErrorMessage,
          activityMessage: t('activity.actionVisible', {
            action: getDecisionActionLabel(t, action),
            count: successIds.length,
          }),
        })
      }

      void run()
    },
    [assets, bulkDecisionsEnabled, finalizeBulkDecision, isApiAssetSource, setDecisionStatus, submitDecisionsForIds, t, visibleAssets],
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
      const eligibleTargetIds = resolveDecisionEligibleIds(assets, batchIds, action)
      if (eligibleTargetIds.length === 0) {
        setDecisionStatus({
          kind: 'error',
          message: t('detail.decisionBlockedByProfile'),
        })
        return
      }

      const run = async () => {
        setDecisionStatus(null)
        const targetIds = [...eligibleTargetIds]
        const { successIds, firstErrorMessage } = await submitDecisionsForIds(targetIds, action)
        finalizeBulkDecision({
          action,
          targetIds,
          successIds,
          firstErrorMessage,
          activityMessage: t('activity.actionBatch', {
            action: getDecisionActionLabel(t, action),
            count: successIds.length,
          }),
        })
      }

      void run()
    },
    [assets, batchIds, bulkDecisionsEnabled, finalizeBulkDecision, isApiAssetSource, setDecisionStatus, submitDecisionsForIds, t],
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
    if (
      filter !== 'WORK_QUEUE' ||
      mediaTypeFilter !== 'ALL' ||
      dateFilter !== 'ALL' ||
      search !== '' ||
      batchOnly
    ) {
      recordAction(t('activity.openNextPending'))
      setFilter('WORK_QUEUE')
      setMediaTypeFilter('ALL')
      setDateFilter('ALL')
      setSearch('')
      setBatchOnly(false)
    }
    applySelectedAssetId(target.id)
  }, [applySelectedAssetId, assets, batchOnly, dateFilter, filter, mediaTypeFilter, recordAction, search, setBatchOnly, setDateFilter, setFilter, setMediaTypeFilter, setSearch, t])
  const openAsset = useCallback((assetId: string) => {
    if (batchOnly) {
      setBatchOnly(false)
    }
    applySelectedAssetId(assetId)
  }, [applySelectedAssetId, batchOnly, setBatchOnly])

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

  const applySavedViewWithBatchGuard = useCallback(
    (targetView: 'DEFAULT' | 'PENDING' | 'BATCH') => {
      if (targetView === 'BATCH' && batchIds.length === 0) {
        return
      }
      applySavedView(targetView)
    },
    [applySavedView, batchIds.length],
  )

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
    [setShouldRefreshSelectedAsset, t],
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
    persistSelectedAssetId('review', selectedAssetId)
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
                revisionEtag: assets.find((asset) => asset.id === targetAssetId)?.revisionEtag,
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
        recordAction(t('activity.tagging', { id: assetId }), { assetId })
        setMetadataStatus({
          kind: 'success',
          message: t('detail.taggingSaved', { id: assetId }),
        })
      } finally {
        setSavingMetadata(false)
      }
    },
    [assets, dispatch, isApiAssetSource, mapStateConflictAwareErrorToMessage, recordAction, t],
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

  const chooseSelectedAssetProcessingProfile = useCallback(
    async (processingProfile: ProcessingProfile) => {
      if (!selectedAsset) {
        return
      }

      const processingProfileLabel = t(getProcessingProfileLabelKey(processingProfile))
      setSavingProcessingProfile(true)
      setProcessingProfileStatus(null)
      try {
        if (isApiAssetSource) {
          await dispatch(
            syncAssetProcessingProfileThunk({
              assetId: selectedAsset.id,
              processingProfile,
              revisionEtag: selectedAsset.revisionEtag,
            }),
          )
            .unwrap()
            .then(() => undefined)
        }

        const optimisticState = resolveLocalProcessingProfileState(processingProfile)
        setAssets((current) =>
          current.map((asset) =>
            asset.id === selectedAsset.id
              ? {
                  ...asset,
                  processingProfile,
                  state: optimisticState,
                }
              : asset,
          ),
        )

        if (isApiAssetSource) {
          const refreshed = await refreshReviewAsset({
            isApiAssetSource,
            selectedAssetId: selectedAsset.id,
            getAssetDetail: apiClient.getAssetDetail,
          })
          if (refreshed.kind === 'success') {
            setAssets(refreshed.apply)
          }
        }

        recordAction(t('activity.processingProfile', {
          id: selectedAsset.id,
          profile: processingProfileLabel,
        }), { assetId: selectedAsset.id })
        setProcessingProfileStatus({
          kind: 'success',
          message: t('detail.processingProfileSaved', { profile: processingProfileLabel }),
        })
      } catch (error) {
        setProcessingProfileStatus({
          kind: 'error',
          message: t('detail.processingProfileError', {
            message: mapStateConflictAwareErrorToMessage(error),
          }),
        })
      } finally {
        setSavingProcessingProfile(false)
      }
    },
    [apiClient.getAssetDetail, dispatch, isApiAssetSource, mapStateConflictAwareErrorToMessage, recordAction, selectedAsset, t],
  )
  const setSelectedAssetIdFromSelectionFlow = useCallback(
    (value: string | null | ((current: string | null) => string | null)) => {
      if (typeof value === 'function') {
        setSelectedAssetId((current) => {
          const nextValue = value(current)
          if (nextValue !== current) {
            setMetadataStatus(null)
            setDecisionStatus(null)
            setShouldRefreshSelectedAsset(false)
          }
          return nextValue
        })
        return
      }
      applySelectedAssetId(value)
    },
    [applySelectedAssetId, setDecisionStatus, setMetadataStatus, setSelectedAssetId, setShouldRefreshSelectedAsset],
  )

  const {
    handleAssetClick,
    selectVisibleByOffset,
    toggleBatchForSelectedAsset,
    setBatchAssetSelected,
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
    if (batchIds.length === 0) {
      return
    }
    recordAction(
      batchOnly ? t('activity.batchOnlyOff') : t('activity.batchOnlyOn'),
    )
    setBatchOnly(!batchOnly)
  }, [batchIds.length, batchOnly, recordAction, setBatchOnly, t])

  useEffect(() => {
    if (batchOnly && batchIds.length === 0) {
      setBatchOnly(false)
    }
  }, [batchIds.length, batchOnly, setBatchOnly])

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
  const refreshAssetsAfterBatchConflict = useCallback(async () => {
    const didRefresh = await refreshAssets()
    if (didRefresh) {
      acknowledgeBatchRefreshRecommendation()
    }
  }, [acknowledgeBatchRefreshRecommendation, refreshAssets])

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
    policySummary,
    refreshingPolicy,
    refreshPolicy,
    batchOnly,
    densityMode,
    displayType,
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
    shouldRefreshAssetsAfterConflict,
    retryStatus,
    reportBatchId,
    reportStatus,
    reportData,
    lastSuccessfulReportBatchId: lastSuccessfulReport?.batchId ?? null,
    lastSuccessfulReportData: lastSuccessfulReport?.report ?? null,
    reportExportStatus,
    undoStack,
    activityLog,
    todoAssets,
    doneAssets,
    applySavedView: applySavedViewWithBatchGuard,
    applyPresetPendingRecent,
    applyPresetImagesRejected,
    applyPresetMediaReview,
    focusPending,
    toggleBatchOnly,
    applyDecisionToVisible,
    clearFilters,
    toggleDensityMode,
    setDisplayType,
    applyDecisionToBatch,
    clearBatch,
    previewBatchMove,
    executeBatchMove,
    cancelPendingBatchExecution,
    refreshAssetsAfterBatchConflict,
    refreshBatchReport,
    exportBatchReport,
    undoLastAction,
    clearActivityLog,
    openNextPending,
    openAsset,
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
    processingProfileStatus,
    savingProcessingProfile,
    savingMetadata,
    metadataStatus,
    shouldRefreshSelectedAsset,
    refreshingSelectedAsset,
    assetListRegionRef,
    handleAssetClick,
    clearSelection,
    setBatchAssetSelected,
    chooseSelectedAssetProcessingProfile,
    saveSelectedAssetMetadata,
    previewSelectedAssetPurge,
    executeSelectedAssetPurge,
    refreshSelectedAsset,
  } as const
}
