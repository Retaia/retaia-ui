import { useCallback, useState } from 'react'
import type { Asset } from '../domain/assets'
import { useActivityLog } from './useActivityLog'
import {
  appendActivityLogEntry,
  clearActivityLog as clearPersistedActivityLog,
  type ActivityLogScope,
} from '../services/activityLogPersistence'

type Snapshot = {
  assets: Asset[]
  selectedAssetId: string | null
  batchIds: string[]
}

type Params = {
  assets: Asset[]
  selectedAssetId: string | null
  batchIds: string[]
  setAssets: (value: Asset[] | ((current: Asset[]) => Asset[])) => void
  setSelectedAssetId: (value: string | null) => void
  setBatchIds: (value: string[] | ((current: string[]) => string[])) => void
  t: (key: string) => string
}

type RecordActionOptions = {
  assetId?: string
  scope?: ActivityLogScope
}

export function useReviewHistory({
  assets,
  selectedAssetId,
  batchIds,
  setAssets,
  setSelectedAssetId,
  setBatchIds,
  t,
}: Params) {
  const [undoStack, setUndoStack] = useState<Snapshot[]>([])
  const activityLog = useActivityLog()

  const logActivity = useCallback((label: string, options?: RecordActionOptions) => {
    appendActivityLogEntry({
      label,
      assetId: options?.assetId,
      scope: options?.scope ?? 'review',
    })
  }, [])

  const pushUndoSnapshot = useCallback(() => {
    setUndoStack((current) =>
      [{ assets, selectedAssetId, batchIds }, ...current].slice(0, 30),
    )
  }, [assets, selectedAssetId, batchIds])

  const recordAction = useCallback(
    (label: string, options?: RecordActionOptions) => {
      pushUndoSnapshot()
      logActivity(label, options)
    },
    [logActivity, pushUndoSnapshot],
  )

  const clearActivityLog = useCallback(() => {
    clearPersistedActivityLog()
  }, [])

  const undoLastAction = useCallback(() => {
    setUndoStack((current) => {
      const last = current[0]
      if (!last) {
        return current
      }
      const rest = current.slice(1)
      setAssets(last.assets)
      setSelectedAssetId(last.selectedAssetId)
      setBatchIds(last.batchIds)
      logActivity(t('activity.undo'))
      return rest
    })
  }, [logActivity, setAssets, setBatchIds, setSelectedAssetId, t])

  return {
    undoStack,
    activityLog,
    recordAction,
    clearActivityLog,
    undoLastAction,
  } as const
}
