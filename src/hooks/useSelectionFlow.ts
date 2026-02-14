import { useCallback } from 'react'
import type { Asset } from '../domain/assets'
import {
  mergeUniqueBatchIds,
  resolveSelectionNavigation,
} from '../application/review/selectionFlowHelpers'

type Params = {
  visibleAssets: Asset[]
  selectedAssetId: string | null
  selectionAnchorId: string | null
  recordAction: (label: string) => void
  t: (key: string, values?: Record<string, string | number>) => string
  setSelectedAssetId: (value: string | null | ((current: string | null) => string | null)) => void
  setSelectionAnchorId: (value: string | null | ((current: string | null) => string | null)) => void
  setBatchIds: (value: string[] | ((current: string[]) => string[])) => void
  setPurgePreviewAssetId: (value: string | null) => void
  setPurgeStatus: (value: { kind: 'success' | 'error'; message: string } | null) => void
}

export function useSelectionFlow({
  visibleAssets,
  selectedAssetId,
  selectionAnchorId,
  recordAction,
  t,
  setSelectedAssetId,
  setSelectionAnchorId,
  setBatchIds,
  setPurgePreviewAssetId,
  setPurgeStatus,
}: Params) {
  const toggleBatchAsset = useCallback(
    (id: string) => {
      setBatchIds((current) => {
        const willAdd = !current.includes(id)
        recordAction(
          willAdd
            ? t('activity.batchAdd', { id })
            : t('activity.batchRemove', { id }),
        )
        return willAdd ? [...current, id] : current.filter((value) => value !== id)
      })
    },
    [recordAction, setBatchIds, t],
  )

  const handleAssetClick = useCallback((id: string, shiftKey: boolean) => {
    if (shiftKey) {
      toggleBatchAsset(id)
      return
    }
    setSelectedAssetId(id)
    setSelectionAnchorId(id)
  }, [setSelectedAssetId, setSelectionAnchorId, toggleBatchAsset])

  const selectVisibleByOffset = useCallback(
    (offset: -1 | 1, extendBatchRange = false) => {
      const nextSelection = resolveSelectionNavigation({
        visibleAssets,
        selectedAssetId,
        selectionAnchorId,
        offset,
        extendBatchRange,
      })
      if (!nextSelection) {
        return
      }

      setSelectedAssetId(nextSelection.nextId)
      setSelectionAnchorId(nextSelection.nextAnchorId)

      if (!extendBatchRange || nextSelection.rangeIds.length === 0) {
        return
      }

      setBatchIds((current) => {
        const { mergedIds, addedCount } = mergeUniqueBatchIds(current, nextSelection.rangeIds)
        if (addedCount > 0) {
          recordAction(t('activity.range', { count: addedCount }))
        }
        return mergedIds
      })
    },
    [
      recordAction,
      selectedAssetId,
      selectionAnchorId,
      setBatchIds,
      setSelectedAssetId,
      setSelectionAnchorId,
      t,
      visibleAssets,
    ],
  )

  const toggleBatchForSelectedAsset = useCallback(() => {
    if (!selectedAssetId) {
      return
    }
    toggleBatchAsset(selectedAssetId)
  }, [selectedAssetId, toggleBatchAsset])

  const clearSelection = useCallback(() => {
    setSelectedAssetId(null)
    setSelectionAnchorId(null)
    setPurgePreviewAssetId(null)
    setPurgeStatus(null)
  }, [setPurgePreviewAssetId, setPurgeStatus, setSelectedAssetId, setSelectionAnchorId])

  const selectFirstVisibleAsset = useCallback(() => {
    const firstVisible = visibleAssets[0]
    if (!firstVisible) {
      return
    }
    setSelectedAssetId(firstVisible.id)
    setSelectionAnchorId(firstVisible.id)
  }, [setSelectedAssetId, setSelectionAnchorId, visibleAssets])

  const selectLastVisibleAsset = useCallback(() => {
    const last = visibleAssets[visibleAssets.length - 1]
    if (!last) {
      return
    }
    setSelectedAssetId(last.id)
    setSelectionAnchorId(last.id)
  }, [setSelectedAssetId, setSelectionAnchorId, visibleAssets])

  return {
    handleAssetClick,
    selectVisibleByOffset,
    toggleBatchForSelectedAsset,
    clearSelection,
    selectFirstVisibleAsset,
    selectLastVisibleAsset,
    toggleBatchAsset,
  } as const
}
