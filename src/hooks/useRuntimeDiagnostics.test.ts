import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useRuntimeDiagnostics } from './useRuntimeDiagnostics'

function createApiClientMock() {
  return {
    getHealth: vi.fn(),
    getAppPolicy: vi.fn(),
  }
}

describe('useRuntimeDiagnostics', () => {
  it('loads readiness and policy when enabled', async () => {
    const apiClient = createApiClientMock()
    apiClient.getHealth.mockResolvedValue({
      status: 'ok',
      self_healing: {
        active: false,
        deadline_at: null,
        max_self_healing_seconds: 300,
      },
      checks: [],
    })
    apiClient.getAppPolicy.mockResolvedValue({
      server_policy: {
        feature_flags: {
          'features.decisions.bulk': true,
          'features.auth.2fa': false,
        },
      },
    })
    const t = vi.fn((key: string) => key)

    const { result } = renderHook(() =>
      useRuntimeDiagnostics({
        apiClient,
        t,
        enabled: true,
      }),
    )

    await waitFor(() => {
      expect(result.current.health?.status).toBe('ok')
    })

    expect(result.current.featureFlags).toEqual([
      ['features.decisions.bulk', true],
      ['features.auth.2fa', false],
    ])
    expect(result.current.status).toBe('settings.runtimeDiagnosticsLoaded')
    expect(result.current.loadState).toBe('ready')
    expect(result.current.healthError).toBeNull()
    expect(result.current.policyError).toBeNull()
  })

  it('does not load when disabled', () => {
    const apiClient = createApiClientMock()
    const t = vi.fn((key: string) => key)

    const { result } = renderHook(() =>
      useRuntimeDiagnostics({
        apiClient,
        t,
        enabled: false,
      }),
    )

    expect(result.current.loading).toBe(false)
    expect(result.current.loadState).toBe('idle')
    expect(apiClient.getHealth).not.toHaveBeenCalled()
    expect(apiClient.getAppPolicy).not.toHaveBeenCalled()
  })

  it('keeps successful diagnostics visible when the companion request fails', async () => {
    const apiClient = createApiClientMock()
    apiClient.getHealth.mockResolvedValue({
      status: 'degraded',
      self_healing: {
        active: true,
        deadline_at: null,
        max_self_healing_seconds: 120,
      },
      checks: [],
    })
    apiClient.getAppPolicy.mockRejectedValue({
      status: 503,
      payload: { code: 'TEMPORARY_UNAVAILABLE' },
    })
    const t = vi.fn((key: string) => key)

    const { result } = renderHook(() =>
      useRuntimeDiagnostics({
        apiClient,
        t,
        enabled: true,
      }),
    )

    await waitFor(() => {
      expect(result.current.loadState).toBe('partial')
    })

    expect(result.current.health?.status).toBe('degraded')
    expect(result.current.policy).toBeNull()
    expect(result.current.healthError).toBeNull()
    expect(result.current.policyError).toBe('error.temporary')
    expect(result.current.status).toBe('settings.runtimeDiagnosticsPartial')
  })
})
