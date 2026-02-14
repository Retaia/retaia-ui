import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import { mapApiSummaryToAsset } from '../api/assetMapper'
import type { ApiClient } from '../api/client'
import type { Asset } from '../domain/assets'
import { mergeAssetWithDetail } from '../services/reviewAssetDetail'

type UseReviewDataControllerArgs = {
  apiClient: ApiClient
  isApiAssetSource: boolean
  selectedAssetId: string | null
  setAssets: Dispatch<SetStateAction<Asset[]>>
}

export function useReviewDataController({
  apiClient,
  isApiAssetSource,
  selectedAssetId,
  setAssets,
}: UseReviewDataControllerArgs) {
  const [assetsLoadState, setAssetsLoadState] = useState<'idle' | 'loading' | 'error'>(
    isApiAssetSource ? 'loading' : 'idle',
  )
  const [policyLoadState, setPolicyLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    isApiAssetSource ? 'loading' : 'ready',
  )
  const [bulkDecisionsEnabled, setBulkDecisionsEnabled] = useState(!isApiAssetSource)
  const [assetDetailLoadState, setAssetDetailLoadState] = useState<'idle' | 'loading' | 'error'>(
    'idle',
  )

  useEffect(() => {
    if (!isApiAssetSource) {
      return
    }

    let canceled = false
    const fetchAssets = async () => {
      setAssetsLoadState('loading')
      try {
        const summaries = await apiClient.listAssetSummaries()
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
  }, [apiClient, isApiAssetSource, setAssets])

  useEffect(() => {
    if (!isApiAssetSource) {
      return
    }

    let canceled = false
    const fetchPolicy = async () => {
      setPolicyLoadState('loading')
      setBulkDecisionsEnabled(false)
      try {
        const policy = await apiClient.getAppPolicy()
        if (canceled) {
          return
        }
        const bulkEnabled = policy.server_policy?.feature_flags?.['features.decisions.bulk'] === true
        setBulkDecisionsEnabled(bulkEnabled)
        setPolicyLoadState('ready')
      } catch {
        if (canceled) {
          return
        }
        setBulkDecisionsEnabled(false)
        setPolicyLoadState('error')
      }
    }

    void fetchPolicy()
    return () => {
      canceled = true
    }
  }, [apiClient, isApiAssetSource])

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
  }, [apiClient, isApiAssetSource, selectedAssetId, setAssets])

  return {
    assetsLoadState,
    policyLoadState: isApiAssetSource ? policyLoadState : 'ready',
    bulkDecisionsEnabled: isApiAssetSource ? bulkDecisionsEnabled : true,
    assetDetailLoadState: isApiAssetSource && selectedAssetId ? assetDetailLoadState : 'idle',
  }
}
