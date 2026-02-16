import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
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
    let policyPollTimer: ReturnType<typeof setTimeout> | null = null
    let hasResolvedInitialPolicy = false
    let consecutive429Errors = 0

    const schedulePolicyPoll = (delayMs: number) => {
      if (canceled) {
        return
      }
      policyPollTimer = setTimeout(() => {
        void fetchPolicy()
      }, Math.max(delayMs, 0))
    }

    const fetchPolicy = async () => {
      if (!hasResolvedInitialPolicy) {
        setPolicyLoadState('loading')
        setBulkDecisionsEnabled(false)
      }
      try {
        const policy = await apiClient.getAppPolicy()
        if (canceled) {
          return
        }
        hasResolvedInitialPolicy = true
        consecutive429Errors = 0
        const bulkEnabled = policy.server_policy?.feature_flags?.['features.decisions.bulk'] === true
        setBulkDecisionsEnabled(bulkEnabled)
        setPolicyLoadState('ready')
        schedulePolicyPoll(resolvePolicyPollingIntervalMs(policy))
      } catch (error) {
        if (canceled) {
          return
        }
        hasResolvedInitialPolicy = true
        setBulkDecisionsEnabled(false)
        setPolicyLoadState('error')
        if (is429PolicyError(error)) {
          consecutive429Errors += 1
          const backoffDelay = Math.min(
            POLICY_429_BACKOFF_BASE_MS * 2 ** (consecutive429Errors - 1),
            POLICY_429_BACKOFF_MAX_MS,
          )
          const jitter = Math.floor(Math.random() * POLICY_429_BACKOFF_BASE_MS)
          schedulePolicyPoll(backoffDelay + jitter)
          return
        }
        consecutive429Errors = 0
        schedulePolicyPoll(DEFAULT_POLICY_POLL_INTERVAL_MS)
      }
    }

    void fetchPolicy()
    return () => {
      canceled = true
      if (policyPollTimer) {
        clearTimeout(policyPollTimer)
      }
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
