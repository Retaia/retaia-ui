import { useCallback, useState } from 'react'
import type { TFunction } from 'i18next'
import { readStoredApiBaseUrl, readStoredApiToken } from '../../services/apiSession'

export type ApiConnectionStatus = {
  kind: 'success' | 'error'
  message: string
}

type UseAuthPageApiStateParams = {
  t: TFunction
}

export function useAuthPageApiState({ t }: UseAuthPageApiStateParams) {
  const [retryStatus, setRetryStatus] = useState<string | null>(null)
  const [apiTokenInput, setApiTokenInput] = useState(readStoredApiToken)
  const [apiBaseUrlInput, setApiBaseUrlInput] = useState(readStoredApiBaseUrl)
  const [apiConnectionStatus, setApiConnectionStatus] = useState<ApiConnectionStatus | null>(null)

  const handleApiAuthError = useCallback(() => {
    setApiConnectionStatus({
      kind: 'error',
      message: t('app.apiConnectionAuthError'),
    })
  }, [t])

  const handleApiRetry = useCallback(
    ({ attempt, maxRetries }: { attempt: number; maxRetries: number }) => {
      setRetryStatus(
        t('actions.retrying', {
          attempt,
          total: maxRetries + 1,
        }),
      )
    },
    [t],
  )

  return {
    retryStatus,
    apiTokenInput,
    setApiTokenInput,
    apiBaseUrlInput,
    setApiBaseUrlInput,
    apiConnectionStatus,
    setApiConnectionStatus,
    handleApiAuthError,
    handleApiRetry,
  }
}
