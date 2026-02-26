import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { INITIAL_ASSETS } from '../data/mockAssets'
import { useAssetRouteSelection } from './useAssetRouteSelection'

describe('useAssetRouteSelection', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/library')
  })

  it('reads selected asset from URL and syncs selection on library base path', () => {
    const firstId = INITIAL_ASSETS[1]?.id
    expect(firstId).toBeTruthy()
    window.history.replaceState({}, '', `/library/${firstId}`)

    const { result } = renderHook(() =>
      useAssetRouteSelection(INITIAL_ASSETS, INITIAL_ASSETS, { basePath: '/library' }),
    )

    expect(result.current.selectedAssetId).toBe(firstId)

    act(() => {
      result.current.applySelectedAssetId(null)
    })

    expect(result.current.selectedAssetId).toBeNull()
    expect(window.location.pathname).toBe('/library')
  })
})
