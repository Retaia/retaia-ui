import type { Asset } from '../../domain/assets'

type ResolveSelectionNavigationArgs = {
  visibleAssets: Asset[]
  selectedAssetId: string | null
  selectionAnchorId: string | null
  offset: -1 | 1
  extendBatchRange: boolean
}

type ResolveSelectionNavigationResult = {
  nextId: string
  nextAnchorId: string
  rangeIds: string[]
}

export function resolveSelectionNavigation({
  visibleAssets,
  selectedAssetId,
  selectionAnchorId,
  offset,
  extendBatchRange,
}: ResolveSelectionNavigationArgs): ResolveSelectionNavigationResult | null {
  const firstVisible = visibleAssets[0]
  if (!firstVisible) {
    return null
  }

  if (!selectedAssetId) {
    return {
      nextId: firstVisible.id,
      nextAnchorId: firstVisible.id,
      rangeIds: [],
    }
  }

  const currentIndex = visibleAssets.findIndex((asset) => asset.id === selectedAssetId)
  if (currentIndex < 0) {
    return {
      nextId: firstVisible.id,
      nextAnchorId: firstVisible.id,
      rangeIds: [],
    }
  }

  const nextIndex = Math.min(visibleAssets.length - 1, Math.max(0, currentIndex + offset))
  const nextAsset = visibleAssets[nextIndex]
  if (!nextAsset) {
    return null
  }
  const nextId = nextAsset.id

  if (!extendBatchRange) {
    return {
      nextId,
      nextAnchorId: nextId,
      rangeIds: [],
    }
  }

  const anchorId = selectionAnchorId ?? selectedAssetId
  const anchorIndex = visibleAssets.findIndex((asset) => asset.id === anchorId)
  if (anchorIndex < 0) {
    return {
      nextId,
      nextAnchorId: nextId,
      rangeIds: [],
    }
  }

  const startIndex = Math.min(anchorIndex, nextIndex)
  const endIndex = Math.max(anchorIndex, nextIndex)
  const rangeIds = visibleAssets.slice(startIndex, endIndex + 1).map((asset) => asset.id)

  return {
    nextId,
    nextAnchorId: anchorId,
    rangeIds,
  }
}

export function mergeUniqueBatchIds(currentIds: string[], candidateIds: string[]) {
  const merged = new Set([...currentIds, ...candidateIds])
  return {
    mergedIds: [...merged],
    addedCount: merged.size - currentIds.length,
  }
}
