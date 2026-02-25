import { useMemo } from 'react'
import { type ApiClient, createApiClient } from '../api/client'
import { createInMemoryMockApiFetch, isAppEnvTest } from '../api/mockDb'

type RuntimeConfig = {
  API_BASE_URL?: string
  API_TOKEN?: string
}

declare global {
  interface Window {
    __RETAIA_RUNTIME_CONFIG__?: RuntimeConfig
  }
}

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
  apiRuntimeKey: string
  effectiveApiBaseUrl: string
  effectiveApiToken: string | null
  isApiBaseUrlLockedByEnv: boolean
  isApiAuthLockedByEnv: boolean
  isApiConfigLockedByEnv: boolean
  shouldUseInMemoryMockDb: boolean
}

function readRuntimeConfig(): RuntimeConfig {
  if (typeof window === 'undefined') {
    return {}
  }
  return window.__RETAIA_RUNTIME_CONFIG__ ?? {}
}

export function useApiClient({
  apiBaseUrlInput,
  apiTokenInput,
  onAuthError,
  onRetry,
  retry,
}: UseApiClientOptions): UseApiClientResult {
  const runtimeConfig = readRuntimeConfig()
  const runtimeApiBaseUrl = runtimeConfig.API_BASE_URL?.trim()
  const runtimeApiToken = runtimeConfig.API_TOKEN?.trim()

  const effectiveApiBaseUrl =
    runtimeApiBaseUrl || import.meta.env.VITE_API_BASE_URL || apiBaseUrlInput.trim() || '/api/v1'
  const effectiveApiToken =
    runtimeApiToken || import.meta.env.VITE_API_TOKEN || apiTokenInput.trim() || null
  const isApiBaseUrlLockedByEnv = !!runtimeApiBaseUrl || !!import.meta.env.VITE_API_BASE_URL
  const isApiAuthLockedByEnv = !!runtimeApiToken || !!import.meta.env.VITE_API_TOKEN
  const shouldUseInMemoryMockDb = isAppEnvTest(import.meta.env as Record<string, unknown>)
  const apiRuntimeKey = `${effectiveApiBaseUrl}::${effectiveApiToken ? 'token' : 'no-token'}::${shouldUseInMemoryMockDb ? 'mock' : 'api'}`

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
    apiRuntimeKey,
    effectiveApiBaseUrl,
    effectiveApiToken,
    isApiBaseUrlLockedByEnv,
    isApiAuthLockedByEnv,
    isApiConfigLockedByEnv: isApiBaseUrlLockedByEnv || isApiAuthLockedByEnv,
    shouldUseInMemoryMockDb,
  }
}
