import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { mapApiSummaryToAsset } from '../api/assetMapper'
import { INITIAL_ASSETS } from '../data/mockAssets'
import { getActionAvailability } from '../domain/actionAvailability'
import { sortAssets, type Asset, type AssetSort } from '../domain/assets'
import { mergeAssetWithDetail } from '../domain/review/assetDetailMerge'
import { useDensityMode } from './useDensityMode'
import { useDisplayType } from './useDisplayType'
import { usePurgeFlow } from './usePurgeFlow'
import { useReviewApiRuntime } from './useReviewApiRuntime'
import { readRejectsFilterParams, writeRejectsFilterParams } from '../services/workspaceQueryParams'
import { useAppDispatch } from '../store/hooks'
import { syncAssetMetadataThunk } from '../store/thunks/assetSyncThunks'
import { persistSelectedAssetId, readSelectedAssetId } from '../services/workspaceContextPersistence'
import { mapReviewApiErrorToMessage } from '../infrastructure/review/apiReviewErrorAdapter'
import { resolveSelectionStatusLabel } from '../application/review/reviewPagePresentation'

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
  const initialQuery = useMemo(() => readRejectsFilterParams(), [])
  const [search, setSearch] = useState(initialQuery.search ?? '')
  const [sort, setSort] = useState<AssetSort>(initialQuery.sort ?? '-created_at')
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
  const [reopeningAsset, setReopeningAsset] = useState(false)
  const [reprocessingAsset, setReprocessingAsset] = useState(false)
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(() => readSelectedAssetId('rejects'))
  const { densityMode } = useDensityMode()
  const { displayType, setDisplayType } = useDisplayType('retaia_ui_rejects_asset_display_type')
  const { apiClient, isApiAssetSource, retryStatus, setRetryStatus } = useReviewApiRuntime()

  useEffect(() => {
    persistSelectedAssetId('rejects', selectedAssetId)
  }, [selectedAssetId])

  useEffect(() => {
    writeRejectsFilterParams(search, sort, 'replace')
  }, [search, sort])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const handlePopState = () => {
      const next = readRejectsFilterParams()
      setSearch(next.search ?? '')
      setSort(next.sort ?? '-created_at')
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

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
  }, [apiClient, isApiAssetSource, search, sort])

  const loadMoreAssets = useCallback(async () => {
    if (!isApiAssetSource || !nextCursor || loadingMoreAssets) {
      return
    }
    setLoadingMoreAssets(true)
    try {
      const response = await apiClient.listAssets({
        state: 'REJECTED',
        q: search.trim().length > 0 ? search.trim() : undefined,
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
  }, [apiClient, isApiAssetSource, loadingMoreAssets, nextCursor, search, sort])

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
    const filtered = normalizedSearch.length === 0
      ? rejectsOnly
      : rejectsOnly.filter((asset) => {
        const tags = asset.tags ?? []
        return (
          asset.name.toLowerCase().includes(normalizedSearch) ||
          asset.id.toLowerCase().includes(normalizedSearch) ||
          tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
        )
      })
    return sortAssets(filtered, sort)
  }, [assets, isApiAssetSource, search, sort])

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
  )

  const onPurgeSuccess = useCallback((assetId: string) => {
    setAssets((current) =>
      current.map((asset) => (asset.id === assetId ? { ...asset, state: 'PURGED' as const } : asset)),
    )
  }, [])

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
    setReopeningAsset(true)
    setTransitionStatus(null)
    try {
      if (isApiAssetSource) {
        await apiClient.reopenAsset(selectedAsset.id, selectedAsset.revisionEtag)
      }
      setAssets((current) =>
        current.map((asset) =>
          asset.id === selectedAsset.id ? { ...asset, state: 'DECISION_PENDING' as const } : asset,
        ),
      )
      setTransitionStatus({
        kind: 'success',
        message: t('actions.reopenDone', { id: selectedAsset.id }),
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
  }, [apiClient, isApiAssetSource, reopeningAsset, reprocessingAsset, selectedAsset, t])

  const reprocessSelectedAsset = useCallback(async () => {
    if (!selectedAsset || reopeningAsset || reprocessingAsset) {
      return
    }
    setReprocessingAsset(true)
    setTransitionStatus(null)
    try {
      if (isApiAssetSource) {
        await apiClient.reprocessAsset(
          selectedAsset.id,
          crypto.randomUUID(),
          selectedAsset.revisionEtag,
        )
      }
      setAssets((current) =>
        current.map((asset) =>
          asset.id === selectedAsset.id ? { ...asset, state: 'READY' as const } : asset,
        ),
      )
      setTransitionStatus({
        kind: 'success',
        message: t('actions.reprocessDone', { id: selectedAsset.id }),
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
  }, [apiClient, isApiAssetSource, reopeningAsset, reprocessingAsset, selectedAsset, t])

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
    sort,
    setSort,
    assets: visibleAssets,
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
    transitionStatus,
    reopeningAsset,
    reprocessingAsset,
    availability,
    previewingPurge,
    executingPurge,
    purgeStatus,
    retryStatus,
    emptyAssetsMessage: t('rejects.empty'),
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
