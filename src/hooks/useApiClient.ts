import { useMemo } from 'react'
import { type ApiClient, createApiClient } from '../api/client'
import { createInMemoryMockApiFetch, isAppEnvTest } from '../api/mockDb'

type UseApiClientOptions = {
  apiBaseUrlInput: string
  apiTokenInput: string
  onAuthError?: () => void
  onRetry?: (context: { attempt: number; maxRetries: number }) => void
  retry?: {
    maxRetries?: number
    baseDelayMs?: number
  }
}

type UseApiClientResult = {
  apiClient: ApiClient
  effectiveApiBaseUrl: string
  effectiveApiToken: string | null
  isApiBaseUrlLockedByEnv: boolean
  isApiAuthLockedByEnv: boolean
  isApiConfigLockedByEnv: boolean
  shouldUseInMemoryMockDb: boolean
}

export function useApiClient({
  apiBaseUrlInput,
  apiTokenInput,
  onAuthError,
  onRetry,
  retry,
}: UseApiClientOptions): UseApiClientResult {
  const effectiveApiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ?? (apiBaseUrlInput.trim() || '/api/v1')
  const effectiveApiToken = import.meta.env.VITE_API_TOKEN ?? (apiTokenInput.trim() || null)
  const isApiBaseUrlLockedByEnv = !!import.meta.env.VITE_API_BASE_URL
  const isApiAuthLockedByEnv = !!import.meta.env.VITE_API_TOKEN
  const shouldUseInMemoryMockDb = isAppEnvTest(import.meta.env as Record<string, unknown>)

  const apiClient = useMemo(
    () =>
      createApiClient({
        baseUrl: effectiveApiBaseUrl,
        fetchImpl: shouldUseInMemoryMockDb ? createInMemoryMockApiFetch() : undefined,
        getAccessToken: () => effectiveApiToken,
        onAuthError,
        onRetry,
        retry: {
          maxRetries: retry?.maxRetries ?? 2,
          baseDelayMs: retry?.baseDelayMs ?? 50,
        },
      }),
    [effectiveApiBaseUrl, effectiveApiToken, onAuthError, onRetry, retry, shouldUseInMemoryMockDb],
  )

  return {
    apiClient,
    effectiveApiBaseUrl,
    effectiveApiToken,
    isApiBaseUrlLockedByEnv,
    isApiAuthLockedByEnv,
    isApiConfigLockedByEnv: isApiBaseUrlLockedByEnv || isApiAuthLockedByEnv,
    shouldUseInMemoryMockDb,
  }
}
