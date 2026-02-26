import { act, renderHook } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { Provider } from 'react-redux'
import { useAuthPageController } from './useAuthPageController'
import { createAppStore } from '../store'

describe('useAuthPageController', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('initializes inputs from localStorage and persists api base url changes', () => {
    window.localStorage.setItem('retaia_api_base_url', '/api/custom')
    window.localStorage.setItem('retaia_auth_email', 'agent@retaia.test')

    const store = createAppStore()
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

    expect(window.localStorage.getItem('retaia_api_base_url')).toBe('/api/v2')
  })
})
