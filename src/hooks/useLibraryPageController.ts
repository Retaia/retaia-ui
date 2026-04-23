import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { mapApiSummaryToAsset } from '../api/assetMapper'
import { INITIAL_ASSETS } from '../data/mockAssets'
import { sortAssets, type Asset, type AssetSort } from '../domain/assets'
import { mergeAssetWithDetail } from '../domain/review/assetDetailMerge'
import { type Locale } from '../i18n/resources'
import { mapReviewApiErrorToMessage } from '../infrastructure/review/apiReviewErrorAdapter'
import { useDensityMode } from './useDensityMode'
import { useDisplayType } from './useDisplayType'
import { useReviewApiRuntime } from './useReviewApiRuntime'
import { readLibraryFilterParams, writeLibraryFilterParams } from '../services/workspaceQueryParams'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  hydrateLibraryWorkspace,
  setLibrarySearch,
  setLibrarySort,
} from '../store/slices/libraryWorkspaceSlice'
import { selectLibraryWorkspaceQueryModel } from '../store/selectors/workspaceSelectors'
import { syncAssetMetadataThunk } from '../store/thunks/assetSyncThunks'
import { persistSelectedAssetId, readSelectedAssetId } from '../services/workspaceContextPersistence'

const INITIAL_LIBRARY_ASSETS = INITIAL_ASSETS.flatMap((asset) => {
  if (asset.state === 'ARCHIVED') {
    return [asset]
  }
  if (asset.state === 'DECIDED_KEEP') {
    return [{ ...asset, state: 'ARCHIVED' as const }]
  }
  return []
})
const DEFAULT_LIBRARY_PAGE_SIZE = 50

export function useLibraryPageController() {
  const dispatch = useAppDispatch()
  const libraryWorkspace = useAppSelector(selectLibraryWorkspaceQueryModel)
  const { t, i18n } = useTranslation()
  const { search, sort } = libraryWorkspace
  const setSearch = useCallback((value: string) => {
    dispatch(setLibrarySearch(value))
  }, [dispatch])
  const setSort = useCallback((value: AssetSort) => {
    dispatch(setLibrarySort(value))
  }, [dispatch])
  const [assets, setAssets] = useState<Asset[]>(INITIAL_LIBRARY_ASSETS)
  const [assetsLoadState, setAssetsLoadState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMoreAssets, setLoadingMoreAssets] = useState(false)
  const [assetDetailLoadState, setAssetDetailLoadState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [savingMetadata, setSavingMetadata] = useState(false)
  const [transitionStatus, setTransitionStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [reopeningAsset, setReopeningAsset] = useState(false)
  const [reprocessingAsset, setReprocessingAsset] = useState(false)
  const [metadataStatus, setMetadataStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const { densityMode } = useDensityMode()
  const { displayType, setDisplayType } = useDisplayType('retaia_ui_library_asset_display_type')
  const { apiClient, isApiAssetSource } = useReviewApiRuntime()

  useEffect(() => {
    if (!isApiAssetSource) {
      return
    }

    let canceled = false
    const fetchAssets = async () => {
      setAssetsLoadState('loading')
      try {
        const response = await apiClient.listAssets({
          state: 'ARCHIVED',
          q: search.trim().length > 0 ? search.trim() : undefined,
          sort,
          limit: DEFAULT_LIBRARY_PAGE_SIZE,
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
        state: 'ARCHIVED',
        q: search.trim().length > 0 ? search.trim() : undefined,
        sort,
        limit: DEFAULT_LIBRARY_PAGE_SIZE,
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

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(() => readSelectedAssetId('library'))

  useEffect(() => {
    persistSelectedAssetId('library', selectedAssetId)
  }, [selectedAssetId])

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
    const archivedAssets = assets.filter((asset) => asset.state === 'ARCHIVED')
    if (isApiAssetSource) {
      return archivedAssets
    }
    const normalizedSearch = search.trim().toLowerCase()
    const filtered = normalizedSearch.length === 0 ? archivedAssets : archivedAssets.filter((asset) => {
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

  const handleAssetClick = useCallback(
    (assetId: string) => {
      setSelectedAssetId(assetId)
    },
    [],
  )

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
              revisionEtag: selectedAsset?.revisionEtag,
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
    [dispatch, isApiAssetSource, selectedAsset?.revisionEtag, t],
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

  const locale = (i18n.resolvedLanguage ?? 'fr') as Locale
  const onKeywordClick = useCallback((keyword: string) => {
    setSearch(keyword)
  }, [setSearch])

  useEffect(() => {
    writeLibraryFilterParams(search, sort)
  }, [search, sort])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const handlePopState = () => {
      const next = readLibraryFilterParams()
      dispatch(
        hydrateLibraryWorkspace({
          search: next.search ?? '',
          sort: next.sort ?? '-created_at',
        }),
      )
    }
    handlePopState()
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [dispatch])

  return {
    t,
    locale,
    assets,
    visibleAssets,
    selectedAsset,
    selectedAssetId,
    search,
    setSearch,
    onKeywordClick,
    sort,
    setSort,
    densityMode,
    displayType,
    setDisplayType,
    assetsLoadState,
    hasMoreAssets: isApiAssetSource && Boolean(nextCursor),
    loadingMoreAssets,
    loadMoreAssets,
    assetDetailLoadState,
    isApiAssetSource,
    savingMetadata,
    transitionStatus,
    reopeningAsset,
    reprocessingAsset,
    metadataStatus,
    onAssetClick: handleAssetClick,
    onSaveMetadata: saveSelectedAssetMetadata,
    onReopenAsset: reopenSelectedAsset,
    onReprocessAsset: reprocessSelectedAsset,
    onChangeLanguage: (nextLocale: Locale) => {
      void i18n.changeLanguage(nextLocale)
    },
    openAsset: setSelectedAssetId,
  }
}
