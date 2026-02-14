import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { i18next } from '../../i18n'
import { useAuthPageApiState } from './useAuthPageApiState'

describe('useAuthPageApiState', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('initializes api inputs from persisted storage', () => {
    window.localStorage.setItem('retaia_api_token', 'token-123')
    window.localStorage.setItem('retaia_api_base_url', '/api/custom')

    const { result } = renderHook(() => useAuthPageApiState({ t: i18next.t.bind(i18next) }))

    expect(result.current.apiTokenInput).toBe('token-123')
    expect(result.current.apiBaseUrlInput).toBe('/api/custom')
  })

  it('exposes retry and auth error callbacks for api runtime feedback', () => {
    const { result } = renderHook(() => useAuthPageApiState({ t: i18next.t.bind(i18next) }))

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
