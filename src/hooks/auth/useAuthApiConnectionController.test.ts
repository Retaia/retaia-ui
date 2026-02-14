import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthApiConnectionController } from './useAuthApiConnectionController'
import { useState } from 'react'

describe('useAuthApiConnectionController', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('persists trimmed base url', () => {
    const apiClient = {
      getCurrentUser: vi.fn(),
    }
    const setApiBaseUrlInput = vi.fn()
    const { result } = renderHook(() => {
      const [status, setStatus] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)
      return {
        ...useAuthApiConnectionController({
          apiClient,
          t: (key) => key,
          apiBaseUrlInput: '  /api/v2  ',
          setApiBaseUrlInput,
          setApiConnectionStatus: setStatus,
        }),
        status,
      }
    })

    act(() => {
      result.current.saveApiConnectionSettings()
    })

    expect(window.localStorage.getItem('retaia_api_base_url')).toBe('/api/v2')
    expect(result.current.status).toEqual({
      kind: 'success',
      message: 'app.apiConnectionSaved',
    })
  })

  it('returns success status on test connection', async () => {
    const apiClient = {
      getCurrentUser: vi.fn().mockResolvedValue({}),
    }
    const { result } = renderHook(() => {
      const [status, setStatus] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)
      return {
        ...useAuthApiConnectionController({
          apiClient,
          t: (key) => key,
          apiBaseUrlInput: '/api',
          setApiBaseUrlInput: vi.fn(),
          setApiConnectionStatus: setStatus,
        }),
        status,
      }
    })

    await act(async () => {
      await result.current.testApiConnection()
    })

    expect(result.current.status).toEqual({
      kind: 'success',
      message: 'app.apiConnectionTestOk',
    })
  })
})
