import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AppPolicyResponse, HealthResponse } from '../api/contracts'
import { mapReviewApiErrorToMessage } from '../infrastructure/review/apiReviewErrorAdapter'

type ApiClient = {
  getHealth: () => Promise<HealthResponse>
  getAppPolicy: () => Promise<AppPolicyResponse>
}

type Translate = (key: string, values?: Record<string, string | number>) => string

type Params = {
  apiClient: ApiClient
  t: Translate
  enabled: boolean
}

export function useRuntimeDiagnostics({ apiClient, t, enabled }: Params) {
  const [loading, setLoading] = useState(enabled)
  const [status, setStatus] = useState<string | null>(null)
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [policy, setPolicy] = useState<AppPolicyResponse | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  const loadRuntimeDiagnostics = useCallback(async () => {
    if (!enabled) {
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      const [nextHealth, nextPolicy] = await Promise.all([
        apiClient.getHealth(),
        apiClient.getAppPolicy(),
      ])
      setHealth(nextHealth)
      setPolicy(nextPolicy)
      setStatus(
        t('settings.runtimeDiagnosticsLoaded', {
          status: nextHealth.status,
        }),
      )
      setHasLoaded(true)
    } catch (error) {
      setStatus(
        t('settings.runtimeDiagnosticsError', {
          message: mapReviewApiErrorToMessage(error, t),
        }),
      )
    } finally {
      setLoading(false)
    }
  }, [apiClient, enabled, t])

  useEffect(() => {
    if (!enabled) {
      return
    }

    queueMicrotask(() => {
      void loadRuntimeDiagnostics()
    })
  }, [enabled, loadRuntimeDiagnostics, reloadToken])

  const featureFlags = useMemo(
    () => Object.entries(policy?.server_policy.feature_flags ?? {}),
    [policy],
  )

  return {
    loading: enabled ? loading : false,
    status: enabled ? status : null,
    health: enabled ? health : null,
    policy: enabled ? policy : null,
    featureFlags,
    hasLoaded: enabled ? hasLoaded : false,
    refresh: () => setReloadToken((current) => current + 1),
  }
}
