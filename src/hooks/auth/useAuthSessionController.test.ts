import { act, renderHook } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/client'
import { useAuthSessionController } from './useAuthSessionController'
import { createAppStore } from '../../store'
import { setAuthEmailInput } from '../../store/slices/authUiSlice'

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

  it('initializes login email from redux auth state', () => {
    const apiClient = createApiClientMock()

    const t = vi.fn((key: string) => key)
    const store = createAppStore()
    store.dispatch(setAuthEmailInput('agent@retaia.test'))
    const wrapper = ({ children }: { children: ReactNode }) => createElement(Provider, { store, children })
    const { result } = renderHook(
      () =>
        useAuthSessionController({
          apiClient,
          t,
          effectiveApiToken: '',
          isApiAuthLockedByEnv: false,
          setApiTokenInput: vi.fn(),
        }),
      { wrapper },
    )

    expect(result.current.authEmailInput).toBe('agent@retaia.test')
  })

  it('clears in-memory token and reports expired session on 401 refresh', async () => {
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
    const store = createAppStore()
    const wrapper = ({ children }: { children: ReactNode }) => createElement(Provider, { store, children })
    const { result } = renderHook(
      () =>
        useAuthSessionController({
          apiClient,
          t,
          effectiveApiToken: 'old-token',
          isApiAuthLockedByEnv: false,
          setApiTokenInput,
        }),
      { wrapper },
    )

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(setApiTokenInput).toHaveBeenCalledWith('')
    expect(result.current.authStatus).toEqual({
      kind: 'error',
      message: 'app.authSessionExpired',
    })
  })
})
