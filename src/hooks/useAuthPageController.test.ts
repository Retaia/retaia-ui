import { act, renderHook } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { Provider } from 'react-redux'
import { useAuthPageController } from './useAuthPageController'
import { createAppStore } from '../store'
import { setAuthEmailInput, setApiBaseUrlInput } from '../store/slices/authUiSlice'

describe('useAuthPageController', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('initializes inputs from auth state and normalizes api base url on save', () => {
    const store = createAppStore()
    store.dispatch(setApiBaseUrlInput('/api/custom'))
    store.dispatch(setAuthEmailInput('agent@retaia.test'))
    const wrapper = ({ children }: { children: ReactNode }) => createElement(Provider, { store, children })
    const { result } = renderHook(() => useAuthPageController(), { wrapper })

    expect(result.current.apiBaseUrlInput).toBe('/api/custom')
    expect(result.current.authEmailInput).toBe('agent@retaia.test')

    act(() => {
      result.current.setApiBaseUrlInput('  /api/v2  ')
    })

    act(() => {
      result.current.saveApiConnectionSettings()
    })

    expect(result.current.apiBaseUrlInput).toBe('/api/v2')
  })
})
