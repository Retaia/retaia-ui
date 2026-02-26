import { act, renderHook } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it } from 'vitest'
import { i18next } from '../../i18n'
import { useAuthPageApiState } from './useAuthPageApiState'
import { createAppStore } from '../../store'
import { setApiBaseUrlInput, setApiTokenInput } from '../../store/slices/authUiSlice'

describe('useAuthPageApiState', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('initializes api inputs from redux auth state', () => {
    const store = createAppStore()
    store.dispatch(setApiTokenInput('token-123'))
    store.dispatch(setApiBaseUrlInput('/api/custom'))
    const wrapper = ({ children }: { children: ReactNode }) => createElement(Provider, { store, children })
    const { result } = renderHook(() => useAuthPageApiState({ t: i18next.t.bind(i18next) }), { wrapper })

    expect(result.current.apiTokenInput).toBe('token-123')
    expect(result.current.apiBaseUrlInput).toBe('/api/custom')
  })

  it('exposes retry and auth error callbacks for api runtime feedback', () => {
    const store = createAppStore()
    const wrapper = ({ children }: { children: ReactNode }) => createElement(Provider, { store, children })
    const { result } = renderHook(() => useAuthPageApiState({ t: i18next.t.bind(i18next) }), { wrapper })

    act(() => {
      result.current.handleApiRetry({ attempt: 2, maxRetries: 3 })
    })

    expect(result.current.retryStatus).toContain('2')
    expect(result.current.retryStatus).toContain('4')

    act(() => {
      result.current.handleApiAuthError()
    })

    expect(result.current.apiConnectionStatus).toEqual({
      kind: 'error',
      message: i18next.t('app.apiConnectionAuthError'),
    })
  })
})
