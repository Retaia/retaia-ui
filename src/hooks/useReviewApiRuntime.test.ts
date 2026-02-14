import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useReviewApiRuntime } from './useReviewApiRuntime'

describe('useReviewApiRuntime', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/review')
    window.localStorage.clear()
  })

  it('detects API asset source from URL and manages retry status state', () => {
    window.history.replaceState({}, '', '/review?source=api')
    const { result } = renderHook(() => useReviewApiRuntime())

    expect(result.current.isApiAssetSource).toBe(true)
    expect(result.current.retryStatus).toBeNull()

    act(() => {
      result.current.setRetryStatus('retrying')
    })

    expect(result.current.retryStatus).toBe('retrying')
    expect(result.current.apiClient).toBeDefined()
  })
})
