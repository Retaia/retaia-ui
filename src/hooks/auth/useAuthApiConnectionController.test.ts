import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthApiConnectionController } from './useAuthApiConnectionController'
import { useState } from 'react'

describe('useAuthApiConnectionController', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('normalizes base url on save', () => {
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

    expect(setApiBaseUrlInput).toHaveBeenCalledWith('/api/v2')
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

  it('returns health down status and skips current user call', async () => {
    const apiClient = {
      getHealth: vi.fn().mockResolvedValue({
        status: 'down',
        self_healing: {
          active: false,
          deadline_at: null,
          max_self_healing_seconds: 300,
        },
      }),
      getCurrentUser: vi.fn(),
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

    expect(apiClient.getCurrentUser).not.toHaveBeenCalled()
    expect(result.current.status).toEqual({
      kind: 'error',
      message: 'app.apiConnectionHealthDown',
    })
  })

  it('returns degraded success status when self-healing is active', async () => {
    const apiClient = {
      getHealth: vi.fn().mockResolvedValue({
        status: 'degraded',
        self_healing: {
          active: true,
          deadline_at: '2026-03-02T12:00:00Z',
          max_self_healing_seconds: 300,
        },
      }),
      getCurrentUser: vi.fn().mockResolvedValue({}),
    }
    const { result } = renderHook(() => {
      const [status, setStatus] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)
      return {
        ...useAuthApiConnectionController({
          apiClient,
          t: (key, options) =>
            key === 'app.apiConnectionTestOkDegraded'
              ? `${key}:${String(options?.deadline ?? '')}`
              : key,
          locale: 'en-GB',
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

    expect(result.current.status?.kind).toBe('success')
    expect(result.current.status?.message).toContain('app.apiConnectionTestOkDegraded:')
    expect(result.current.status?.message).not.toContain('2026-03-02T12:00:00Z')
  })
})
