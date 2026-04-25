import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAuthSessionsController } from './useAuthSessionsController'

function createApiClientMock() {
  return {
    listAuthSessions: vi.fn(),
    revokeAuthSession: vi.fn(),
    revokeOtherAuthSessions: vi.fn(),
  }
}

describe('useAuthSessionsController', () => {
  it('loads sessions when enabled', async () => {
    const apiClient = createApiClientMock()
    const t = vi.fn((key: string) => key)
    apiClient.listAuthSessions.mockResolvedValue({
      items: [
        {
          session_id: 'sess-1',
          client_id: 'client-1',
          created_at: '2026-04-01T10:00:00Z',
          last_used_at: '2026-04-02T10:00:00Z',
          is_current: true,
        },
      ],
    })

    const { result } = renderHook(() =>
      useAuthSessionsController({
        apiClient,
        t,
        enabled: true,
      }),
    )

    await waitFor(() => {
      expect(result.current.sessions[0]?.sessionId).toBe('sess-1')
    })
    expect(result.current.availability).toBe('ready')
  })

  it('removes one session after revoke', async () => {
    const apiClient = createApiClientMock()
    const t = vi.fn((key: string) => key)
    apiClient.listAuthSessions.mockResolvedValue({
      items: [
        {
          session_id: 'sess-1',
          client_id: 'client-1',
          created_at: '2026-04-01T10:00:00Z',
          last_used_at: '2026-04-02T10:00:00Z',
          is_current: false,
        },
      ],
    })
    apiClient.revokeAuthSession.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useAuthSessionsController({
        apiClient,
        t,
        enabled: true,
      }),
    )

    await waitFor(() => {
      expect(result.current.sessions).toHaveLength(1)
    })

    await act(async () => {
      await result.current.revokeSession('sess-1')
    })

    expect(result.current.sessions).toHaveLength(0)
  })

  it('stays unavailable and blocks actions when disabled', async () => {
    const apiClient = createApiClientMock()
    const t = vi.fn((key: string) => key)

    const { result } = renderHook(() =>
      useAuthSessionsController({
        apiClient,
        t,
        enabled: false,
      }),
    )

    expect(result.current.availability).toBe('signed_out')

    await act(async () => {
      await result.current.loadSessions()
      await result.current.revokeSession('sess-1')
      await result.current.revokeOthers()
    })

    expect(apiClient.listAuthSessions).not.toHaveBeenCalled()
    expect(apiClient.revokeAuthSession).not.toHaveBeenCalled()
    expect(apiClient.revokeOtherAuthSessions).not.toHaveBeenCalled()
    expect(result.current.status).toEqual({
      kind: 'error',
      message: 'account.sessionsUnavailable',
    })
  })
})
