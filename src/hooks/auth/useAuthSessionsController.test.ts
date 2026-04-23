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
})
