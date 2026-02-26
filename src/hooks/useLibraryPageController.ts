import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { mapApiSummaryToAsset } from '../api/assetMapper'
import { INITIAL_ASSETS } from '../data/mockAssets'
import type { Asset } from '../domain/assets'
import { mergeAssetWithDetail } from '../domain/review/assetDetailMerge'
import { type Locale } from '../i18n/resources'
import { mapReviewApiErrorToMessage } from '../infrastructure/review/apiReviewErrorAdapter'
import { useAssetRouteSelection } from './useAssetRouteSelection'
import { useDensityMode } from './useDensityMode'
import { useReviewApiRuntime } from './useReviewApiRuntime'

const INITIAL_LIBRARY_ASSETS = INITIAL_ASSETS.filter((asset) => asset.state === 'DECIDED_KEEP')

export function useLibraryPageController() {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
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
        const summaries = await apiClient.listAssetSummaries({ state: 'ARCHIVED' })
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
  }, [apiClient, isApiAssetSource])

  const {
    selectedAssetId,
    applySelectedAssetId,
  } = useAssetRouteSelection(INITIAL_LIBRARY_ASSETS, assets, { basePath: '/library' })

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
    const normalizedSearch = search.trim().toLowerCase()
    if (normalizedSearch.length === 0) {
      return assets
    }
    return assets.filter((asset) => {
      const tags = asset.tags ?? []
      return (
        asset.name.toLowerCase().includes(normalizedSearch) ||
        asset.id.toLowerCase().includes(normalizedSearch) ||
        tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
      )
    })
  }, [assets, search])

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
  )

  const handleAssetClick = useCallback(
    (assetId: string) => {
      applySelectedAssetId(assetId)
    },
    [applySelectedAssetId],
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

  return {
    t,
    locale,
    assets,
    visibleAssets,
    selectedAsset,
    selectedAssetId,
    search,
    setSearch,
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
    openAsset: applySelectedAssetId,
  }
}
