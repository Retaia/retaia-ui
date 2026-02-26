import { useCallback } from 'react'
import { type ApiClient } from '../../api/client'
import { mapApiErrorToMessage } from '../../api/errorMapping'
import { type AuthUserProfile } from '../../application/auth/authUseCases'
import {
  getMfaToggleErrorKey,
  getMfaToggleSuccessKey,
  type MfaToggleTarget,
  updateAuthUserMfaFlag,
} from '../../application/auth/mfaPresentation'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  setAuthMfaBusy,
  setAuthMfaOtpAction,
  setAuthMfaSetup,
  setAuthMfaStatus,
} from '../../store/slices/authUiSlice'
import { setupMfaThunk, toggleMfaThunk } from '../../store/thunks/authThunks'

type Translator = (key: string, options?: Record<string, unknown>) => string

type AuthMfaStatus = {
  kind: 'success' | 'error'
  message: string
}

type AuthMfaClient = Pick<ApiClient, 'setup2fa' | 'enable2fa' | 'disable2fa' | 'getCurrentUser'>

export function useAuthMfaController(args: {
  apiClient: AuthMfaClient
  t: Translator
  setAuthUser: (value: AuthUserProfile | null | ((current: AuthUserProfile | null) => AuthUserProfile | null)) => void
}) {
  const { apiClient, setAuthUser, t } = args
  const dispatch = useAppDispatch()
  const authMfaStatus = useAppSelector((state) => state.authUi.authMfaStatus)
  const authMfaBusy = useAppSelector((state) => state.authUi.authMfaBusy)
  const authMfaSetup = useAppSelector((state) => state.authUi.authMfaSetup)
  const authMfaOtpAction = useAppSelector((state) => state.authUi.authMfaOtpAction)
  const authUser = useAppSelector((state) => state.authUi.authUser)

  const startMfaSetup = useCallback(async () => {
    dispatch(setAuthMfaBusy(true))
    dispatch(setAuthMfaStatus(null))
    try {
      const result = await dispatch(setupMfaThunk({ apiClient })).unwrap()
      if (result.kind === 'api_error') {
        dispatch(setAuthMfaStatus({
          kind: 'error',
          message: t('app.authMfaSetupError', {
            message: mapApiErrorToMessage(result.error, t),
          }),
        }))
        return
      }
      dispatch(setAuthMfaSetup(result.setup))
      dispatch(setAuthMfaStatus({
        kind: 'success',
        message: t('app.authMfaSetupReady'),
      }))
    } finally {
      dispatch(setAuthMfaBusy(false))
    }
  }, [apiClient, dispatch, t])

  const submitMfaToggle = useCallback(
    async (target: MfaToggleTarget) => {
      dispatch(setAuthMfaBusy(true))
      dispatch(setAuthMfaStatus(null))
      try {
        const result = await dispatch(toggleMfaThunk({
          apiClient,
          otpCode: authMfaOtpAction,
          target,
        })).unwrap()
        if (result.kind === 'validation_error') {
          dispatch(setAuthMfaStatus({
            kind: 'error',
            message: t('app.authOtpRequired'),
          }))
          return
        }
        if (result.kind === 'api_error') {
          dispatch(setAuthMfaStatus({
            kind: 'error',
            message: t(getMfaToggleErrorKey(target), {
              message: mapApiErrorToMessage(result.error, t),
            }),
          }))
          return
        }
        if (result.kind === 'success_with_user') {
          setAuthUser(updateAuthUserMfaFlag(authUser, result.authUser.mfaEnabled))
        }
        dispatch(setAuthMfaOtpAction(''))
        if (target === 'enable') {
          dispatch(setAuthMfaSetup(null))
        }
        dispatch(setAuthMfaStatus({
          kind: 'success',
          message: t(getMfaToggleSuccessKey(target)),
        }))
      } finally {
        dispatch(setAuthMfaBusy(false))
      }
    },
    [apiClient, authMfaOtpAction, authUser, dispatch, setAuthUser, t],
  )

  const enableMfa = useCallback(async () => {
    await submitMfaToggle('enable')
  }, [submitMfaToggle])

  const disableMfa = useCallback(async () => {
    await submitMfaToggle('disable')
  }, [submitMfaToggle])

  const resetMfaState = useCallback(() => {
    dispatch(setAuthMfaStatus(null))
    dispatch(setAuthMfaSetup(null))
    dispatch(setAuthMfaOtpAction(''))
  }, [dispatch])

  return {
    authMfaStatus,
    setAuthMfaStatus: (value: AuthMfaStatus | null) => dispatch(setAuthMfaStatus(value)),
    authMfaBusy,
    setAuthMfaBusy: (value: boolean) => dispatch(setAuthMfaBusy(value)),
    authMfaSetup,
    authMfaOtpAction,
    setAuthMfaOtpAction: (value: string) => dispatch(setAuthMfaOtpAction(value)),
    startMfaSetup,
    enableMfa,
    disableMfa,
    resetMfaState,
  }
}
