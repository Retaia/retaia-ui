import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'
import { type ApiClient } from '../../api/client'
import { mapApiErrorToMessage } from '../../api/errorMapping'
import { type AuthUserProfile, setupMfa, toggleMfa } from '../../application/auth/authUseCases'
import {
  getMfaToggleErrorKey,
  getMfaToggleSuccessKey,
  type MfaToggleTarget,
  updateAuthUserMfaFlag,
} from '../../application/auth/mfaPresentation'

type Translator = (key: string, options?: Record<string, unknown>) => string

type AuthMfaStatus = {
  kind: 'success' | 'error'
  message: string
}

type AuthMfaClient = Pick<ApiClient, 'setup2fa' | 'enable2fa' | 'disable2fa' | 'getCurrentUser'>

export function useAuthMfaController(args: {
  apiClient: AuthMfaClient
  t: Translator
  setAuthUser: Dispatch<SetStateAction<AuthUserProfile | null>>
}) {
  const { apiClient, setAuthUser, t } = args

  const [authMfaStatus, setAuthMfaStatus] = useState<AuthMfaStatus | null>(null)
  const [authMfaBusy, setAuthMfaBusy] = useState(false)
  const [authMfaSetup, setAuthMfaSetup] = useState<{
    secret: string
    otpauthUri: string
  } | null>(null)
  const [authMfaOtpAction, setAuthMfaOtpAction] = useState('')

  const startMfaSetup = useCallback(async () => {
    setAuthMfaBusy(true)
    setAuthMfaStatus(null)
    try {
      const result = await setupMfa({ apiClient })
      if (result.kind === 'api_error') {
        setAuthMfaStatus({
          kind: 'error',
          message: t('app.authMfaSetupError', {
            message: mapApiErrorToMessage(result.error, t),
          }),
        })
        return
      }
      setAuthMfaSetup(result.setup)
      setAuthMfaStatus({
        kind: 'success',
        message: t('app.authMfaSetupReady'),
      })
    } finally {
      setAuthMfaBusy(false)
    }
  }, [apiClient, t])

  const submitMfaToggle = useCallback(
    async (target: MfaToggleTarget) => {
      setAuthMfaBusy(true)
      setAuthMfaStatus(null)
      try {
        const result = await toggleMfa({
          apiClient,
          otpCode: authMfaOtpAction,
          target,
        })
        if (result.kind === 'validation_error') {
          setAuthMfaStatus({
            kind: 'error',
            message: t('app.authOtpRequired'),
          })
          return
        }
        if (result.kind === 'api_error') {
          setAuthMfaStatus({
            kind: 'error',
            message: t(getMfaToggleErrorKey(target), {
              message: mapApiErrorToMessage(result.error, t),
            }),
          })
          return
        }
        if (result.kind === 'success_with_user') {
          setAuthUser((currentUser) => updateAuthUserMfaFlag(currentUser, result.authUser.mfaEnabled))
        }
        setAuthMfaOtpAction('')
        if (target === 'enable') {
          setAuthMfaSetup(null)
        }
        setAuthMfaStatus({
          kind: 'success',
          message: t(getMfaToggleSuccessKey(target)),
        })
      } finally {
        setAuthMfaBusy(false)
      }
    },
    [apiClient, authMfaOtpAction, setAuthUser, t],
  )

  const enableMfa = useCallback(async () => {
    await submitMfaToggle('enable')
  }, [submitMfaToggle])

  const disableMfa = useCallback(async () => {
    await submitMfaToggle('disable')
  }, [submitMfaToggle])

  const resetMfaState = useCallback(() => {
    setAuthMfaStatus(null)
    setAuthMfaSetup(null)
    setAuthMfaOtpAction('')
  }, [])

  return {
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
  }
}
