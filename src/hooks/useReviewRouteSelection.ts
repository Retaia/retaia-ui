import { useCallback, useEffect, useState } from 'react'
import type { Asset } from '../domain/assets'

const SELECTED_ASSET_QUERY_KEY = 'asset'
const REVIEW_BASE_PATH = '/review'

function getAssetIdFromLocationPath(pathname: string): string | null {
  const match = pathname.match(/^\/review\/([^/?#]+)/)
  if (!match?.[1]) {
    return null
  }
  return decodeURIComponent(match[1])
}

function getSelectedAssetIdFromLocation() {
  if (typeof window === 'undefined') {
    return null
  }
  const fromPath = getAssetIdFromLocationPath(window.location.pathname)
  if (fromPath) {
    return fromPath
  }
  const params = new URLSearchParams(window.location.search)
  return params.get(SELECTED_ASSET_QUERY_KEY)
}

export function useReviewRouteSelection(initialAssets: Asset[], assets: Asset[]) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(() => {
    const urlAssetId = getSelectedAssetIdFromLocation()
    if (!urlAssetId) {
      return null
    }
    return initialAssets.some((asset) => asset.id === urlAssetId) ? urlAssetId : null
  })
  const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null)

  const updateSelectedAssetSearchParam = useCallback(
    (nextAssetId: string | null, mode: 'push' | 'replace' = 'push') => {
      if (typeof window === 'undefined') {
        return
      }
      const params = new URLSearchParams(window.location.search)
      const currentAssetId = getSelectedAssetIdFromLocation()
      if (currentAssetId === nextAssetId) {
        return
      }
      if (nextAssetId) {
        params.set(SELECTED_ASSET_QUERY_KEY, nextAssetId)
      } else {
        params.delete(SELECTED_ASSET_QUERY_KEY)
      }
      const nextSearch = params.toString()
      const nextPathname = nextAssetId
        ? `${REVIEW_BASE_PATH}/${encodeURIComponent(nextAssetId)}`
        : REVIEW_BASE_PATH
      const nextUrl = `${nextPathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`
      if (mode === 'replace') {
        window.history.replaceState(window.history.state, '', nextUrl)
        return
      }
      window.history.pushState(window.history.state, '', nextUrl)
    },
    [],
  )

  const applySelectedAssetId = useCallback(
    (nextAssetId: string | null, mode: 'push' | 'replace' = 'push') => {
      setSelectedAssetId(nextAssetId)
      setSelectionAnchorId(nextAssetId)
      updateSelectedAssetSearchParam(nextAssetId, mode)
    },
    [updateSelectedAssetSearchParam],
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const handlePopState = () => {
      const urlAssetId = getSelectedAssetIdFromLocation()
      const exists = !!urlAssetId && assets.some((asset) => asset.id === urlAssetId)
      if (exists) {
        setSelectedAssetId(urlAssetId)
        setSelectionAnchorId(urlAssetId)
        return
      }
      if (urlAssetId || window.location.pathname !== REVIEW_BASE_PATH) {
        updateSelectedAssetSearchParam(null, 'replace')
      }
      setSelectedAssetId(null)
      setSelectionAnchorId(null)
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [assets, updateSelectedAssetSearchParam])

  return {
    selectedAssetId,
    setSelectedAssetId,
    selectionAnchorId,
    setSelectionAnchorId,
    applySelectedAssetId,
  }
}
