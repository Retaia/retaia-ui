import { useCallback, useEffect, useState } from 'react'
import { ApiError, type ApiClient } from '../../api/client'
import { mapApiErrorToMessage } from '../../api/errorMapping'
import {
  normalizeAuthUser,
  normalizeFeatures,
} from '../../application/auth/authUseCases'
import { type FeatureState } from './useAuthFeatureGovernance'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  setAuthEmailInput,
  setAuthLoading,
  setAuthOtpInput,
  setAuthPasswordInput,
  setAuthRequiresOtp,
  setAuthStatus,
  setAuthUser as setAuthUserAction,
  setUserFeatureState as setUserFeatureStateAction,
} from '../../store/slices/authUiSlice'
import { loginWithContextThunk } from '../../store/thunks/authThunks'

type Translator = (key: string, options?: Record<string, unknown>) => string
type SetStateAction<T> = T | ((current: T) => T)

type AuthSessionClient = Pick<ApiClient, 'login' | 'logout' | 'getCurrentUser' | 'getUserFeatures'>

export function useAuthSessionController(args: {
  apiClient: AuthSessionClient
  t: Translator
  effectiveApiToken: string | null
  isApiAuthLockedByEnv: boolean
  setApiTokenInput: (value: string) => void
}) {
  const { apiClient, effectiveApiToken, isApiAuthLockedByEnv, setApiTokenInput, t } = args
  const dispatch = useAppDispatch()
  const authEmailInput = useAppSelector((state) => state.authUi.authEmailInput)
  const authPasswordInput = useAppSelector((state) => state.authUi.authPasswordInput)
  const authOtpInput = useAppSelector((state) => state.authUi.authOtpInput)
  const authStatus = useAppSelector((state) => state.authUi.authStatus)
  const authLoading = useAppSelector((state) => state.authUi.authLoading)
  const authRequiresOtp = useAppSelector((state) => state.authUi.authRequiresOtp)
  const authUser = useAppSelector((state) => state.authUi.authUser)
  const userFeatureState = useAppSelector((state) => state.authUi.userFeatureState)
  const [authSessionLoadState, setAuthSessionLoadState] = useState<'loading' | 'ready'>(
    effectiveApiToken ? 'loading' : 'ready',
  )

  const handleLogin = useCallback(async () => {
    const result = await dispatch(loginWithContextThunk({
      apiClient,
      email: authEmailInput,
      password: authPasswordInput,
      otpCode: authOtpInput,
    })).unwrap()
    if (result.kind === 'validation_error') {
      dispatch(setAuthStatus({
        kind: 'error',
        message: t('app.authMissingCredentials'),
      }))
      return false
    }

    dispatch(setAuthLoading(true))
    dispatch(setAuthStatus(null))
    try {
      if (result.kind === 'mfa_required') {
        dispatch(setAuthRequiresOtp(true))
        dispatch(setAuthStatus({
          kind: 'error',
          message: t('app.authMfaRequired'),
        }))
        return false
      }
      if (result.kind === 'api_error') {
        dispatch(setAuthStatus({
          kind: 'error',
          message: t('app.authLoginError', {
            message: mapApiErrorToMessage(result.error, t),
          }),
        }))
        return false
      }

      setApiTokenInput(result.accessToken)
      dispatch(setAuthEmailInput(result.loginEmail))
      dispatch(setUserFeatureStateAction(result.featureState))
      dispatch(setAuthUserAction(result.authUser))
      dispatch(setAuthPasswordInput(''))
      dispatch(setAuthOtpInput(''))
      dispatch(setAuthRequiresOtp(false))
      dispatch(setAuthStatus({
        kind: 'success',
        message: t('app.authLoginSuccess'),
      }))
      return true
    } finally {
      dispatch(setAuthLoading(false))
    }
  }, [apiClient, authEmailInput, authOtpInput, authPasswordInput, dispatch, setApiTokenInput, t])

  const handleLogout = useCallback(async () => {
    dispatch(setAuthLoading(true))
    dispatch(setAuthStatus(null))
    try {
      await apiClient.logout()
    } catch {
      // local cleanup still applies if logout endpoint fails
    } finally {
      setApiTokenInput('')
      dispatch(setAuthPasswordInput(''))
      dispatch(setAuthOtpInput(''))
      dispatch(setAuthRequiresOtp(false))
      dispatch(setAuthUserAction(null))
      dispatch(setUserFeatureStateAction(null))
      dispatch(setAuthLoading(false))
      dispatch(setAuthStatus({
        kind: 'success',
        message: t('app.authLogoutSuccess'),
      }))
    }
  }, [apiClient, dispatch, setApiTokenInput, t])

  useEffect(() => {
    if (!effectiveApiToken) {
      dispatch(setAuthUserAction(null))
      dispatch(setUserFeatureStateAction(null))
      return
    }

    let canceled = false
    const loadCurrentUser = async () => {
      setAuthSessionLoadState('loading')
      try {
        const currentUser = await apiClient.getCurrentUser()
        const userFeatures = await apiClient.getUserFeatures()
        if (canceled) {
          return
        }
        dispatch(setUserFeatureStateAction(normalizeFeatures(userFeatures)))
        dispatch(setAuthUserAction(normalizeAuthUser(currentUser)))
        setAuthSessionLoadState('ready')
      } catch (error) {
        if (canceled) {
          return
        }
        dispatch(setAuthUserAction(null))
        dispatch(setUserFeatureStateAction(null))
        if (!isApiAuthLockedByEnv && error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          setApiTokenInput('')
          dispatch(setAuthStatus({
            kind: 'error',
            message: t('app.authSessionExpired'),
          }))
        }
        setAuthSessionLoadState('ready')
      }
    }

    void loadCurrentUser()
    return () => {
      canceled = true
    }
  }, [apiClient, dispatch, effectiveApiToken, isApiAuthLockedByEnv, setApiTokenInput, t])

  return {
    authEmailInput,
    setAuthEmailInput: (value: string) => dispatch(setAuthEmailInput(value)),
    authPasswordInput,
    setAuthPasswordInput: (value: string) => dispatch(setAuthPasswordInput(value)),
    authOtpInput,
    setAuthOtpInput: (value: string) => dispatch(setAuthOtpInput(value)),
    authStatus,
    authLoading,
    authRequiresOtp,
    authSessionLoadState: effectiveApiToken ? authSessionLoadState : 'ready',
    authUser,
    setAuthUser: (value: SetStateAction<typeof authUser>) => {
      const nextValue = typeof value === 'function' ? value(authUser) : value
      dispatch(setAuthUserAction(nextValue))
    },
    userFeatureState,
    setUserFeatureState: (value: FeatureState | null) => dispatch(setUserFeatureStateAction(value)),
    handleLogin,
    handleLogout,
  }
}
