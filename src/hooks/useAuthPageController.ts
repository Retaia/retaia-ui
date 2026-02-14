import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../api/client'
import { mapApiErrorToMessage } from '../api/errorMapping'
import {
  loginWithContext,
  normalizeAuthUser,
  normalizeFeatures,
  type AuthUserProfile,
} from '../application/auth/authUseCases'
import { useAuthApiConnectionController } from './auth/useAuthApiConnectionController'
import { useAuthMfaController } from './auth/useAuthMfaController'
import { useAuthRecoveryController } from './auth/useAuthRecoveryController'
import { useApiClient } from './useApiClient'
import { type FeatureState, useAuthFeatureGovernance } from './auth/useAuthFeatureGovernance'
import {
  clearApiToken,
  persistApiToken,
  persistLoginEmail as persistLoginEmailToSession,
  readStoredApiBaseUrl,
  readStoredApiToken,
  readStoredLoginEmail,
} from '../services/apiSession'

export function useAuthPageController() {
  const { t } = useTranslation()
  const [retryStatus, setRetryStatus] = useState<string | null>(null)
  const [apiTokenInput, setApiTokenInput] = useState(readStoredApiToken)
  const [apiBaseUrlInput, setApiBaseUrlInput] = useState(readStoredApiBaseUrl)
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
  const [apiConnectionStatus, setApiConnectionStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)

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
  const {
    apiClient,
    effectiveApiToken,
    isApiBaseUrlLockedByEnv,
    isApiAuthLockedByEnv,
    isApiConfigLockedByEnv,
  } = useApiClient({
    apiBaseUrlInput,
    apiTokenInput,
    onAuthError: handleApiAuthError,
    onRetry: handleApiRetry,
  })
  const {
    authMfaStatus,
    setAuthMfaStatus,
    authMfaBusy,
    setAuthMfaBusy,
    authMfaSetup,
    authMfaOtpAction,
    setAuthMfaOtpAction,
    startMfaSetup,
    enableMfa,
    disableMfa,
    resetMfaState,
  } = useAuthMfaController({
    apiClient,
    t,
    setAuthUser,
  })
  const {
    lostPasswordMode,
    setLostPasswordMode,
    lostPasswordEmailInput,
    setLostPasswordEmailInput,
    lostPasswordTokenInput,
    setLostPasswordTokenInput,
    lostPasswordNewPasswordInput,
    setLostPasswordNewPasswordInput,
    lostPasswordStatus,
    lostPasswordLoading,
    verifyEmailMode,
    setVerifyEmailMode,
    verifyEmailInput,
    setVerifyEmailInput,
    verifyEmailTokenInput,
    setVerifyEmailTokenInput,
    verifyEmailStatus,
    verifyEmailLoading,
    handleLostPasswordRequest,
    handleLostPasswordReset,
    handleVerifyEmailRequest,
    handleVerifyEmailConfirm,
    handleVerifyEmailAdminConfirm,
  } = useAuthRecoveryController({
    apiClient,
    t,
  })
  const {
    saveApiConnectionSettings,
    clearApiConnectionSettings,
    testApiConnection,
  } = useAuthApiConnectionController({
    apiClient,
    t,
    apiBaseUrlInput,
    setApiBaseUrlInput,
    setApiConnectionStatus,
  })

  const persistAuthToken = useCallback((token: string) => {
    persistApiToken(token)
  }, [])

  const clearPersistedAuthToken = useCallback(() => {
    clearApiToken()
  }, [])

  const persistLoginEmail = useCallback((email: string) => {
    persistLoginEmailToSession(email)
  }, [])

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
      return
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
        return
      }
      if (result.kind === 'api_error') {
        setAuthStatus({
          kind: 'error',
          message: t('app.authLoginError', {
            message: mapApiErrorToMessage(result.error, t),
          }),
        })
        return
      }

      setApiTokenInput(result.accessToken)
      persistAuthToken(result.accessToken)
      persistLoginEmail(result.loginEmail)
      setUserFeatureState(result.featureState)
      setAuthUser(result.authUser)
      resetMfaState()
      setAuthPasswordInput('')
      setAuthOtpInput('')
      setAuthRequiresOtp(false)
      setAuthStatus({
        kind: 'success',
        message: t('app.authLoginSuccess'),
      })
    } finally {
      setAuthLoading(false)
    }
  }, [apiClient, authEmailInput, authOtpInput, authPasswordInput, persistAuthToken, persistLoginEmail, resetMfaState, t])

  const handleLogout = useCallback(async () => {
    setAuthLoading(true)
    setAuthStatus(null)
    try {
      await apiClient.logout()
    } catch {
      // local cleanup still applies if logout endpoint fails
    } finally {
      setApiTokenInput('')
      clearPersistedAuthToken()
      setAuthPasswordInput('')
      setAuthOtpInput('')
      setAuthRequiresOtp(false)
      setAuthUser(null)
      setUserFeatureState(null)
      resetMfaState()
      setAuthLoading(false)
      setAuthStatus({
        kind: 'success',
        message: t('app.authLogoutSuccess'),
      })
    }
  }, [apiClient, clearPersistedAuthToken, resetMfaState, t])

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
          clearPersistedAuthToken()
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
  }, [apiClient, clearPersistedAuthToken, effectiveApiToken, isApiAuthLockedByEnv, t])
  const {
    appFeatureBusy,
    appFeatureStatus,
    appMfaFeatureKey,
    appMfaFeatureEnabled,
    mfaFeatureKey,
    mfaFeatureAvailable,
    mfaFeatureUserEnabled,
    mfaFeatureUserCanDisable,
    setAppFeature,
    setUserFeature,
  } = useAuthFeatureGovernance({
    apiClient,
    t,
    authUserIsAdmin: authUser?.isAdmin === true,
    userFeatureState,
    setUserFeatureState,
    setAuthMfaStatus,
    setAuthMfaBusy,
  })

  return {
    retryStatus,
    apiTokenInput,
    setApiTokenInput,
    apiBaseUrlInput,
    setApiBaseUrlInput,
    authEmailInput,
    setAuthEmailInput,
    authPasswordInput,
    setAuthPasswordInput,
    authOtpInput,
    setAuthOtpInput,
    lostPasswordMode,
    setLostPasswordMode,
    lostPasswordEmailInput,
    setLostPasswordEmailInput,
    lostPasswordTokenInput,
    setLostPasswordTokenInput,
    lostPasswordNewPasswordInput,
    setLostPasswordNewPasswordInput,
    lostPasswordStatus,
    lostPasswordLoading,
    verifyEmailMode,
    setVerifyEmailMode,
    verifyEmailInput,
    setVerifyEmailInput,
    verifyEmailTokenInput,
    setVerifyEmailTokenInput,
    verifyEmailStatus,
    verifyEmailLoading,
    authStatus,
    authLoading,
    authRequiresOtp,
    authUser,
    appFeatureBusy,
    appFeatureStatus,
    authMfaStatus,
    authMfaBusy,
    authMfaSetup,
    authMfaOtpAction,
    setAuthMfaOtpAction,
    apiConnectionStatus,
    isApiBaseUrlLockedByEnv,
    isApiAuthLockedByEnv,
    isApiConfigLockedByEnv,
    appMfaFeatureKey,
    appMfaFeatureEnabled,
    mfaFeatureKey,
    mfaFeatureAvailable,
    mfaFeatureUserEnabled,
    mfaFeatureUserCanDisable,
    handleLogin,
    handleLogout,
    handleLostPasswordRequest,
    handleLostPasswordReset,
    handleVerifyEmailRequest,
    handleVerifyEmailConfirm,
    handleVerifyEmailAdminConfirm,
    setAppFeature,
    setUserFeature,
    startMfaSetup,
    enableMfa,
    disableMfa,
    saveApiConnectionSettings,
    clearApiConnectionSettings,
    testApiConnection,
  }
}
