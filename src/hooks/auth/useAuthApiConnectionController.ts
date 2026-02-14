import { useCallback, type Dispatch, type SetStateAction } from 'react'
import { type ApiClient } from '../../api/client'
import { mapApiErrorToMessage } from '../../api/errorMapping'
import { clearApiBaseUrl, persistApiBaseUrl } from '../../services/apiSession'

type Translator = (key: string, options?: Record<string, unknown>) => string

type ApiConnectionStatus = {
  kind: 'success' | 'error'
  message: string
}

export function useAuthApiConnectionController(args: {
  apiClient: Pick<ApiClient, 'getCurrentUser'>
  t: Translator
  apiBaseUrlInput: string
  setApiBaseUrlInput: Dispatch<SetStateAction<string>>
  setApiConnectionStatus: Dispatch<SetStateAction<ApiConnectionStatus | null>>
}) {
  const { apiBaseUrlInput, apiClient, setApiBaseUrlInput, setApiConnectionStatus, t } = args

  const saveApiConnectionSettings = useCallback(() => {
    if (persistApiBaseUrl(apiBaseUrlInput.trim())) {
      setApiConnectionStatus({
        kind: 'success',
        message: t('app.apiConnectionSaved'),
      })
      return
    }
    setApiConnectionStatus({
      kind: 'error',
      message: t('app.apiConnectionSaveError'),
    })
  }, [apiBaseUrlInput, setApiConnectionStatus, t])

  const clearApiConnectionSettings = useCallback(() => {
    if (clearApiBaseUrl()) {
      setApiBaseUrlInput('')
      setApiConnectionStatus({
        kind: 'success',
        message: t('app.apiConnectionCleared'),
      })
      return
    }
    setApiConnectionStatus({
      kind: 'error',
      message: t('app.apiConnectionSaveError'),
    })
  }, [setApiBaseUrlInput, setApiConnectionStatus, t])

  const testApiConnection = useCallback(async () => {
    setApiConnectionStatus(null)
    try {
      await apiClient.getCurrentUser()
      setApiConnectionStatus({
        kind: 'success',
        message: t('app.apiConnectionTestOk'),
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
