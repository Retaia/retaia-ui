import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { mapApiSummaryToAsset } from '../api/assetMapper'
import { INITIAL_ASSETS } from '../data/mockAssets'
import { getActionAvailability } from '../domain/actionAvailability'
import {
  sortAssets,
  type Asset,
  type AssetDateFilter,
  type AssetMediaTypeFilter,
  type AssetSort,
} from '../domain/assets'
import { mergeAssetWithDetail } from '../domain/review/assetDetailMerge'
import { useDensityMode } from './useDensityMode'
import { useDisplayType } from './useDisplayType'
import { usePurgeFlow } from './usePurgeFlow'
import { useReviewApiRuntime } from './useReviewApiRuntime'
import { readRejectsFilterParams, writeRejectsFilterParams } from '../services/workspaceQueryParams'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { syncAssetMetadataThunk } from '../store/thunks/assetSyncThunks'
import { persistSelectedAssetId, readSelectedAssetId } from '../services/workspaceContextPersistence'
import { mapReviewApiErrorToMessage } from '../infrastructure/review/apiReviewErrorAdapter'
import { resolveSelectionStatusLabel } from '../application/review/reviewPagePresentation'
import { selectRejectsWorkspaceQueryModel } from '../store/selectors/workspaceSelectors'
import {
  hydrateRejectsWorkspace,
  setRejectsDateFilter,
  setRejectsMediaTypeFilter,
  setRejectsSearch,
  setRejectsSort,
} from '../store/slices/rejectsWorkspaceSlice'

const INITIAL_REJECTED_ASSETS = INITIAL_ASSETS.flatMap((asset) => {
  if (asset.state === 'REJECTED') {
    return [asset]
  }
  if (asset.state === 'DECIDED_REJECT') {
    return [{ ...asset, state: 'REJECTED' as const }]
  }
  return []
})

const DEFAULT_REJECTS_PAGE_SIZE = 50

export function useRejectsPageController() {
  const assetListRegionRef = useRef<HTMLElement | null>(null)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const rejectsWorkspace = useAppSelector(selectRejectsWorkspaceQueryModel)
  const { search, mediaTypeFilter, dateFilter, sort } = rejectsWorkspace
  const setSearch = useCallback((value: string) => {
    dispatch(setRejectsSearch(value))
  }, [dispatch])
  const setMediaTypeFilter = useCallback((value: AssetMediaTypeFilter) => {
    dispatch(setRejectsMediaTypeFilter(value))
  }, [dispatch])
  const setDateFilter = useCallback((value: AssetDateFilter) => {
    dispatch(setRejectsDateFilter(value))
  }, [dispatch])
  const setSort = useCallback((value: AssetSort) => {
    dispatch(setRejectsSort(value))
  }, [dispatch])
  const [assets, setAssets] = useState<Asset[]>(INITIAL_REJECTED_ASSETS)
  const [assetsLoadState, setAssetsLoadState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMoreAssets, setLoadingMoreAssets] = useState(false)
  const [assetDetailLoadState, setAssetDetailLoadState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [savingMetadata, setSavingMetadata] = useState(false)
  const [metadataStatus, setMetadataStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [transitionStatus, setTransitionStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [workspaceStatus, setWorkspaceStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [comparisonNow] = useState(() => Date.now())
  const [reopeningAsset, setReopeningAsset] = useState(false)
  const [reprocessingAsset, setReprocessingAsset] = useState(false)
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(() => readSelectedAssetId('rejects'))
  const { densityMode } = useDensityMode()
  const { displayType, setDisplayType } = useDisplayType('retaia_ui_rejects_asset_display_type')
  const { apiClient, isApiAssetSource, retryStatus, setRetryStatus } = useReviewApiRuntime()

  const resolvedDateRange = useMemo(() => {
    if (dateFilter === 'ALL') {
      return null
    }
    const now = new Date()
    const from = new Date(now)
    if (dateFilter === 'LAST_7_DAYS') {
      from.setDate(from.getDate() - 7)
    } else {
      from.setDate(from.getDate() - 30)
    }
    return {
      captured_at_from: from.toISOString(),
      captured_at_to: now.toISOString(),
    }
  }, [dateFilter])

  useEffect(() => {
    persistSelectedAssetId('rejects', selectedAssetId)
  }, [selectedAssetId])

  useEffect(() => {
    writeRejectsFilterParams({
      search,
      mediaTypeFilter,
      dateFilter,
      sort,
    }, 'replace')
  }, [dateFilter, mediaTypeFilter, search, sort])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const handlePopState = () => {
      const next = readRejectsFilterParams()
      dispatch(hydrateRejectsWorkspace({
        search: next.search ?? '',
        mediaTypeFilter: next.mediaTypeFilter ?? 'ALL',
        dateFilter: next.dateFilter ?? 'ALL',
        sort: next.sort ?? '-created_at',
      }))
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [dispatch])

  useEffect(() => {
    if (!isApiAssetSource) {
      return
    }

    let canceled = false
    const fetchAssets = async () => {
      setAssetsLoadState('loading')
      try {
        const response = await apiClient.listAssets({
          state: 'REJECTED',
          q: search.trim().length > 0 ? search.trim() : undefined,
          media_type:
            mediaTypeFilter === 'IMAGE'
              ? 'PHOTO'
              : mediaTypeFilter === 'ALL' || mediaTypeFilter === 'OTHER'
                ? undefined
                : mediaTypeFilter,
          ...(resolvedDateRange ?? {}),
          sort,
          limit: DEFAULT_REJECTS_PAGE_SIZE,
        })
        if (canceled) {
          return
        }
        const items = response.items ?? []
        setAssets(items.map((summary, index) => mapApiSummaryToAsset(summary, index)))
        setNextCursor(response.next_cursor ?? null)
        setAssetsLoadState('idle')
      } catch {
        if (canceled) {
          return
        }
        setAssetsLoadState('error')
        setNextCursor(null)
      }
    }

    void fetchAssets()
    return () => {
      canceled = true
    }
  }, [apiClient, dateFilter, isApiAssetSource, mediaTypeFilter, resolvedDateRange, search, sort])

  const loadMoreAssets = useCallback(async () => {
    if (!isApiAssetSource || !nextCursor || loadingMoreAssets) {
      return
    }
    setLoadingMoreAssets(true)
    try {
      const response = await apiClient.listAssets({
        state: 'REJECTED',
        q: search.trim().length > 0 ? search.trim() : undefined,
        media_type:
          mediaTypeFilter === 'IMAGE'
            ? 'PHOTO'
            : mediaTypeFilter === 'ALL' || mediaTypeFilter === 'OTHER'
              ? undefined
              : mediaTypeFilter,
        ...(resolvedDateRange ?? {}),
        sort,
        limit: DEFAULT_REJECTS_PAGE_SIZE,
        cursor: nextCursor,
      })
      const items = response.items ?? []
      setAssets((current) => {
        const offset = current.length
        const nextAssets = items.map((summary, index) => mapApiSummaryToAsset(summary, offset + index))
        return [...current, ...nextAssets]
      })
      setNextCursor(response.next_cursor ?? null)
    } finally {
      setLoadingMoreAssets(false)
    }
  }, [apiClient, isApiAssetSource, loadingMoreAssets, mediaTypeFilter, nextCursor, resolvedDateRange, search, sort])

  useEffect(() => {
    if (!isApiAssetSource || !selectedAssetId) {
      return
    }
    let canceled = false
    const fetchAssetDetail = async () => {
      setAssetDetailLoadState('loading')
      try {
        const detail = await apiClient.getAssetDetail(selectedAssetId)
        if (canceled) {
          return
        }
        setAssets((current) =>
          current.map((asset) =>
            asset.id === selectedAssetId ? mergeAssetWithDetail(asset, detail) : asset,
          ),
        )
        setAssetDetailLoadState('idle')
      } catch {
        if (canceled) {
          return
        }
        setAssetDetailLoadState('error')
      }
    }

    void fetchAssetDetail()
    return () => {
      canceled = true
    }
  }, [apiClient, isApiAssetSource, selectedAssetId])

  const visibleAssets = useMemo(() => {
    const rejectsOnly = assets.filter((asset) => asset.state === 'REJECTED')
    if (isApiAssetSource) {
      return rejectsOnly
    }
    const normalizedSearch = search.trim().toLowerCase()
    const dateThreshold = dateFilter === 'LAST_7_DAYS'
      ? comparisonNow - 7 * 24 * 60 * 60 * 1000
      : dateFilter === 'LAST_30_DAYS'
        ? comparisonNow - 30 * 24 * 60 * 60 * 1000
        : null
    const filtered = rejectsOnly.filter((asset) => {
      const tags = asset.tags ?? []
      const assetMediaType = asset.mediaType ?? 'OTHER'
      const capturedAtValue = asset.capturedAt ? Date.parse(asset.capturedAt) : Number.NaN
      const matchesSearch =
        normalizedSearch.length === 0 ||
        asset.name.toLowerCase().includes(normalizedSearch) ||
        asset.id.toLowerCase().includes(normalizedSearch) ||
        tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
      const matchesMediaType =
        mediaTypeFilter === 'ALL' || assetMediaType === mediaTypeFilter
      const matchesDate =
        dateThreshold === null ||
        (Number.isFinite(capturedAtValue) && capturedAtValue >= dateThreshold)
      return matchesSearch && matchesMediaType && matchesDate
    })
    return sortAssets(filtered, sort)
  }, [assets, comparisonNow, dateFilter, isApiAssetSource, mediaTypeFilter, search, sort])

  const visibleMediaTypeCounts = useMemo(
    () =>
      visibleAssets.reduce(
        (accumulator, asset) => {
          const assetMediaType = asset.mediaType ?? 'OTHER'
          accumulator[assetMediaType] += 1
          return accumulator
        },
        {
          VIDEO: 0,
          AUDIO: 0,
          IMAGE: 0,
          OTHER: 0,
        },
      ),
    [visibleAssets],
  )

  const olderThan30DaysCount = useMemo(() => {
    const threshold = comparisonNow - 30 * 24 * 60 * 60 * 1000
    return visibleAssets.reduce((count, asset) => {
      const capturedAtValue = asset.capturedAt ? Date.parse(asset.capturedAt) : Number.NaN
      if (Number.isFinite(capturedAtValue) && capturedAtValue < threshold) {
        return count + 1
      }
      return count
    }, 0)
  }, [comparisonNow, visibleAssets])

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
  )

  const removeAssetFromWorkspace = useCallback((assetId: string) => {
    setAssets((current) => current.filter((asset) => asset.id !== assetId))
    setSelectedAssetId((current) => (current === assetId ? null : current))
  }, [])

  const onPurgeSuccess = useCallback((assetId: string) => {
    removeAssetFromWorkspace(assetId)
    setWorkspaceStatus({
      kind: 'success',
      message: t('actions.purgeSuccess', { id: assetId }),
    })
  }, [removeAssetFromWorkspace, t])

  const mapErrorToMessage = useCallback(
    (error: unknown) => mapReviewApiErrorToMessage(error, t),
    [t],
  )

  const {
    previewingPurge,
    executingPurge,
    purgePreviewAssetId,
    purgeStatus,
    previewSelectedAssetPurge,
    executeSelectedAssetPurge,
  } = usePurgeFlow({
    apiClient,
    selectedAsset,
    t,
    setRetryStatus,
    mapErrorToMessage,
    recordAction: () => {},
    onPurgeSuccess,
  })

  const availability = useMemo(
    () =>
      getActionAvailability({
        visibleCount: visibleAssets.length,
        batchCount: 0,
        previewingBatch: false,
        executingBatch: false,
        schedulingBatchExecution: false,
        reportBatchId: null,
        reportLoading: false,
        undoCount: 0,
        selectedAssetState: selectedAsset?.state ?? null,
        previewingPurge,
        executingPurge,
        purgePreviewMatchesSelected: purgePreviewAssetId === selectedAsset?.id,
      }),
    [executingPurge, previewingPurge, purgePreviewAssetId, selectedAsset?.id, selectedAsset?.state, visibleAssets.length],
  )
  const selectedAssetRevisionEtag = selectedAsset?.revisionEtag ?? null

  const saveSelectedAssetMetadata = useCallback(
    async (assetId: string, payload: { tags: string[]; notes: string }) => {
      setSavingMetadata(true)
      setMetadataStatus(null)
      setTransitionStatus(null)
      setWorkspaceStatus(null)
      try {
        if (isApiAssetSource) {
          await dispatch(
            syncAssetMetadataThunk({
              assetId,
              tags: payload.tags,
              notes: payload.notes,
              revisionEtag: selectedAssetRevisionEtag,
            }),
          ).unwrap()
        }
        setAssets((current) =>
          current.map((asset) =>
            asset.id === assetId ? { ...asset, tags: payload.tags, notes: payload.notes } : asset,
          ),
        )
        setMetadataStatus({
          kind: 'success',
          message: t('detail.taggingSaved', { id: assetId }),
        })
      } catch (error) {
        setMetadataStatus({
          kind: 'error',
          message: t('detail.taggingError', {
            message: mapReviewApiErrorToMessage(error, t),
          }),
        })
      } finally {
        setSavingMetadata(false)
      }
    },
    [dispatch, isApiAssetSource, selectedAssetRevisionEtag, t],
  )

  const reopenSelectedAsset = useCallback(async () => {
    if (!selectedAsset || reopeningAsset || reprocessingAsset) {
      return
    }
    const targetAssetId = selectedAsset.id
    setReopeningAsset(true)
    setTransitionStatus(null)
    setWorkspaceStatus(null)
    try {
      if (isApiAssetSource) {
        await apiClient.reopenAsset(targetAssetId, selectedAsset.revisionEtag)
      }
      removeAssetFromWorkspace(targetAssetId)
      setTransitionStatus({
        kind: 'success',
        message: t('actions.reopenDone', { id: targetAssetId }),
      })
      setWorkspaceStatus({
        kind: 'success',
        message: t('actions.reopenDone', { id: targetAssetId }),
      })
    } catch (error) {
      setTransitionStatus({
        kind: 'error',
        message: t('actions.reopenError', {
          message: mapReviewApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setReopeningAsset(false)
    }
  }, [apiClient, isApiAssetSource, removeAssetFromWorkspace, reopeningAsset, reprocessingAsset, selectedAsset, t])

  const reprocessSelectedAsset = useCallback(async () => {
    if (!selectedAsset || reopeningAsset || reprocessingAsset) {
      return
    }
    const targetAssetId = selectedAsset.id
    setReprocessingAsset(true)
    setTransitionStatus(null)
    setWorkspaceStatus(null)
    try {
      if (isApiAssetSource) {
        await apiClient.reprocessAsset(
          targetAssetId,
          crypto.randomUUID(),
          selectedAsset.revisionEtag,
        )
      }
      removeAssetFromWorkspace(targetAssetId)
      setTransitionStatus({
        kind: 'success',
        message: t('actions.reprocessDone', { id: targetAssetId }),
      })
      setWorkspaceStatus({
        kind: 'success',
        message: t('actions.reprocessDone', { id: targetAssetId }),
      })
    } catch (error) {
      setTransitionStatus({
        kind: 'error',
        message: t('actions.reprocessError', {
          message: mapReviewApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setReprocessingAsset(false)
    }
  }, [apiClient, isApiAssetSource, removeAssetFromWorkspace, reopeningAsset, reprocessingAsset, selectedAsset, t])

  const selectionStatusLabel = useMemo(
    () => resolveSelectionStatusLabel({ selectedAssetId, t }),
    [selectedAssetId, t],
  )

  const clearSelection = useCallback(() => {
    setSelectedAssetId(null)
  }, [])

  return {
    t,
    search,
    setSearch,
    mediaTypeFilter,
    setMediaTypeFilter,
    dateFilter,
    setDateFilter,
    sort,
    setSort,
    visibleAssets,
    visibleMediaTypeCounts,
    olderThan30DaysCount,
    selectedAsset,
    selectedAssetId,
    densityMode,
    displayType,
    setDisplayType,
    assetListRegionRef,
    assetsLoadState,
    assetDetailLoadState,
    hasMoreAssets: isApiAssetSource && Boolean(nextCursor),
    loadingMoreAssets,
    loadMoreAssets,
    savingMetadata,
    metadataStatus,
    workspaceStatus,
    transitionStatus,
    reopeningAsset,
    reprocessingAsset,
    availability,
    previewingPurge,
    executingPurge,
    purgeStatus,
    retryStatus,
    emptyAssetsMessage:
      search.trim().length > 0 || mediaTypeFilter !== 'ALL' || dateFilter !== 'ALL'
        ? t('assets.emptyFiltered')
        : t('rejects.empty'),
    selectionStatusLabel,
    onAssetClick: (assetId: string) => {
      setSelectedAssetId(assetId)
    },
    onSaveMetadata: saveSelectedAssetMetadata,
    onReopenAsset: reopenSelectedAsset,
    onReprocessAsset: reprocessSelectedAsset,
    onPreviewPurge: previewSelectedAssetPurge,
    onExecutePurge: executeSelectedAssetPurge,
    onKeywordClick: (keyword: string) => {
      setSearch(keyword)
    },
    clearSelection,
  }
}
