import { useQuery } from '@tanstack/react-query'
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react'
import { mapApiSummaryToAsset } from '../api/assetMapper'
import { ApiError, type ApiClient } from '../api/client'
import type { Asset } from '../domain/assets'
import { mergeAssetWithDetail } from '../domain/review/assetDetailMerge'

type UseReviewDataControllerArgs = {
  apiClient: ApiClient
  isApiAssetSource: boolean
  selectedAssetId: string | null
  setAssets: Dispatch<SetStateAction<Asset[]>>
}

const DEFAULT_POLICY_POLL_INTERVAL_MS = 30_000
const MIN_POLICY_POLL_INTERVAL_MS = 1_000
const POLICY_429_BACKOFF_BASE_MS = 1_000
const POLICY_429_BACKOFF_MAX_MS = 30_000

const POLICY_429_CODES = new Set(['SLOW_DOWN', 'TOO_MANY_ATTEMPTS', 'RATE_LIMITED'])

function resolvePolicyPollingIntervalMs(policy: Awaited<ReturnType<ApiClient['getAppPolicy']>>) {
  const rawInterval = policy.server_policy?.min_poll_interval_seconds
  if (typeof rawInterval !== 'number' || Number.isNaN(rawInterval) || rawInterval <= 0) {
    return DEFAULT_POLICY_POLL_INTERVAL_MS
  }
  return Math.max(Math.round(rawInterval * 1_000), MIN_POLICY_POLL_INTERVAL_MS)
}

function is429PolicyError(error: unknown) {
  return (
    error instanceof ApiError &&
    error.status === 429 &&
    (error.payload?.code === undefined || POLICY_429_CODES.has(error.payload.code))
  )
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
  const [assetDetailLoadState, setAssetDetailLoadState] = useState<'idle' | 'loading' | 'error'>(
    'idle',
  )
  const consecutive429ErrorsRef = useRef(0)

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

  const policyQuery = useQuery({
    queryKey: ['app-policy', apiClient],
    queryFn: async () => {
      try {
        const policy = await apiClient.getAppPolicy()
        consecutive429ErrorsRef.current = 0
        return policy
      } catch (error) {
        if (is429PolicyError(error)) {
          consecutive429ErrorsRef.current += 1
        } else {
          consecutive429ErrorsRef.current = 0
        }
        throw error
      }
    },
    enabled: isApiAssetSource,
    refetchInterval: (query) => {
      if (!isApiAssetSource) {
        return false
      }
      if (is429PolicyError(query.state.error)) {
        const backoffDelay = Math.min(
          POLICY_429_BACKOFF_BASE_MS * 2 ** Math.max(consecutive429ErrorsRef.current - 1, 0),
          POLICY_429_BACKOFF_MAX_MS,
        )
        const jitter = Math.floor(Math.random() * POLICY_429_BACKOFF_BASE_MS)
        return backoffDelay + jitter
      }
      if (query.state.data) {
        return resolvePolicyPollingIntervalMs(query.state.data)
      }
      return DEFAULT_POLICY_POLL_INTERVAL_MS
    },
    refetchIntervalInBackground: true,
    retry: false,
  })

  const policyLoadState: 'idle' | 'loading' | 'ready' | 'error' = !isApiAssetSource
    ? 'ready'
    : policyQuery.isPending && !policyQuery.data
      ? 'loading'
      : policyQuery.isError || policyQuery.isRefetchError
        ? 'error'
        : 'ready'

  const bulkDecisionsEnabled = !isApiAssetSource
    ? true
    : policyLoadState === 'ready' &&
      policyQuery.data?.server_policy?.feature_flags?.['features.decisions.bulk'] === true

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
    policyLoadState,
    bulkDecisionsEnabled,
    assetDetailLoadState: isApiAssetSource && selectedAssetId ? assetDetailLoadState : 'idle',
  }
}
