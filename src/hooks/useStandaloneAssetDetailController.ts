import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { mapApiSummaryToAsset } from '../api/assetMapper'
import { INITIAL_ASSETS } from '../data/mockAssets'
import type { Asset } from '../domain/assets'
import { mergeAssetWithDetail } from '../domain/review/assetDetailMerge'
import { type Locale } from '../i18n/resources'
import { mapReviewApiErrorToMessage } from '../infrastructure/review/apiReviewErrorAdapter'
import { useReviewApiRuntime } from './useReviewApiRuntime'

type Context = 'review' | 'library'

export function useStandaloneAssetDetailController(context: Context) {
  const { t, i18n } = useTranslation()
  const { assetId } = useParams<{ assetId: string }>()
  const { apiClient, isApiAssetSource } = useReviewApiRuntime()
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [savingMetadata, setSavingMetadata] = useState(false)
  const [metadataStatus, setMetadataStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    if (!assetId) {
      setSelectedAsset(null)
      return
    }

    if (!isApiAssetSource) {
      const localAsset =
        INITIAL_ASSETS.find((asset) => asset.id === assetId) ??
        (context === 'library'
          ? INITIAL_ASSETS.find((asset) => asset.id === assetId && asset.state === 'ARCHIVED')
          : null)
      setSelectedAsset(localAsset ?? null)
      return
    }

    let canceled = false
    const load = async () => {
      setLoadingState('loading')
      try {
        const summaries =
          context === 'library'
            ? await apiClient.listAssetSummaries({ state: 'ARCHIVED' })
            : await apiClient.listAssetSummaries()

        if (canceled) {
          return
        }

        const mappedSummaries = summaries.map((summary, index) => mapApiSummaryToAsset(summary, index))
        const summaryAsset = mappedSummaries.find((asset) => asset.id === assetId) ?? null
        const detail = await apiClient.getAssetDetail(assetId)
        if (canceled) {
          return
        }

        const fallbackAsset = mapApiSummaryToAsset(detail.summary, 0)
        const merged = mergeAssetWithDetail(summaryAsset ?? fallbackAsset, detail, {
          includeDecisionState: true,
        })
        setSelectedAsset(merged)
        setLoadingState('idle')
      } catch {
        if (canceled) {
          return
        }
        setSelectedAsset(null)
        setLoadingState('error')
      }
    }

    void load()
    return () => {
      canceled = true
    }
  }, [apiClient, assetId, context, isApiAssetSource])

  const saveMetadata = async (targetAssetId: string, payload: { tags: string[]; notes: string }) => {
    setSavingMetadata(true)
    setMetadataStatus(null)
    try {
      await apiClient.updateAssetMetadata(targetAssetId, payload)
      setSelectedAsset((current) =>
        current && current.id === targetAssetId
          ? { ...current, tags: payload.tags, notes: payload.notes }
          : current,
      )
      setMetadataStatus({
        kind: 'success',
        message: t('detail.taggingSaved', { id: targetAssetId }),
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
  }

  const locale = (i18n.resolvedLanguage ?? 'fr') as Locale
  const showNotFound = !selectedAsset && loadingState !== 'loading'

  return {
    t,
    locale,
    selectedAsset,
    loadingState,
    showNotFound,
    savingMetadata,
    metadataStatus,
    saveMetadata,
    onChangeLanguage: (nextLocale: Locale) => {
      void i18n.changeLanguage(nextLocale)
    },
  }
}
