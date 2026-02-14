import { useCallback, useEffect, useState } from 'react'
import type { Asset } from '../domain/assets'
import {
  buildPurgeErrorStatus,
  buildPurgePreviewErrorStatus,
  buildPurgePreviewReadyStatus,
  buildPurgeSuccessStatus,
} from '../application/review/purgeStatus'

type ApiClient = {
  previewAssetPurge: (assetId: string) => Promise<unknown>
  executeAssetPurge: (assetId: string, idempotencyKey: string) => Promise<unknown>
}

type PurgeStatus = {
  kind: 'success' | 'error'
  message: string
}

type Translate = (key: string, values?: Record<string, unknown>) => string

type Params = {
  apiClient: ApiClient
  selectedAsset: Asset | null
  t: Translate
  setRetryStatus: (value: string | null) => void
  mapErrorToMessage: (error: unknown) => string
  recordAction: (label: string) => void
  onPurgeSuccess: (assetId: string) => void
}

export function usePurgeFlow({
  apiClient,
  selectedAsset,
  t,
  setRetryStatus,
  mapErrorToMessage,
  recordAction,
  onPurgeSuccess,
}: Params) {
  const [previewingPurge, setPreviewingPurge] = useState(false)
  const [executingPurge, setExecutingPurge] = useState(false)
  const [purgePreviewAssetId, setPurgePreviewAssetId] = useState<string | null>(null)
  const [purgeStatus, setPurgeStatus] = useState<PurgeStatus | null>(null)

  const previewSelectedAssetPurge = useCallback(async () => {
    if (!selectedAsset || selectedAsset.state !== 'DECIDED_REJECT' || previewingPurge) {
      return
    }

    setPreviewingPurge(true)
    setPurgeStatus(null)
    setRetryStatus(null)

    try {
      await apiClient.previewAssetPurge(selectedAsset.id)
      setPurgePreviewAssetId(selectedAsset.id)
      setPurgeStatus(buildPurgePreviewReadyStatus(t, selectedAsset.id))
    } catch (error) {
      setPurgePreviewAssetId(null)
      setPurgeStatus(buildPurgePreviewErrorStatus(t, mapErrorToMessage, error))
    } finally {
      setPreviewingPurge(false)
      setRetryStatus(null)
    }
  }, [apiClient, mapErrorToMessage, previewingPurge, selectedAsset, setRetryStatus, t])

  const executeSelectedAssetPurge = useCallback(async () => {
    if (
      !selectedAsset ||
      selectedAsset.state !== 'DECIDED_REJECT' ||
      purgePreviewAssetId !== selectedAsset.id ||
      executingPurge
    ) {
      return
    }

    setExecutingPurge(true)
    setPurgeStatus(null)
    setRetryStatus(null)

    try {
      await apiClient.executeAssetPurge(selectedAsset.id, crypto.randomUUID())
      recordAction(t('activity.purge', { id: selectedAsset.id }))
      onPurgeSuccess(selectedAsset.id)
      setPurgePreviewAssetId(null)
      setPurgeStatus(buildPurgeSuccessStatus(t, selectedAsset.id))
    } catch (error) {
      setPurgeStatus(buildPurgeErrorStatus(t, mapErrorToMessage, error))
    } finally {
      setExecutingPurge(false)
      setRetryStatus(null)
    }
  }, [
    apiClient,
    executingPurge,
    mapErrorToMessage,
    onPurgeSuccess,
    purgePreviewAssetId,
    recordAction,
    selectedAsset,
    setRetryStatus,
    t,
  ])

  useEffect(() => {
    if (!selectedAsset || selectedAsset.id === purgePreviewAssetId) {
      return
    }
    setPurgePreviewAssetId(null)
  }, [purgePreviewAssetId, selectedAsset])

  return {
    previewingPurge,
    executingPurge,
    purgePreviewAssetId,
    purgeStatus,
    setPurgePreviewAssetId,
    setPurgeStatus,
    previewSelectedAssetPurge,
    executeSelectedAssetPurge,
  } as const
}
