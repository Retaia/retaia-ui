import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthApiConnectionController } from './auth/useAuthApiConnectionController'
import { useAuthMfaController } from './auth/useAuthMfaController'
import { useAuthRecoveryController } from './auth/useAuthRecoveryController'
import { useAuthSessionController } from './auth/useAuthSessionController'
import { useApiClient } from './useApiClient'
import { useAuthFeatureGovernance } from './auth/useAuthFeatureGovernance'
import { readStoredApiBaseUrl, readStoredApiToken } from '../services/apiSession'

export function useAuthPageController() {
  const { t } = useTranslation()
  const [retryStatus, setRetryStatus] = useState<string | null>(null)
  const [apiTokenInput, setApiTokenInput] = useState(readStoredApiToken)
  const [apiBaseUrlInput, setApiBaseUrlInput] = useState(readStoredApiBaseUrl)
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
    handleLogin: handleSessionLogin,
    handleLogout: handleSessionLogout,
  } = useAuthSessionController({
    apiClient,
    t,
    effectiveApiToken,
    isApiAuthLockedByEnv,
    setApiTokenInput,
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

  const handleLogin = useCallback(async () => {
    const didLoginSucceed = await handleSessionLogin()
    if (didLoginSucceed) {
      resetMfaState()
    }
  }, [handleSessionLogin, resetMfaState])

  const handleLogout = useCallback(async () => {
    await handleSessionLogout()
    resetMfaState()
  }, [handleSessionLogout, resetMfaState])

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
