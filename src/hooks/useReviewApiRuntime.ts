import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApiClient } from './useApiClient'
import { readStoredApiBaseUrl, readStoredApiToken, readStoredAssetSource } from '../services/apiSession'

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
    const envSource = String(import.meta.env.VITE_ASSET_SOURCE ?? '')
      .trim()
      .toLowerCase()
    if (envSource === 'api') {
      return true
    }
    if (envSource === 'mock') {
      return false
    }
    if (typeof window === 'undefined') {
      return false
    }
    const params = new URLSearchParams(window.location.search)
    const sourceFromQuery = params.get('source')
    if (sourceFromQuery === 'api') {
      return true
    }
    if (sourceFromQuery === 'mock') {
      return false
    }
    return readStoredAssetSource() === 'api'
  }, [])

  return {
    apiClient,
    apiRuntimeKey,
    isApiAssetSource,
    retryStatus,
    setRetryStatus,
  }
}
