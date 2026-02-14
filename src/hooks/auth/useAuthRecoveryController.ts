import { useCallback, useState } from 'react'
import { type ApiClient } from '../../api/client'
import { mapApiErrorToMessage } from '../../api/errorMapping'
import {
  adminConfirmVerifyEmail,
  confirmVerifyEmail,
  requestLostPassword,
  requestVerifyEmail,
  resetLostPassword,
} from '../../application/auth/authUseCases'

type Translator = (key: string, options?: Record<string, unknown>) => string

type RecoveryClient = Pick<
  ApiClient,
  | 'requestLostPassword'
  | 'resetLostPassword'
  | 'requestEmailVerification'
  | 'confirmEmailVerification'
  | 'adminConfirmEmailVerification'
>

type Status = {
  kind: 'success' | 'error'
  message: string
}

export function useAuthRecoveryController(args: {
  apiClient: RecoveryClient
  t: Translator
}) {
  const { apiClient, t } = args
  const [lostPasswordMode, setLostPasswordMode] = useState<'request' | 'reset'>('request')
  const [lostPasswordEmailInput, setLostPasswordEmailInput] = useState('')
  const [lostPasswordTokenInput, setLostPasswordTokenInput] = useState('')
  const [lostPasswordNewPasswordInput, setLostPasswordNewPasswordInput] = useState('')
  const [lostPasswordStatus, setLostPasswordStatus] = useState<Status | null>(null)
  const [lostPasswordLoading, setLostPasswordLoading] = useState(false)
  const [verifyEmailMode, setVerifyEmailMode] = useState<'request' | 'confirm' | 'admin'>('request')
  const [verifyEmailInput, setVerifyEmailInput] = useState('')
  const [verifyEmailTokenInput, setVerifyEmailTokenInput] = useState('')
  const [verifyEmailStatus, setVerifyEmailStatus] = useState<Status | null>(null)
  const [verifyEmailLoading, setVerifyEmailLoading] = useState(false)

  const handleLostPasswordRequest = useCallback(async () => {
    setLostPasswordLoading(true)
    setLostPasswordStatus(null)
    try {
      const result = await requestLostPassword({
        apiClient,
        email: lostPasswordEmailInput,
      })
      if (result.kind === 'validation_error') {
        setLostPasswordStatus({
          kind: 'error',
          message: t('app.authLostPasswordEmailRequired'),
        })
        return
      }
      if (result.kind === 'api_error') {
        setLostPasswordStatus({
          kind: 'error',
          message: t('app.authLostPasswordRequestError', {
            message: mapApiErrorToMessage(result.error, t),
          }),
        })
        return
      }
      setLostPasswordStatus({
        kind: 'success',
        message: t('app.authLostPasswordRequestSent'),
      })
    } finally {
      setLostPasswordLoading(false)
    }
  }, [apiClient, lostPasswordEmailInput, t])

  const handleLostPasswordReset = useCallback(async () => {
    setLostPasswordLoading(true)
    setLostPasswordStatus(null)
    try {
      const result = await resetLostPassword({
        apiClient,
        token: lostPasswordTokenInput,
        newPassword: lostPasswordNewPasswordInput,
      })
      if (result.kind === 'validation_error') {
        setLostPasswordStatus({
          kind: 'error',
          message: t('app.authLostPasswordResetMissing'),
        })
        return
      }
      if (result.kind === 'api_error') {
        setLostPasswordStatus({
          kind: 'error',
          message: t('app.authLostPasswordResetError', {
            message: mapApiErrorToMessage(result.error, t),
          }),
        })
        return
      }
      setLostPasswordNewPasswordInput('')
      setLostPasswordStatus({
        kind: 'success',
        message: t('app.authLostPasswordResetSuccess'),
      })
    } finally {
      setLostPasswordLoading(false)
    }
  }, [apiClient, lostPasswordNewPasswordInput, lostPasswordTokenInput, t])

  const handleVerifyEmailRequest = useCallback(async () => {
    setVerifyEmailLoading(true)
    setVerifyEmailStatus(null)
    try {
      const result = await requestVerifyEmail({
        apiClient,
        email: verifyEmailInput,
      })
      if (result.kind === 'validation_error') {
        setVerifyEmailStatus({
          kind: 'error',
          message: t('app.authVerifyEmailInputRequired'),
        })
        return
      }
      if (result.kind === 'api_error') {
        setVerifyEmailStatus({
          kind: 'error',
          message: t('app.authVerifyEmailRequestError', {
            message: mapApiErrorToMessage(result.error, t),
          }),
        })
        return
      }
      setVerifyEmailStatus({
        kind: 'success',
        message: t('app.authVerifyEmailRequested'),
      })
    } finally {
      setVerifyEmailLoading(false)
    }
  }, [apiClient, t, verifyEmailInput])

  const handleVerifyEmailConfirm = useCallback(async () => {
    setVerifyEmailLoading(true)
    setVerifyEmailStatus(null)
    try {
      const result = await confirmVerifyEmail({
        apiClient,
        token: verifyEmailTokenInput,
      })
      if (result.kind === 'validation_error') {
        setVerifyEmailStatus({
          kind: 'error',
          message: t('app.authVerifyEmailTokenRequired'),
        })
        return
      }
      if (result.kind === 'api_error') {
        setVerifyEmailStatus({
          kind: 'error',
          message: t('app.authVerifyEmailConfirmError', {
            message: mapApiErrorToMessage(result.error, t),
          }),
        })
        return
      }
      setVerifyEmailTokenInput('')
      setVerifyEmailStatus({
        kind: 'success',
        message: t('app.authVerifyEmailConfirmed'),
      })
    } finally {
      setVerifyEmailLoading(false)
    }
  }, [apiClient, t, verifyEmailTokenInput])

  const handleVerifyEmailAdminConfirm = useCallback(async () => {
    setVerifyEmailLoading(true)
    setVerifyEmailStatus(null)
    try {
      const result = await adminConfirmVerifyEmail({
        apiClient,
        email: verifyEmailInput,
      })
      if (result.kind === 'validation_error') {
        setVerifyEmailStatus({
          kind: 'error',
          message: t('app.authVerifyEmailInputRequired'),
        })
        return
      }
      if (result.kind === 'api_error') {
        setVerifyEmailStatus({
          kind: 'error',
          message: t('app.authVerifyEmailAdminConfirmError', {
            message: mapApiErrorToMessage(result.error, t),
          }),
        })
        return
      }
      setVerifyEmailStatus({
        kind: 'success',
        message: t('app.authVerifyEmailAdminConfirmed'),
      })
    } finally {
      setVerifyEmailLoading(false)
    }
  }, [apiClient, t, verifyEmailInput])

  return {
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
  }
}
