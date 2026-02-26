import { useCallback, useEffect, useState } from 'react'
import type { Asset } from '../domain/assets'

type UseAssetRouteSelectionOptions = {
  basePath: string
  queryKey?: string
}

function getAssetIdFromLocationPath(pathname: string, basePath: string): string | null {
  const escapedBasePath = basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = pathname.match(new RegExp(`^${escapedBasePath}/([^/?#]+)`))
  if (!match?.[1]) {
    return null
  }
  return decodeURIComponent(match[1])
}

function getSelectedAssetIdFromLocation(basePath: string, queryKey: string) {
  if (typeof window === 'undefined') {
    return null
  }
  const fromPath = getAssetIdFromLocationPath(window.location.pathname, basePath)
  if (fromPath) {
    return fromPath
  }
  const params = new URLSearchParams(window.location.search)
  return params.get(queryKey)
}

export function useAssetRouteSelection(
  initialAssets: Asset[],
  assets: Asset[],
  { basePath, queryKey = 'asset' }: UseAssetRouteSelectionOptions,
) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(() => {
    const urlAssetId = getSelectedAssetIdFromLocation(basePath, queryKey)
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
      const currentAssetId = getSelectedAssetIdFromLocation(basePath, queryKey)
      if (currentAssetId === nextAssetId) {
        return
      }
      if (nextAssetId) {
        params.set(queryKey, nextAssetId)
      } else {
        params.delete(queryKey)
      }
      const nextSearch = params.toString()
      const nextPathname = nextAssetId
        ? `${basePath}/${encodeURIComponent(nextAssetId)}`
        : basePath
      const nextUrl = `${nextPathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`
      if (mode === 'replace') {
        window.history.replaceState(window.history.state, '', nextUrl)
        return
      }
      window.history.pushState(window.history.state, '', nextUrl)
    },
    [basePath, queryKey],
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
      const urlAssetId = getSelectedAssetIdFromLocation(basePath, queryKey)
      const exists = !!urlAssetId && assets.some((asset) => asset.id === urlAssetId)
      if (exists) {
        setSelectedAssetId(urlAssetId)
        setSelectionAnchorId(urlAssetId)
        return
      }
      if (urlAssetId || window.location.pathname !== basePath) {
        updateSelectedAssetSearchParam(null, 'replace')
      }
      setSelectedAssetId(null)
      setSelectionAnchorId(null)
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [assets, basePath, queryKey, updateSelectedAssetSearchParam])

  return {
    selectedAssetId,
    setSelectedAssetId,
    selectionAnchorId,
    setSelectionAnchorId,
    applySelectedAssetId,
  }
}
