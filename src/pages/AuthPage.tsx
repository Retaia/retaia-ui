import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ApiError, createApiClient } from '../api/client'
import { mapApiErrorToMessage } from '../api/errorMapping'

const API_TOKEN_STORAGE_KEY = 'retaia_api_token'
const API_BASE_URL_STORAGE_KEY = 'retaia_api_base_url'
const API_LOGIN_EMAIL_STORAGE_KEY = 'retaia_auth_email'

type FeatureState = {
  userFeatureEnabled: Record<string, boolean>
  effectiveFeatureEnabled: Record<string, boolean>
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

export function AuthPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [retryStatus, setRetryStatus] = useState<string | null>(null)
  const [apiTokenInput, setApiTokenInput] = useState(() => {
    if (typeof window === 'undefined') {
      return ''
    }
    try {
      return window.localStorage.getItem(API_TOKEN_STORAGE_KEY) ?? ''
    } catch {
      return ''
    }
  })
  const [apiBaseUrlInput, setApiBaseUrlInput] = useState(() => {
    if (typeof window === 'undefined') {
      return ''
    }
    try {
      return window.localStorage.getItem(API_BASE_URL_STORAGE_KEY) ?? ''
    } catch {
      return ''
    }
  })
  const [authEmailInput, setAuthEmailInput] = useState(() => {
    if (typeof window === 'undefined') {
      return ''
    }
    try {
      return window.localStorage.getItem(API_LOGIN_EMAIL_STORAGE_KEY) ?? ''
    } catch {
      return ''
    }
  })
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
  } | null>(null)
  const [userFeatureState, setUserFeatureState] = useState<FeatureState | null>(null)
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

  const effectiveApiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ?? (apiBaseUrlInput.trim() || '/api/v1')
  const effectiveApiToken = import.meta.env.VITE_API_TOKEN ?? (apiTokenInput.trim() || null)
  const isApiBaseUrlLockedByEnv = !!import.meta.env.VITE_API_BASE_URL
  const isApiAuthLockedByEnv = !!import.meta.env.VITE_API_TOKEN
  const isApiConfigLockedByEnv = isApiBaseUrlLockedByEnv || isApiAuthLockedByEnv

  const apiClient = useMemo(
    () =>
      createApiClient({
        baseUrl: effectiveApiBaseUrl,
        getAccessToken: () => effectiveApiToken,
        onAuthError: () => {
          setApiConnectionStatus({
            kind: 'error',
            message: t('app.apiConnectionAuthError'),
          })
        },
        onRetry: ({ attempt, maxRetries }) => {
          setRetryStatus(
            t('actions.retrying', {
              attempt,
              total: maxRetries + 1,
            }),
          )
        },
        retry: {
          maxRetries: 2,
          baseDelayMs: 50,
        },
      }),
    [effectiveApiBaseUrl, effectiveApiToken, t],
  )

  const saveApiConnectionSettings = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      window.localStorage.setItem(API_BASE_URL_STORAGE_KEY, apiBaseUrlInput.trim())
      setApiConnectionStatus({
        kind: 'success',
        message: t('app.apiConnectionSaved'),
      })
    } catch {
      setApiConnectionStatus({
        kind: 'error',
        message: t('app.apiConnectionSaveError'),
      })
    }
  }, [apiBaseUrlInput, t])

  const clearApiConnectionSettings = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      window.localStorage.removeItem(API_BASE_URL_STORAGE_KEY)
      setApiBaseUrlInput('')
      setApiConnectionStatus({
        kind: 'success',
        message: t('app.apiConnectionCleared'),
      })
    } catch {
      setApiConnectionStatus({
        kind: 'error',
        message: t('app.apiConnectionSaveError'),
      })
    }
  }, [t])

  const persistAuthToken = useCallback((token: string) => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(API_TOKEN_STORAGE_KEY, token)
  }, [])

  const clearPersistedAuthToken = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.removeItem(API_TOKEN_STORAGE_KEY)
  }, [])

  const persistLoginEmail = useCallback((email: string) => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(API_LOGIN_EMAIL_STORAGE_KEY, email)
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
        })
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
    return userFeatureState.effectiveFeatureEnabled[mfaFeatureKey] === true
  }, [mfaFeatureKey, userFeatureState])

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

  return (
    <Container as="main" className="py-4">
      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h1 className="display-6 fw-bold mb-1">{t('app.authTitle')}</h1>
          <p className="text-secondary mb-0">{t('app.apiConnectionSubtitle')}</p>
        </div>
        <Button type="button" size="sm" variant="outline-secondary" onClick={() => navigate('/review')}>
          {t('app.backToReview')}
        </Button>
      </div>
      <Card as="section" className="shadow-sm border-0 mt-3" aria-label={t('app.apiConnectionTitle')}>
        <Card.Body>
          <h2 className="h6 mb-3">{t('app.apiConnectionTitle')}</h2>
          <section className="border border-2 border-secondary-subtle rounded p-3 mb-3" aria-label={t('app.authTitle')}>
            <h3 className="h6 mb-2">{t('app.authTitle')}</h3>
            {authUser ? (
              <p className="small mb-2 text-secondary" data-testid="auth-user-status">
                {t('app.authSignedInAs', {
                  identity: authUser.displayName ?? authUser.email,
                })}
                {authUser.mfaEnabled ? ` · ${t('app.authMfaEnabled')}` : ''}
              </p>
            ) : (
              <p className="small mb-2 text-secondary" data-testid="auth-user-status">
                {t('app.authSignedOut')}
              </p>
            )}
            {!isApiAuthLockedByEnv && !authUser ? (
              <>
                <Row className="g-2">
                  <Col md={4}>
                    <Form.Label htmlFor="auth-email-input" className="small mb-1">
                      {t('app.authEmailLabel')}
                    </Form.Label>
                    <Form.Control
                      id="auth-email-input"
                      data-testid="auth-email-input"
                      value={authEmailInput}
                      type="email"
                      onChange={(event) => setAuthEmailInput(event.target.value)}
                      autoComplete="username"
                      disabled={authLoading}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label htmlFor="auth-password-input" className="small mb-1">
                      {t('app.authPasswordLabel')}
                    </Form.Label>
                    <Form.Control
                      id="auth-password-input"
                      data-testid="auth-password-input"
                      value={authPasswordInput}
                      type="password"
                      onChange={(event) => setAuthPasswordInput(event.target.value)}
                      autoComplete="current-password"
                      disabled={authLoading}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label htmlFor="auth-otp-input" className="small mb-1">
                      {t('app.authOtpLabel')}
                    </Form.Label>
                    <Form.Control
                      id="auth-otp-input"
                      data-testid="auth-otp-input"
                      value={authOtpInput}
                      type="text"
                      inputMode="numeric"
                      onChange={(event) => setAuthOtpInput(event.target.value)}
                      placeholder={
                        authRequiresOtp
                          ? t('app.authOtpRequiredPlaceholder')
                          : t('app.authOtpOptionalPlaceholder')
                      }
                      disabled={authLoading}
                    />
                  </Col>
                </Row>
                <div className="d-flex flex-wrap gap-2 mt-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    data-testid="auth-login"
                    disabled={authLoading}
                    onClick={() => void handleLogin()}
                  >
                    {authLoading ? t('app.authLoggingIn') : t('app.authLogin')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="link"
                    data-testid="auth-lost-password-toggle"
                    onClick={() =>
                      setLostPasswordMode((current) =>
                        current === 'request' ? 'reset' : 'request',
                      )
                    }
                  >
                    {t('app.authLostPasswordLink')}
                  </Button>
                </div>
              </>
            ) : null}
            {authUser && !isApiAuthLockedByEnv ? (
              <div className="d-flex flex-wrap gap-2 mt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline-secondary"
                  data-testid="auth-logout"
                  disabled={authLoading}
                  onClick={() => void handleLogout()}
                >
                  {t('app.authLogout')}
                </Button>
              </div>
            ) : null}
            {isApiAuthLockedByEnv ? (
              <p className="small text-secondary mb-0">{t('app.authEnvLocked')}</p>
            ) : null}
            {authStatus ? (
              <p
                className={`small mt-2 mb-0 ${authStatus.kind === 'success' ? 'text-success' : 'text-danger'}`}
                data-testid="auth-status"
                role="status"
                aria-live="polite"
              >
                {authStatus.message}
              </p>
            ) : null}
            {!authUser ? (
              <section
                className="border border-2 border-secondary-subtle rounded p-3 mt-3"
                aria-label={t('app.authLostPasswordTitle')}
              >
                <h4 className="h6 mb-2">{t('app.authLostPasswordTitle')}</h4>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={lostPasswordMode === 'request' ? 'primary' : 'outline-primary'}
                    data-testid="auth-lost-password-mode-request"
                    onClick={() => setLostPasswordMode('request')}
                  >
                    {t('app.authLostPasswordModeRequest')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={lostPasswordMode === 'reset' ? 'primary' : 'outline-primary'}
                    data-testid="auth-lost-password-mode-reset"
                    onClick={() => setLostPasswordMode('reset')}
                  >
                    {t('app.authLostPasswordModeReset')}
                  </Button>
                </div>
                {lostPasswordMode === 'request' ? (
                  <>
                    <Form.Label htmlFor="auth-lost-password-email-input" className="small mb-1">
                      {t('app.authEmailLabel')}
                    </Form.Label>
                    <Form.Control
                      id="auth-lost-password-email-input"
                      data-testid="auth-lost-password-email-input"
                      type="email"
                      value={lostPasswordEmailInput}
                      onChange={(event) => setLostPasswordEmailInput(event.target.value)}
                      disabled={lostPasswordLoading}
                    />
                    <div className="mt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline-primary"
                        data-testid="auth-lost-password-request"
                        disabled={lostPasswordLoading}
                        onClick={() => void handleLostPasswordRequest()}
                      >
                        {t('app.authLostPasswordModeRequest')}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Form.Label htmlFor="auth-lost-password-token-input" className="small mb-1">
                      {t('app.authLostPasswordTokenLabel')}
                    </Form.Label>
                    <Form.Control
                      id="auth-lost-password-token-input"
                      data-testid="auth-lost-password-token-input"
                      type="text"
                      value={lostPasswordTokenInput}
                      onChange={(event) => setLostPasswordTokenInput(event.target.value)}
                      disabled={lostPasswordLoading}
                    />
                    <Form.Label
                      htmlFor="auth-lost-password-new-password-input"
                      className="small mb-1 mt-2"
                    >
                      {t('app.authLostPasswordNewPasswordLabel')}
                    </Form.Label>
                    <Form.Control
                      id="auth-lost-password-new-password-input"
                      data-testid="auth-lost-password-new-password-input"
                      type="password"
                      value={lostPasswordNewPasswordInput}
                      onChange={(event) => setLostPasswordNewPasswordInput(event.target.value)}
                      disabled={lostPasswordLoading}
                    />
                    <div className="mt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline-primary"
                        data-testid="auth-lost-password-reset"
                        disabled={lostPasswordLoading}
                        onClick={() => void handleLostPasswordReset()}
                      >
                        {t('app.authLostPasswordModeReset')}
                      </Button>
                    </div>
                  </>
                )}
                {lostPasswordStatus ? (
                  <p
                    className={`small mt-2 mb-0 ${
                      lostPasswordStatus.kind === 'success' ? 'text-success' : 'text-danger'
                    }`}
                    data-testid="auth-lost-password-status"
                  >
                    {lostPasswordStatus.message}
                  </p>
                ) : null}
              </section>
            ) : null}
            {authUser && mfaFeatureKey ? (
              <section className="border border-2 border-secondary-subtle rounded p-3 mt-3" aria-label={t('app.authMfaTitle')}>
                <h4 className="h6 mb-2">{t('app.authMfaTitle')}</h4>
                {!mfaFeatureAvailable ? (
                  <p className="small text-secondary mb-0" data-testid="auth-mfa-feature-disabled">
                    {t('app.authMfaFeatureUnavailable')}
                  </p>
                ) : (
                  <>
                    <p className="small text-secondary mb-2" data-testid="auth-mfa-state">
                      {authUser.mfaEnabled ? t('app.authMfaStateOn') : t('app.authMfaStateOff')}
                    </p>
                    {mfaFeatureUserCanDisable ? (
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={mfaFeatureUserEnabled ? 'outline-secondary' : 'outline-primary'}
                          data-testid="auth-mfa-user-toggle"
                          disabled={authMfaBusy}
                          onClick={() => void setUserFeature(!mfaFeatureUserEnabled)}
                        >
                          {mfaFeatureUserEnabled
                            ? t('app.authMfaFeatureOptOut')
                            : t('app.authMfaFeatureOptIn')}
                        </Button>
                      </div>
                    ) : null}
                    {mfaFeatureUserEnabled ? (
                      <>
                        {!authUser.mfaEnabled ? (
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline-primary"
                              data-testid="auth-mfa-setup"
                              disabled={authMfaBusy}
                              onClick={() => void startMfaSetup()}
                            >
                              {t('app.authMfaSetup')}
                            </Button>
                          </div>
                        ) : null}
                        {authMfaSetup ? (
                          <div className="small text-secondary mb-2" data-testid="auth-mfa-setup-material">
                            <div>
                              {t('app.authMfaSecretLabel')}: {authMfaSetup.secret}
                            </div>
                            <div>
                              {t('app.authMfaUriLabel')}: {authMfaSetup.otpauthUri}
                            </div>
                          </div>
                        ) : null}
                        <div className="d-flex flex-column gap-2">
                          <div>
                            <Form.Label htmlFor="auth-mfa-otp-action-input" className="small mb-1">
                              {t('app.authOtpLabel')}
                            </Form.Label>
                            <Form.Control
                              id="auth-mfa-otp-action-input"
                              data-testid="auth-mfa-otp-action-input"
                              value={authMfaOtpAction}
                              type="text"
                              inputMode="numeric"
                              onChange={(event) => setAuthMfaOtpAction(event.target.value)}
                              disabled={authMfaBusy}
                            />
                          </div>
                          {!authUser.mfaEnabled ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="primary"
                              data-testid="auth-mfa-enable"
                              disabled={authMfaBusy}
                              onClick={() => void enableMfa()}
                            >
                              {t('app.authMfaEnable')}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline-danger"
                              data-testid="auth-mfa-disable"
                              disabled={authMfaBusy}
                              onClick={() => void disableMfa()}
                            >
                              {t('app.authMfaDisable')}
                            </Button>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="small text-secondary mb-0" data-testid="auth-mfa-user-disabled">
                        {t('app.authMfaFeatureUserDisabled')}
                      </p>
                    )}
                  </>
                )}
                {authMfaStatus ? (
                  <p
                    className={`small mt-2 mb-0 ${authMfaStatus.kind === 'success' ? 'text-success' : 'text-danger'}`}
                    data-testid="auth-mfa-status"
                    role="status"
                    aria-live="polite"
                  >
                    {authMfaStatus.message}
                  </p>
                ) : null}
              </section>
            ) : null}
          </section>
          {isApiConfigLockedByEnv ? (
            <p className="small text-secondary mb-3">{t('app.apiConnectionEnvLocked')}</p>
          ) : null}
          <Row className="g-2">
            <Col md={12}>
              <Form.Label htmlFor="api-base-url-input" className="small mb-1">
                {t('app.apiBaseUrlLabel')}
              </Form.Label>
              <Form.Control
                id="api-base-url-input"
                data-testid="api-base-url-input"
                value={apiBaseUrlInput}
                onChange={(event) => setApiBaseUrlInput(event.target.value)}
                placeholder="/api/v1"
                disabled={isApiBaseUrlLockedByEnv}
              />
            </Col>
          </Row>
          <div className="d-flex flex-wrap gap-2 mt-3">
            <Button
              type="button"
              size="sm"
              variant="primary"
              data-testid="api-connection-save"
              onClick={saveApiConnectionSettings}
              disabled={isApiBaseUrlLockedByEnv}
            >
              {t('app.apiConnectionSave')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline-primary"
              data-testid="api-connection-test"
              onClick={() => void testApiConnection()}
            >
              {t('app.apiConnectionTest')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline-secondary"
              data-testid="api-connection-clear"
              onClick={clearApiConnectionSettings}
              disabled={isApiBaseUrlLockedByEnv}
            >
              {t('app.apiConnectionClear')}
            </Button>
          </div>
          {apiConnectionStatus ? (
            <p
              className={`small mt-2 mb-0 ${
                apiConnectionStatus.kind === 'success' ? 'text-success' : 'text-danger'
              }`}
              data-testid="api-connection-status"
              role="status"
              aria-live="polite"
            >
              {apiConnectionStatus.message}
            </p>
          ) : null}
          {retryStatus ? (
            <p className="small text-secondary mt-2 mb-0" data-testid="retry-status">
              {retryStatus}
            </p>
          ) : null}
        </Card.Body>
      </Card>
    </Container>
  )
}
