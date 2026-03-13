import { act, renderHook } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { Provider } from 'react-redux'
import { createAppStore } from '../store'
import { useReviewApiRuntime } from './useReviewApiRuntime'

describe('useReviewApiRuntime', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/review')
    window.localStorage.clear()
  })

  it('detects API asset source from URL and manages retry status state', () => {
    window.history.replaceState({}, '', '/review?source=api')
    const store = createAppStore()
    const wrapper = ({ children }: { children: ReactNode }) => createElement(Provider, { store, children })
    const { result } = renderHook(() => useReviewApiRuntime(), { wrapper })

    expect(result.current.isApiAssetSource).toBe(true)
    expect(result.current.retryStatus).toBeNull()

    act(() => {
      result.current.setRetryStatus('retrying')
    })

    expect(result.current.retryStatus).toBe('retrying')
    expect(result.current.apiClient).toBeDefined()
  })

  it('falls back to stored asset source when query param is absent', () => {
    window.localStorage.setItem('retaia_asset_source', 'api')
    const store = createAppStore()
    const wrapper = ({ children }: { children: ReactNode }) => createElement(Provider, { store, children })
    const { result } = renderHook(() => useReviewApiRuntime(), { wrapper })

    expect(result.current.isApiAssetSource).toBe(true)
  })
})
