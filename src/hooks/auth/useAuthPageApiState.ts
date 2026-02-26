import { useCallback } from 'react'
import type { TFunction } from 'i18next'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  setApiBaseUrlInput,
  setApiConnectionStatus,
  setApiTokenInput,
  setAuthRetryStatus,
} from '../../store/slices/authUiSlice'

export type ApiConnectionStatus = {
  kind: 'success' | 'error'
  message: string
}

type UseAuthPageApiStateParams = {
  t: TFunction
}

export function useAuthPageApiState({ t }: UseAuthPageApiStateParams) {
  const dispatch = useAppDispatch()
  const retryStatus = useAppSelector((state) => state.authUi.retryStatus)
  const apiTokenInput = useAppSelector((state) => state.authUi.apiTokenInput)
  const apiBaseUrlInput = useAppSelector((state) => state.authUi.apiBaseUrlInput)
  const apiConnectionStatus = useAppSelector((state) => state.authUi.apiConnectionStatus)

  const handleApiAuthError = useCallback(() => {
    dispatch(setApiConnectionStatus({
      kind: 'error',
      message: t('app.apiConnectionAuthError'),
    }))
  }, [dispatch, t])

  const handleApiRetry = useCallback(
    ({ attempt, maxRetries }: { attempt: number; maxRetries: number }) => {
      dispatch(setAuthRetryStatus(
        t('actions.retrying', {
          attempt,
          total: maxRetries + 1,
        }),
      ))
    },
    [dispatch, t],
  )

  const updateApiTokenInput = useCallback(
    (value: string) => {
      dispatch(setApiTokenInput(value))
    },
    [dispatch],
  )

  const updateApiBaseUrlInput = useCallback(
    (value: string) => {
      dispatch(setApiBaseUrlInput(value))
    },
    [dispatch],
  )

  const updateApiConnectionStatus = useCallback(
    (value: ApiConnectionStatus | null) => {
      dispatch(setApiConnectionStatus(value))
    },
    [dispatch],
  )

  return {
    retryStatus,
    apiTokenInput,
    setApiTokenInput: updateApiTokenInput,
    apiBaseUrlInput,
    setApiBaseUrlInput: updateApiBaseUrlInput,
    apiConnectionStatus,
    setApiConnectionStatus: updateApiConnectionStatus,
    handleApiAuthError,
    handleApiRetry,
  }
}
