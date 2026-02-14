import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../api/client'
import { mapApiErrorToMessage } from '../api/errorMapping'
import { useApiClient } from './useApiClient'
import {
  clearApiBaseUrl,
  clearApiToken,
  persistApiBaseUrl,
  persistApiToken,
  persistLoginEmail as persistLoginEmailToSession,
  readStoredApiBaseUrl,
  readStoredApiToken,
  readStoredLoginEmail,
} from '../services/apiSession'

type FeatureState = {
  userFeatureEnabled: Record<string, boolean>
  effectiveFeatureEnabled: Record<string, boolean>
  featureGovernance: Array<{
    key: string
    user_can_disable: boolean
  }>
}

type AppFeatureState = {
  appFeatureEnabled: Record<string, boolean>
  featureGovernance: Array<{
    key: string
    user_can_disable: boolean
  }>
}

function normalizeFeatures(payload: {
  user_feature_enabled?: Record<string, unknown>
  effective_feature_enabled?: Record<string, unknown>
  feature_governance?: Array<{ key?: string; user_can_disable?: boolean }>
}): FeatureState {
  const userFeatureEnabled = Object.entries(payload.user_feature_enabled ?? {}).reduce<Record<string, boolean>>(
    (acc, [key, value]) => {
      if (typeof value === 'boolean') {
        acc[key] = value
      }
      return acc
    },
    {},
  )
  const effectiveFeatureEnabled = Object.entries(payload.effective_feature_enabled ?? {}).reduce<
    Record<string, boolean>
  >((acc, [key, value]) => {
    if (typeof value === 'boolean') {
      acc[key] = value
    }
    return acc
  }, {})
  const featureGovernance = (payload.feature_governance ?? [])
    .filter((item) => typeof item.key === 'string')
    .map((item) => ({
      key: item.key as string,
      user_can_disable: item.user_can_disable === true,
    }))

  return {
    userFeatureEnabled,
    effectiveFeatureEnabled,
    featureGovernance,
  }
}

function normalizeAppFeatures(payload: {
  app_feature_enabled?: Record<string, unknown>
  feature_governance?: Array<{ key?: string; user_can_disable?: boolean }>
}): AppFeatureState {
  const appFeatureEnabled = Object.entries(payload.app_feature_enabled ?? {}).reduce<Record<string, boolean>>(
    (acc, [key, value]) => {
      if (typeof value === 'boolean') {
        acc[key] = value
      }
      return acc
    },
    {},
  )
  const featureGovernance = (payload.feature_governance ?? [])
    .filter((item) => typeof item.key === 'string')
    .map((item) => ({
      key: item.key as string,
      user_can_disable: item.user_can_disable === true,
    }))
  return {
    appFeatureEnabled,
    featureGovernance,
  }
}

export function useAuthPageController() {
  const { t } = useTranslation()
  const [retryStatus, setRetryStatus] = useState<string | null>(null)
  const [apiTokenInput, setApiTokenInput] = useState(readStoredApiToken)
  const [apiBaseUrlInput, setApiBaseUrlInput] = useState(readStoredApiBaseUrl)
  const [authEmailInput, setAuthEmailInput] = useState(readStoredLoginEmail)
  const [authPasswordInput, setAuthPasswordInput] = useState('')
  const [authOtpInput, setAuthOtpInput] = useState('')
  const [lostPasswordMode, setLostPasswordMode] = useState<'request' | 'reset'>('request')
  const [lostPasswordEmailInput, setLostPasswordEmailInput] = useState('')
  const [lostPasswordTokenInput, setLostPasswordTokenInput] = useState('')
  const [lostPasswordNewPasswordInput, setLostPasswordNewPasswordInput] = useState('')
  const [lostPasswordStatus, setLostPasswordStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [lostPasswordLoading, setLostPasswordLoading] = useState(false)
  const [verifyEmailMode, setVerifyEmailMode] = useState<'request' | 'confirm' | 'admin'>('request')
  const [verifyEmailInput, setVerifyEmailInput] = useState('')
  const [verifyEmailTokenInput, setVerifyEmailTokenInput] = useState('')
  const [verifyEmailStatus, setVerifyEmailStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [verifyEmailLoading, setVerifyEmailLoading] = useState(false)
  const [authStatus, setAuthStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authRequiresOtp, setAuthRequiresOtp] = useState(false)
  const [authUser, setAuthUser] = useState<{
    email: string
    displayName: string | null
    mfaEnabled: boolean
    isAdmin: boolean
  } | null>(null)
  const [userFeatureState, setUserFeatureState] = useState<FeatureState | null>(null)
  const [appFeatureState, setAppFeatureState] = useState<AppFeatureState | null>(null)
  const [appFeatureBusy, setAppFeatureBusy] = useState(false)
  const [appFeatureStatus, setAppFeatureStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [authMfaStatus, setAuthMfaStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [authMfaBusy, setAuthMfaBusy] = useState(false)
  const [authMfaSetup, setAuthMfaSetup] = useState<{
    secret: string
    otpauthUri: string
  } | null>(null)
  const [authMfaOtpAction, setAuthMfaOtpAction] = useState('')
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
  }, [apiBaseUrlInput, t])

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
  }, [t])

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
    if (authEmailInput.trim().length === 0 || authPasswordInput.length === 0) {
      setAuthStatus({
        kind: 'error',
        message: t('app.authMissingCredentials'),
      })
      return
    }
    setAuthLoading(true)
    setAuthStatus(null)
    try {
      const login = await apiClient.login({
        email: authEmailInput.trim(),
        password: authPasswordInput,
        ...(authOtpInput.trim() ? { otp_code: authOtpInput.trim() } : {}),
      })
      setApiTokenInput(login.access_token)
      persistAuthToken(login.access_token)
      persistLoginEmail(authEmailInput.trim())

      const currentUser = await apiClient.getCurrentUser()
      const userFeatures = await apiClient.getUserFeatures()
      setUserFeatureState(normalizeFeatures(userFeatures))
      setAuthUser({
        email: currentUser.email,
        displayName:
          typeof currentUser.display_name === 'string' ? currentUser.display_name : null,
        mfaEnabled: currentUser.mfa_enabled === true,
        isAdmin: Array.isArray(currentUser.roles) && currentUser.roles.includes('ADMIN'),
      })
      setAuthMfaStatus(null)
      setAuthMfaSetup(null)
      setAuthMfaOtpAction('')
      setAuthPasswordInput('')
      setAuthOtpInput('')
      setAuthRequiresOtp(false)
      setAuthStatus({
        kind: 'success',
        message: t('app.authLoginSuccess'),
      })
    } catch (error) {
      if (error instanceof ApiError && error.payload?.code === 'MFA_REQUIRED') {
        setAuthRequiresOtp(true)
        setAuthStatus({
          kind: 'error',
          message: t('app.authMfaRequired'),
        })
      } else {
        setAuthStatus({
          kind: 'error',
          message: t('app.authLoginError', {
            message: mapApiErrorToMessage(error, t),
          }),
        })
      }
    } finally {
      setAuthLoading(false)
    }
  }, [apiClient, authEmailInput, authOtpInput, authPasswordInput, persistAuthToken, persistLoginEmail, t])

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
      setAppFeatureState(null)
      setAppFeatureStatus(null)
      setAuthMfaStatus(null)
      setAuthMfaSetup(null)
      setAuthMfaOtpAction('')
      setAuthLoading(false)
      setAuthStatus({
        kind: 'success',
        message: t('app.authLogoutSuccess'),
      })
    }
  }, [apiClient, clearPersistedAuthToken, t])

  const handleLostPasswordRequest = useCallback(async () => {
    if (lostPasswordEmailInput.trim().length === 0) {
      setLostPasswordStatus({
        kind: 'error',
        message: t('app.authLostPasswordEmailRequired'),
      })
      return
    }
    setLostPasswordLoading(true)
    setLostPasswordStatus(null)
    try {
      await apiClient.requestLostPassword({ email: lostPasswordEmailInput.trim() })
      setLostPasswordStatus({
        kind: 'success',
        message: t('app.authLostPasswordRequestSent'),
      })
    } catch (error) {
      setLostPasswordStatus({
        kind: 'error',
        message: t('app.authLostPasswordRequestError', {
          message: mapApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setLostPasswordLoading(false)
    }
  }, [apiClient, lostPasswordEmailInput, t])

  const handleLostPasswordReset = useCallback(async () => {
    if (lostPasswordTokenInput.trim().length === 0 || lostPasswordNewPasswordInput.length === 0) {
      setLostPasswordStatus({
        kind: 'error',
        message: t('app.authLostPasswordResetMissing'),
      })
      return
    }
    setLostPasswordLoading(true)
    setLostPasswordStatus(null)
    try {
      await apiClient.resetLostPassword({
        token: lostPasswordTokenInput.trim(),
        new_password: lostPasswordNewPasswordInput,
      })
      setLostPasswordNewPasswordInput('')
      setLostPasswordStatus({
        kind: 'success',
        message: t('app.authLostPasswordResetSuccess'),
      })
    } catch (error) {
      setLostPasswordStatus({
        kind: 'error',
        message: t('app.authLostPasswordResetError', {
          message: mapApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setLostPasswordLoading(false)
    }
  }, [apiClient, lostPasswordNewPasswordInput, lostPasswordTokenInput, t])

  const handleVerifyEmailRequest = useCallback(async () => {
    if (verifyEmailInput.trim().length === 0) {
      setVerifyEmailStatus({
        kind: 'error',
        message: t('app.authVerifyEmailInputRequired'),
      })
      return
    }
    setVerifyEmailLoading(true)
    setVerifyEmailStatus(null)
    try {
      await apiClient.requestEmailVerification({ email: verifyEmailInput.trim() })
      setVerifyEmailStatus({
        kind: 'success',
        message: t('app.authVerifyEmailRequested'),
      })
    } catch (error) {
      setVerifyEmailStatus({
        kind: 'error',
        message: t('app.authVerifyEmailRequestError', {
          message: mapApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setVerifyEmailLoading(false)
    }
  }, [apiClient, t, verifyEmailInput])

  const handleVerifyEmailConfirm = useCallback(async () => {
    if (verifyEmailTokenInput.trim().length === 0) {
      setVerifyEmailStatus({
        kind: 'error',
        message: t('app.authVerifyEmailTokenRequired'),
      })
      return
    }
    setVerifyEmailLoading(true)
    setVerifyEmailStatus(null)
    try {
      await apiClient.confirmEmailVerification({ token: verifyEmailTokenInput.trim() })
      setVerifyEmailTokenInput('')
      setVerifyEmailStatus({
        kind: 'success',
        message: t('app.authVerifyEmailConfirmed'),
      })
    } catch (error) {
      setVerifyEmailStatus({
        kind: 'error',
        message: t('app.authVerifyEmailConfirmError', {
          message: mapApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setVerifyEmailLoading(false)
    }
  }, [apiClient, t, verifyEmailTokenInput])

  const handleVerifyEmailAdminConfirm = useCallback(async () => {
    if (verifyEmailInput.trim().length === 0) {
      setVerifyEmailStatus({
        kind: 'error',
        message: t('app.authVerifyEmailInputRequired'),
      })
      return
    }
    setVerifyEmailLoading(true)
    setVerifyEmailStatus(null)
    try {
      await apiClient.adminConfirmEmailVerification({ email: verifyEmailInput.trim() })
      setVerifyEmailStatus({
        kind: 'success',
        message: t('app.authVerifyEmailAdminConfirmed'),
      })
    } catch (error) {
      setVerifyEmailStatus({
        kind: 'error',
        message: t('app.authVerifyEmailAdminConfirmError', {
          message: mapApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setVerifyEmailLoading(false)
    }
  }, [apiClient, t, verifyEmailInput])

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
  }, [apiClient, t])

  useEffect(() => {
    if (!effectiveApiToken) {
      setAuthUser(null)
      setUserFeatureState(null)
      setAppFeatureState(null)
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
        setAuthUser({
          email: currentUser.email,
          displayName:
            typeof currentUser.display_name === 'string' ? currentUser.display_name : null,
          mfaEnabled: currentUser.mfa_enabled === true,
          isAdmin: Array.isArray(currentUser.roles) && currentUser.roles.includes('ADMIN'),
        })
      } catch (error) {
        if (canceled) {
          return
        }
        setAuthUser(null)
        setUserFeatureState(null)
        setAppFeatureState(null)
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

  useEffect(() => {
    if (!authUser?.isAdmin) {
      setAppFeatureState(null)
      return
    }
    let canceled = false
    const loadAppFeatures = async () => {
      try {
        const appFeatures = await apiClient.getAppFeatures()
        if (canceled) {
          return
        }
        setAppFeatureState(normalizeAppFeatures(appFeatures))
      } catch (error) {
        if (canceled) {
          return
        }
        setAppFeatureState(null)
        setAppFeatureStatus({
          kind: 'error',
          message: t('app.authAppFeatureLoadError', {
            message: mapApiErrorToMessage(error, t),
          }),
        })
      }
    }
    void loadAppFeatures()
    return () => {
      canceled = true
    }
  }, [apiClient, authUser?.isAdmin, t])

  const appMfaFeatureKey = useMemo(() => {
    if (!appFeatureState) {
      return null
    }
    const fromGovernance = appFeatureState.featureGovernance.find((item) =>
      /(2fa|mfa|totp)/i.test(item.key),
    )
    if (fromGovernance) {
      return fromGovernance.key
    }
    return Object.keys(appFeatureState.appFeatureEnabled).find((key) => /(2fa|mfa|totp)/i.test(key)) ?? null
  }, [appFeatureState])

  const appMfaFeatureEnabled = useMemo(() => {
    if (!appMfaFeatureKey || !appFeatureState) {
      return false
    }
    return appFeatureState.appFeatureEnabled[appMfaFeatureKey] === true
  }, [appFeatureState, appMfaFeatureKey])

  const setAppFeature = useCallback(
    async (enabled: boolean) => {
      if (!appMfaFeatureKey || !appFeatureState) {
        return
      }
      setAppFeatureBusy(true)
      setAppFeatureStatus(null)
      try {
        const response = await apiClient.updateAppFeatures({
          app_feature_enabled: {
            ...appFeatureState.appFeatureEnabled,
            [appMfaFeatureKey]: enabled,
          },
        })
        setAppFeatureState(normalizeAppFeatures(response))
        setAppFeatureStatus({
          kind: 'success',
          message: enabled ? t('app.authAppFeatureEnabled') : t('app.authAppFeatureDisabled'),
        })
      } catch (error) {
        setAppFeatureStatus({
          kind: 'error',
          message: t('app.authAppFeatureUpdateError', {
            message: mapApiErrorToMessage(error, t),
          }),
        })
      } finally {
        setAppFeatureBusy(false)
      }
    },
    [apiClient, appFeatureState, appMfaFeatureKey, t],
  )

  const mfaFeatureKey = useMemo(() => {
    if (!userFeatureState) {
      return null
    }
    const fromGovernance = userFeatureState.featureGovernance.find((item) =>
      /(2fa|mfa|totp)/i.test(item.key),
    )
    if (fromGovernance) {
      return fromGovernance.key
    }
    const fromEffective = Object.keys(userFeatureState.effectiveFeatureEnabled).find((key) =>
      /(2fa|mfa|totp)/i.test(key),
    )
    return fromEffective ?? null
  }, [userFeatureState])

  const mfaFeatureAvailable = useMemo(() => {
    if (!mfaFeatureKey || !userFeatureState) {
      return false
    }
    const userEffective = userFeatureState.effectiveFeatureEnabled[mfaFeatureKey] === true
    if (!appMfaFeatureKey) {
      return userEffective
    }
    return userEffective && appMfaFeatureEnabled
  }, [appMfaFeatureEnabled, appMfaFeatureKey, mfaFeatureKey, userFeatureState])

  const mfaFeatureUserEnabled = useMemo(() => {
    if (!mfaFeatureKey || !userFeatureState) {
      return false
    }
    const current = userFeatureState.userFeatureEnabled[mfaFeatureKey]
    return current !== false
  }, [mfaFeatureKey, userFeatureState])

  const mfaFeatureUserCanDisable = useMemo(() => {
    if (!mfaFeatureKey || !userFeatureState) {
      return false
    }
    const governance = userFeatureState.featureGovernance.find((item) => item.key === mfaFeatureKey)
    return governance?.user_can_disable === true
  }, [mfaFeatureKey, userFeatureState])

  const setUserFeature = useCallback(
    async (enabled: boolean) => {
      if (!mfaFeatureKey || !userFeatureState) {
        return
      }
      setAuthMfaBusy(true)
      setAuthMfaStatus(null)
      try {
        const response = await apiClient.updateUserFeatures({
          user_feature_enabled: {
            ...userFeatureState.userFeatureEnabled,
            [mfaFeatureKey]: enabled,
          },
        })
        const normalized = normalizeFeatures(response)
        setUserFeatureState({
          ...normalized,
          featureGovernance: userFeatureState.featureGovernance,
        })
        setAuthMfaStatus({
          kind: 'success',
          message: enabled ? t('app.authMfaFeatureEnabled') : t('app.authMfaFeatureDisabled'),
        })
      } catch (error) {
        setAuthMfaStatus({
          kind: 'error',
          message: t('app.authMfaFeatureError', {
            message: mapApiErrorToMessage(error, t),
          }),
        })
      } finally {
        setAuthMfaBusy(false)
      }
    },
    [apiClient, mfaFeatureKey, t, userFeatureState],
  )

  const startMfaSetup = useCallback(async () => {
    setAuthMfaBusy(true)
    setAuthMfaStatus(null)
    try {
      const setup = await apiClient.setup2fa()
      setAuthMfaSetup({
        secret: setup.secret,
        otpauthUri: setup.otpauth_uri,
      })
      setAuthMfaStatus({
        kind: 'success',
        message: t('app.authMfaSetupReady'),
      })
    } catch (error) {
      setAuthMfaStatus({
        kind: 'error',
        message: t('app.authMfaSetupError', {
          message: mapApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setAuthMfaBusy(false)
    }
  }, [apiClient, t])

  const enableMfa = useCallback(async () => {
    if (authMfaOtpAction.trim().length === 0) {
      setAuthMfaStatus({
        kind: 'error',
        message: t('app.authOtpRequired'),
      })
      return
    }
    setAuthMfaBusy(true)
    setAuthMfaStatus(null)
    try {
      await apiClient.enable2fa({ otp_code: authMfaOtpAction.trim() })
      const currentUser = await apiClient.getCurrentUser()
      setAuthUser((current) =>
        current
          ? {
              ...current,
              mfaEnabled: currentUser.mfa_enabled === true,
            }
          : current,
      )
      setAuthMfaOtpAction('')
      setAuthMfaSetup(null)
      setAuthMfaStatus({
        kind: 'success',
        message: t('app.authMfaEnabledNow'),
      })
    } catch (error) {
      setAuthMfaStatus({
        kind: 'error',
        message: t('app.authMfaEnableError', {
          message: mapApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setAuthMfaBusy(false)
    }
  }, [apiClient, authMfaOtpAction, t])

  const disableMfa = useCallback(async () => {
    if (authMfaOtpAction.trim().length === 0) {
      setAuthMfaStatus({
        kind: 'error',
        message: t('app.authOtpRequired'),
      })
      return
    }
    setAuthMfaBusy(true)
    setAuthMfaStatus(null)
    try {
      await apiClient.disable2fa({ otp_code: authMfaOtpAction.trim() })
      const currentUser = await apiClient.getCurrentUser()
      setAuthUser((current) =>
        current
          ? {
              ...current,
              mfaEnabled: currentUser.mfa_enabled === true,
            }
          : current,
      )
      setAuthMfaOtpAction('')
      setAuthMfaStatus({
        kind: 'success',
        message: t('app.authMfaDisabledNow'),
      })
    } catch (error) {
      setAuthMfaStatus({
        kind: 'error',
        message: t('app.authMfaDisableError', {
          message: mapApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setAuthMfaBusy(false)
    }
  }, [apiClient, authMfaOtpAction, t])

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
