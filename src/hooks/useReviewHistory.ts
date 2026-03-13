import { useCallback, useRef, useState } from 'react'
import type { Asset } from '../domain/assets'

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

export function useReviewHistory({
  assets,
  selectedAssetId,
  batchIds,
  setAssets,
  setSelectedAssetId,
  setBatchIds,
  t,
}: Params) {
  const activityId = useRef(1)
  const [undoStack, setUndoStack] = useState<Snapshot[]>([])
  const [activityLog, setActivityLog] = useState<Array<{ id: number; label: string }>>([])

  const logActivity = useCallback((label: string) => {
    setActivityLog((current) =>
      [{ id: activityId.current++, label }, ...current].slice(0, 8),
    )
  }, [])

  const pushUndoSnapshot = useCallback(() => {
    setUndoStack((current) =>
      [{ assets, selectedAssetId, batchIds }, ...current].slice(0, 30),
    )
  }, [assets, selectedAssetId, batchIds])

  const recordAction = useCallback(
    (label: string) => {
      pushUndoSnapshot()
      logActivity(label)
    },
    [logActivity, pushUndoSnapshot],
  )

  const clearActivityLog = useCallback(() => {
    setActivityLog((current) => {
      if (current.length === 0) {
        return current
      }
      return []
    })
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
