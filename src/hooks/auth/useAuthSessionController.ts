import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { ApiError, type ApiClient } from '../../api/client'
import { mapApiErrorToMessage } from '../../api/errorMapping'
import {
  loginWithContext,
  normalizeAuthUser,
  normalizeFeatures,
  type AuthUserProfile,
} from '../../application/auth/authUseCases'
import { type FeatureState } from './useAuthFeatureGovernance'
import { clearApiToken, persistApiToken, persistLoginEmail, readStoredLoginEmail } from '../../services/apiSession'

type Translator = (key: string, options?: Record<string, unknown>) => string

type AuthSessionClient = Pick<ApiClient, 'login' | 'logout' | 'getCurrentUser' | 'getUserFeatures'>

export function useAuthSessionController(args: {
  apiClient: AuthSessionClient
  t: Translator
  effectiveApiToken: string | null
  isApiAuthLockedByEnv: boolean
  setApiTokenInput: Dispatch<SetStateAction<string>>
}) {
  const { apiClient, effectiveApiToken, isApiAuthLockedByEnv, setApiTokenInput, t } = args

  const [authEmailInput, setAuthEmailInput] = useState(readStoredLoginEmail)
  const [authPasswordInput, setAuthPasswordInput] = useState('')
  const [authOtpInput, setAuthOtpInput] = useState('')
  const [authStatus, setAuthStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authRequiresOtp, setAuthRequiresOtp] = useState(false)
  const [authUser, setAuthUser] = useState<AuthUserProfile | null>(null)
  const [userFeatureState, setUserFeatureState] = useState<FeatureState | null>(null)

  const handleLogin = useCallback(async () => {
    const result = await loginWithContext({
      apiClient,
      email: authEmailInput,
      password: authPasswordInput,
      otpCode: authOtpInput,
    })
    if (result.kind === 'validation_error') {
      setAuthStatus({
        kind: 'error',
        message: t('app.authMissingCredentials'),
      })
      return false
    }

    setAuthLoading(true)
    setAuthStatus(null)
    try {
      if (result.kind === 'mfa_required') {
        setAuthRequiresOtp(true)
        setAuthStatus({
          kind: 'error',
          message: t('app.authMfaRequired'),
        })
        return false
      }
      if (result.kind === 'api_error') {
        setAuthStatus({
          kind: 'error',
          message: t('app.authLoginError', {
            message: mapApiErrorToMessage(result.error, t),
          }),
        })
        return false
      }

      setApiTokenInput(result.accessToken)
      persistApiToken(result.accessToken)
      persistLoginEmail(result.loginEmail)
      setUserFeatureState(result.featureState)
      setAuthUser(result.authUser)
      setAuthPasswordInput('')
      setAuthOtpInput('')
      setAuthRequiresOtp(false)
      setAuthStatus({
        kind: 'success',
        message: t('app.authLoginSuccess'),
      })
      return true
    } finally {
      setAuthLoading(false)
    }
  }, [apiClient, authEmailInput, authOtpInput, authPasswordInput, setApiTokenInput, t])

  const handleLogout = useCallback(async () => {
    setAuthLoading(true)
    setAuthStatus(null)
    try {
      await apiClient.logout()
    } catch {
      // local cleanup still applies if logout endpoint fails
    } finally {
      setApiTokenInput('')
      clearApiToken()
      setAuthPasswordInput('')
      setAuthOtpInput('')
      setAuthRequiresOtp(false)
      setAuthUser(null)
      setUserFeatureState(null)
      setAuthLoading(false)
      setAuthStatus({
        kind: 'success',
        message: t('app.authLogoutSuccess'),
      })
    }
  }, [apiClient, setApiTokenInput, t])

  useEffect(() => {
    if (!effectiveApiToken) {
      setAuthUser(null)
      setUserFeatureState(null)
      return
    }

    let canceled = false
    const loadCurrentUser = async () => {
      try {
        const currentUser = await apiClient.getCurrentUser()
        const userFeatures = await apiClient.getUserFeatures()
        if (canceled) {
          return
        }
        setUserFeatureState(normalizeFeatures(userFeatures))
        setAuthUser(normalizeAuthUser(currentUser))
      } catch (error) {
        if (canceled) {
          return
        }
        setAuthUser(null)
        setUserFeatureState(null)
        if (!isApiAuthLockedByEnv && error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          setApiTokenInput('')
          clearApiToken()
          setAuthStatus({
            kind: 'error',
            message: t('app.authSessionExpired'),
          })
        }
      }
    }

    void loadCurrentUser()
    return () => {
      canceled = true
    }
  }, [apiClient, effectiveApiToken, isApiAuthLockedByEnv, setApiTokenInput, t])

  return {
    authEmailInput,
    setAuthEmailInput,
    authPasswordInput,
    setAuthPasswordInput,
    authOtpInput,
    setAuthOtpInput,
    authStatus,
    authLoading,
    authRequiresOtp,
    authUser,
    setAuthUser,
    userFeatureState,
    setUserFeatureState,
    handleLogin,
    handleLogout,
  }
}
