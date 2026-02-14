import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/client'
import { useAuthSessionController } from './useAuthSessionController'

function createApiClientMock() {
  return {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    getUserFeatures: vi.fn(),
  }
}

describe('useAuthSessionController', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('initializes login email from localStorage', () => {
    window.localStorage.setItem('retaia_auth_email', 'agent@retaia.test')
    const apiClient = createApiClientMock()

    const t = vi.fn((key: string) => key)
    const { result } = renderHook(() =>
      useAuthSessionController({
        apiClient,
        t,
        effectiveApiToken: '',
        isApiAuthLockedByEnv: false,
        setApiTokenInput: vi.fn(),
      }),
    )

    expect(result.current.authEmailInput).toBe('agent@retaia.test')
  })

  it('clears persisted token and reports expired session on 401 refresh', async () => {
    window.localStorage.setItem('retaia_api_token', 'old-token')
    const apiClient = createApiClientMock()
    apiClient.getCurrentUser.mockRejectedValue(
      new ApiError(401, 'Unauthorized', {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
        retryable: false,
        correlation_id: 'corr-1',
      }),
    )

    const setApiTokenInput = vi.fn()
    const t = vi.fn((key: string) => key)
    const { result } = renderHook(() =>
      useAuthSessionController({
        apiClient,
        t,
        effectiveApiToken: 'old-token',
        isApiAuthLockedByEnv: false,
        setApiTokenInput,
      }),
    )

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(setApiTokenInput).toHaveBeenCalledWith('')
    expect(window.localStorage.getItem('retaia_api_token')).toBeNull()
    expect(result.current.authStatus).toEqual({
      kind: 'error',
      message: 'app.authSessionExpired',
    })
  })
})
