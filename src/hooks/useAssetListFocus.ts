import { type RefObject, useEffect } from 'react'
import { resolveAssetListFocusTarget } from '../application/review/assetListFocus'
import { isTypingContext } from '../ui/keyboard'
import type { Asset } from '../domain/assets'

type UseAssetListFocusArgs = {
  assetListRegionRef: RefObject<HTMLElement | null>
  selectedAssetId: string | null
  visibleAssets: Asset[]
}

export function useAssetListFocus({
  assetListRegionRef,
  selectedAssetId,
  visibleAssets,
}: UseAssetListFocusArgs) {
  useEffect(() => {
    const activeElement = document.activeElement
    const focusTarget = resolveAssetListFocusTarget({
      region: assetListRegionRef.current,
      selectedAssetId,
      isActiveElementTypingContext: isTypingContext(activeElement),
    })
    if (!focusTarget || activeElement === focusTarget) {
      return
    }
    focusTarget.focus()
    if (typeof focusTarget.scrollIntoView === 'function') {
      focusTarget.scrollIntoView({ block: 'nearest' })
    }
  }, [assetListRegionRef, selectedAssetId, visibleAssets])
}
