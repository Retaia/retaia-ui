import { useCallback } from 'react'
import type { Asset } from '../domain/assets'

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
      if (visibleAssets.length === 0) {
        return
      }

      if (!selectedAssetId) {
        setSelectedAssetId(visibleAssets[0].id)
        setSelectionAnchorId(visibleAssets[0].id)
        return
      }

      const currentIndex = visibleAssets.findIndex((asset) => asset.id === selectedAssetId)
      if (currentIndex < 0) {
        setSelectedAssetId(visibleAssets[0].id)
        setSelectionAnchorId(visibleAssets[0].id)
        return
      }

      const nextIndex = Math.min(
        visibleAssets.length - 1,
        Math.max(0, currentIndex + offset),
      )
      const nextId = visibleAssets[nextIndex].id

      if (!extendBatchRange) {
        setSelectedAssetId(nextId)
        setSelectionAnchorId(nextId)
        return
      }

      const anchorId = selectionAnchorId ?? selectedAssetId
      const anchorIndex = visibleAssets.findIndex((asset) => asset.id === anchorId)
      if (anchorIndex < 0) {
        setSelectedAssetId(nextId)
        setSelectionAnchorId(nextId)
        return
      }

      const startIndex = Math.min(anchorIndex, nextIndex)
      const endIndex = Math.max(anchorIndex, nextIndex)
      const rangeIds = visibleAssets
        .slice(startIndex, endIndex + 1)
        .map((asset) => asset.id)

      setSelectedAssetId(nextId)
      setSelectionAnchorId(anchorId)
      setBatchIds((current) => {
        const merged = new Set([...current, ...rangeIds])
        const addedCount = merged.size - current.length
        if (addedCount > 0) {
          recordAction(t('activity.range', { count: addedCount }))
        }
        return [...merged]
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
    if (visibleAssets.length === 0) {
      return
    }
    setSelectedAssetId(visibleAssets[0].id)
    setSelectionAnchorId(visibleAssets[0].id)
  }, [setSelectedAssetId, setSelectionAnchorId, visibleAssets])

  const selectLastVisibleAsset = useCallback(() => {
    if (visibleAssets.length === 0) {
      return
    }
    const last = visibleAssets[visibleAssets.length - 1]
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
