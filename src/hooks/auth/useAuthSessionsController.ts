import { useCallback, useEffect, useState } from 'react'
import type { ApiClient } from '../../api/client'
import { mapReviewApiErrorToMessage } from '../../infrastructure/review/apiReviewErrorAdapter'

type Status = {
  kind: 'success' | 'error'
  message: string
}

type AuthSessionClient = Pick<
  ApiClient,
  'listAuthSessions' | 'revokeAuthSession' | 'revokeOtherAuthSessions'
>

type AuthSessionView = {
  sessionId: string
  clientId: string
  createdAt: string
  lastUsedAt: string
  expiresAt: string | null
  isCurrent: boolean
  deviceLabel: string | null
  browser: string | null
  os: string | null
  ipAddressLastSeen: string | null
}

function normalizeSessions(
  payload: Awaited<ReturnType<AuthSessionClient['listAuthSessions']>>['items'],
): AuthSessionView[] {
  return payload.map((session) => ({
    sessionId: session.session_id,
    clientId: session.client_id,
    createdAt: session.created_at,
    lastUsedAt: session.last_used_at,
    expiresAt: session.expires_at ?? null,
    isCurrent: session.is_current,
    deviceLabel: typeof session.device_label === 'string' ? session.device_label : null,
    browser: typeof session.browser === 'string' ? session.browser : null,
    os: typeof session.os === 'string' ? session.os : null,
    ipAddressLastSeen:
      typeof session.ip_address_last_seen === 'string' ? session.ip_address_last_seen : null,
  }))
}

export function useAuthSessionsController(args: {
  apiClient: AuthSessionClient
  t: (key: string, values?: Record<string, unknown>) => string
  enabled: boolean
}) {
  const { apiClient, t, enabled } = args
  const [sessions, setSessions] = useState<AuthSessionView[]>([])
  const [loading, setLoading] = useState(false)
  const [busySessionId, setBusySessionId] = useState<string | null>(null)
  const [revokingOthers, setRevokingOthers] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)

  const loadSessions = useCallback(async () => {
    if (!enabled) {
      setSessions([])
      return
    }
    setLoading(true)
    try {
      const result = await apiClient.listAuthSessions()
      setSessions(normalizeSessions(result.items))
    } catch (error) {
      setStatus({
        kind: 'error',
        message: t('account.sessionsLoadError', {
          message: mapReviewApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setLoading(false)
    }
  }, [apiClient, enabled, t])

  useEffect(() => {
    void loadSessions()
  }, [loadSessions])

  const revokeSession = useCallback(async (sessionId: string) => {
    setBusySessionId(sessionId)
    setStatus(null)
    try {
      await apiClient.revokeAuthSession(sessionId)
      setSessions((current) => current.filter((session) => session.sessionId !== sessionId))
      setStatus({
        kind: 'success',
        message: t('account.sessionRevokeDone'),
      })
    } catch (error) {
      setStatus({
        kind: 'error',
        message: t('account.sessionRevokeError', {
          message: mapReviewApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setBusySessionId(null)
    }
  }, [apiClient, t])

  const revokeOthers = useCallback(async () => {
    setRevokingOthers(true)
    setStatus(null)
    try {
      const result = await apiClient.revokeOtherAuthSessions()
      setSessions((current) => current.filter((session) => session.isCurrent))
      setStatus({
        kind: 'success',
        message: t('account.revokeOthersDone', { count: result.revoked }),
      })
    } catch (error) {
      setStatus({
        kind: 'error',
        message: t('account.revokeOthersError', {
          message: mapReviewApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setRevokingOthers(false)
    }
  }, [apiClient, t])

  return {
    sessions,
    loading,
    busySessionId,
    revokingOthers,
    status,
    loadSessions,
    revokeSession,
    revokeOthers,
  }
}
