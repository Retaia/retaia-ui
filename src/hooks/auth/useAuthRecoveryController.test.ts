import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAuthRecoveryController } from './useAuthRecoveryController'

function createApiClientMock() {
  return {
    requestLostPassword: vi.fn(),
    resetLostPassword: vi.fn(),
    requestEmailVerification: vi.fn(),
    confirmEmailVerification: vi.fn(),
    adminConfirmEmailVerification: vi.fn(),
  }
}

describe('useAuthRecoveryController', () => {
  it('returns validation error when lost password request email is empty', async () => {
    const apiClient = createApiClientMock()
    const { result } = renderHook(() =>
      useAuthRecoveryController({
        apiClient,
        t: (key) => key,
      }),
    )

    await act(async () => {
      await result.current.handleLostPasswordRequest()
    })

    expect(result.current.lostPasswordStatus).toEqual({
      kind: 'error',
      message: 'app.authLostPasswordEmailRequired',
    })
    expect(apiClient.requestLostPassword).not.toHaveBeenCalled()
  })

  it('clears verify email token input after successful confirmation', async () => {
    const apiClient = createApiClientMock()
    apiClient.confirmEmailVerification.mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useAuthRecoveryController({
        apiClient,
        t: (key) => key,
      }),
    )

    act(() => {
      result.current.setVerifyEmailTokenInput('tok-123')
    })

    await act(async () => {
      await result.current.handleVerifyEmailConfirm()
    })

    expect(result.current.verifyEmailTokenInput).toBe('')
    expect(result.current.verifyEmailStatus).toEqual({
      kind: 'success',
      message: 'app.authVerifyEmailConfirmed',
    })
  })
})
