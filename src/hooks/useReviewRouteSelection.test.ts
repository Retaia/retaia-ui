import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { INITIAL_ASSETS } from '../data/mockAssets'
import { useReviewRouteSelection } from './useReviewRouteSelection'

describe('useReviewRouteSelection', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/review')
  })

  it('reads selected asset from URL and keeps route in sync on selection changes', () => {
    const firstId = INITIAL_ASSETS[0]?.id
    const secondId = INITIAL_ASSETS[1]?.id
    expect(firstId).toBeTruthy()
    expect(secondId).toBeTruthy()

    window.history.replaceState({}, '', `/review/${firstId}`)
    const { result } = renderHook(() => useReviewRouteSelection(INITIAL_ASSETS, INITIAL_ASSETS))

    expect(result.current.selectedAssetId).toBe(firstId)

    act(() => {
      result.current.applySelectedAssetId(secondId ?? null)
    })

    expect(result.current.selectedAssetId).toBe(secondId)
    expect(window.location.pathname).toBe(`/review/${secondId}`)
    expect(window.location.search).toContain(`asset=${encodeURIComponent(secondId ?? '')}`)
  })
})
