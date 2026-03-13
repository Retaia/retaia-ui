type ResolveAssetListFocusTargetParams = {
  region: HTMLElement | null
  selectedAssetId: string | null
  isActiveElementTypingContext: boolean
}

export function resolveAssetListFocusTarget({
  region,
  selectedAssetId,
  isActiveElementTypingContext,
}: ResolveAssetListFocusTargetParams): HTMLElement | null {
  if (!region || !selectedAssetId) {
    return null
  }

  const selectedTarget = region.querySelector<HTMLElement>(`[data-asset-id="${selectedAssetId}"]`)
  if (selectedTarget && isActiveElementTypingContext) {
    return null
  }

  const selectedFocusTarget =
    selectedTarget?.querySelector<HTMLElement>('[data-asset-open="true"]') ?? selectedTarget
  const firstRow = region.querySelector<HTMLElement>('[data-asset-id]')
  const fallbackFocusTarget = firstRow?.querySelector<HTMLElement>('[data-asset-open="true"]') ?? firstRow

  return selectedFocusTarget ?? fallbackFocusTarget ?? null
}
