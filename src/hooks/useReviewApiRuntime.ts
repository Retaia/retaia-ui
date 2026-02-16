import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApiClient } from './useApiClient'
import { readStoredApiBaseUrl, readStoredApiToken } from '../services/apiSession'

export function useReviewApiRuntime() {
  const { t } = useTranslation()
  const [retryStatus, setRetryStatus] = useState<string | null>(null)
  const [apiTokenInput] = useState(readStoredApiToken)
  const [apiBaseUrlInput] = useState(readStoredApiBaseUrl)
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
  const { apiClient, apiRuntimeKey } = useApiClient({
    apiBaseUrlInput,
    apiTokenInput,
    onRetry: handleApiRetry,
  })

  const isApiAssetSource = useMemo(() => {
    if (import.meta.env.VITE_ASSET_SOURCE === 'api') {
      return true
    }
    if (typeof window === 'undefined') {
      return false
    }
    const params = new URLSearchParams(window.location.search)
    return params.get('source') === 'api'
  }, [])

  return {
    apiClient,
    apiRuntimeKey,
    isApiAssetSource,
    retryStatus,
    setRetryStatus,
  }
}
