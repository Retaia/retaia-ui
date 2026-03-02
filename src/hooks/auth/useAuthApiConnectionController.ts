import { useCallback } from 'react'
import { type ApiClient } from '../../api/client'
import { mapApiErrorToMessage } from '../../api/errorMapping'

type Translator = (key: string, options?: Record<string, unknown>) => string

type ApiConnectionStatus = {
  kind: 'success' | 'error'
  message: string
}

export function useAuthApiConnectionController(args: {
  apiClient: Pick<ApiClient, 'getCurrentUser'> & Partial<Pick<ApiClient, 'getHealth'>>
  t: Translator
  apiBaseUrlInput: string
  setApiBaseUrlInput: (value: string) => void
  setApiConnectionStatus: (value: ApiConnectionStatus | null) => void
}) {
  const { apiBaseUrlInput, apiClient, setApiBaseUrlInput, setApiConnectionStatus, t } = args

  const saveApiConnectionSettings = useCallback(() => {
    setApiBaseUrlInput(apiBaseUrlInput.trim())
    setApiConnectionStatus({
      kind: 'success',
      message: t('app.apiConnectionSaved'),
    })
  }, [apiBaseUrlInput, setApiBaseUrlInput, setApiConnectionStatus, t])

  const clearApiConnectionSettings = useCallback(() => {
    setApiBaseUrlInput('')
    setApiConnectionStatus({
      kind: 'success',
      message: t('app.apiConnectionCleared'),
    })
  }, [setApiBaseUrlInput, setApiConnectionStatus, t])

  const testApiConnection = useCallback(async () => {
    setApiConnectionStatus(null)
    try {
      let degradedSelfHealingDeadline: string | null = null
      if (typeof apiClient.getHealth === 'function') {
        try {
          const health = await apiClient.getHealth()
          if (health.status === 'down') {
            setApiConnectionStatus({
              kind: 'error',
              message: t('app.apiConnectionHealthDown'),
            })
            return
          }
          if (health.status === 'degraded' && health.self_healing.active) {
            degradedSelfHealingDeadline = health.self_healing.deadline_at
          }
        } catch {
          // Keep backward-compatible behavior when /health is unavailable.
        }
      }

      await apiClient.getCurrentUser()
      setApiConnectionStatus({
        kind: 'success',
        message:
          degradedSelfHealingDeadline !== null
            ? t('app.apiConnectionTestOkDegraded', { deadline: degradedSelfHealingDeadline })
            : t('app.apiConnectionTestOk'),
      })
    } catch (error) {
      setApiConnectionStatus({
        kind: 'error',
        message: t('app.apiConnectionTestError', {
          message: mapApiErrorToMessage(error, t),
        }),
      })
    }
  }, [apiClient, setApiConnectionStatus, t])

  return {
    saveApiConnectionSettings,
    clearApiConnectionSettings,
    testApiConnection,
  }
}
