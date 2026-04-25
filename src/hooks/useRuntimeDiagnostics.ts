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
  const [healthError, setHealthError] = useState<string | null>(null)
  const [policyError, setPolicyError] = useState<string | null>(null)
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'partial' | 'error'>(
    enabled ? 'loading' : 'idle',
  )
  const [hasLoaded, setHasLoaded] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  const loadRuntimeDiagnostics = useCallback(async () => {
    if (!enabled) {
      return
    }

    setLoading(true)
    setStatus(null)
    setLoadState('loading')

    try {
      const [healthResult, policyResult] = await Promise.allSettled([
        apiClient.getHealth(),
        apiClient.getAppPolicy(),
      ])

      const nextHealth = healthResult.status === 'fulfilled' ? healthResult.value : null
      const nextPolicy = policyResult.status === 'fulfilled' ? policyResult.value : null
      const nextHealthError =
        healthResult.status === 'rejected'
          ? mapReviewApiErrorToMessage(healthResult.reason, t)
          : null
      const nextPolicyError =
        policyResult.status === 'rejected'
          ? mapReviewApiErrorToMessage(policyResult.reason, t)
          : null

      setHealth(nextHealth)
      setPolicy(nextPolicy)
      setHealthError(nextHealthError)
      setPolicyError(nextPolicyError)

      if (nextHealth && nextPolicy) {
        setLoadState('ready')
        setStatus(
          t('settings.runtimeDiagnosticsLoaded', {
            status: nextHealth.status,
          }),
        )
        setHasLoaded(true)
        return
      }

      if (nextHealth || nextPolicy) {
        setLoadState('partial')
        setStatus(
          t('settings.runtimeDiagnosticsPartial', {
            scope: nextHealth ? t('settings.runtimePolicyLabel') : t('settings.runtimeReadinessLabel'),
            message: nextHealthError ?? nextPolicyError ?? t('settings.runtimeDiagnosticsUnknown'),
          }),
        )
        setHasLoaded(true)
        return
      }

      setLoadState('error')
      setStatus(
        t('settings.runtimeDiagnosticsError', {
          message: [nextHealthError, nextPolicyError]
            .filter((value): value is string => typeof value === 'string' && value.length > 0)
            .join(' / '),
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
    healthError: enabled ? healthError : null,
    policy: enabled ? policy : null,
    policyError: enabled ? policyError : null,
    featureFlags,
    loadState: enabled ? loadState : 'idle',
    hasLoaded: enabled ? hasLoaded : false,
    refresh: () => setReloadToken((current) => current + 1),
  }
}
