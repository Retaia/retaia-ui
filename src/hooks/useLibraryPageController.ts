import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { mapApiSummaryToAsset } from '../api/assetMapper'
import { INITIAL_ASSETS } from '../data/mockAssets'
import { sortAssets, type Asset, type AssetSort } from '../domain/assets'
import { mergeAssetWithDetail } from '../domain/review/assetDetailMerge'
import { type Locale } from '../i18n/resources'
import { mapReviewApiErrorToMessage } from '../infrastructure/review/apiReviewErrorAdapter'
import { useDensityMode } from './useDensityMode'
import { useReviewApiRuntime } from './useReviewApiRuntime'
import { readLibraryWorkspaceState, saveLibraryWorkspaceState } from '../services/navigationSession'
import { readLibraryFilterParams, writeLibraryFilterParams } from '../services/workspaceQueryParams'

const INITIAL_LIBRARY_ASSETS = INITIAL_ASSETS.filter(
  (asset) => asset.state === 'ARCHIVED' || asset.state === 'DECIDED_KEEP',
)

export function useLibraryPageController() {
  const persistedWorkspaceState = readLibraryWorkspaceState()
  const queryFilters = readLibraryFilterParams()
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState(queryFilters.search ?? persistedWorkspaceState?.search ?? '')
  const [sort, setSort] = useState<AssetSort>(queryFilters.sort ?? persistedWorkspaceState?.sort ?? '-created_at')
  const [assets, setAssets] = useState<Asset[]>(INITIAL_LIBRARY_ASSETS)
  const [assetsLoadState, setAssetsLoadState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [assetDetailLoadState, setAssetDetailLoadState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [savingMetadata, setSavingMetadata] = useState(false)
  const [metadataStatus, setMetadataStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const { densityMode } = useDensityMode()
  const { apiClient, isApiAssetSource } = useReviewApiRuntime()

  useEffect(() => {
    if (!isApiAssetSource) {
      return
    }

    let canceled = false
    const fetchAssets = async () => {
      setAssetsLoadState('loading')
      try {
        const summaries = await apiClient.listAssetSummaries({
          state: 'ARCHIVED',
          q: search.trim().length > 0 ? search.trim() : undefined,
          sort,
        })
        if (canceled) {
          return
        }
        setAssets(summaries.map((summary, index) => mapApiSummaryToAsset(summary, index)))
        setAssetsLoadState('idle')
      } catch {
        if (canceled) {
          return
        }
        setAssetsLoadState('error')
      }
    }

    void fetchAssets()
    return () => {
      canceled = true
    }
  }, [apiClient, isApiAssetSource, search, sort])

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)

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
    if (isApiAssetSource) {
      return assets
    }
    const normalizedSearch = search.trim().toLowerCase()
    const filtered = normalizedSearch.length === 0 ? assets : assets.filter((asset) => {
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
      try {
        await apiClient.updateAssetMetadata(assetId, payload)
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
    [apiClient, t],
  )

  const locale = (i18n.resolvedLanguage ?? 'fr') as Locale

  useEffect(() => {
    saveLibraryWorkspaceState({ search, sort })
  }, [search, sort])

  useEffect(() => {
    writeLibraryFilterParams(search, sort)
  }, [search, sort])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const handlePopState = () => {
      const next = readLibraryFilterParams()
      setSearch(next.search ?? '')
      setSort(next.sort ?? '-created_at')
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  return {
    t,
    locale,
    assets,
    visibleAssets,
    selectedAsset,
    selectedAssetId,
    search,
    setSearch,
    sort,
    setSort,
    densityMode,
    assetsLoadState,
    assetDetailLoadState,
    isApiAssetSource,
    savingMetadata,
    metadataStatus,
    onAssetClick: handleAssetClick,
    onSaveMetadata: saveSelectedAssetMetadata,
    onChangeLanguage: (nextLocale: Locale) => {
      void i18n.changeLanguage(nextLocale)
    },
    openAsset: setSelectedAssetId,
  }
}
