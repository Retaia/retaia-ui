import { useCallback } from 'react'
import { type ApiClient } from '../../api/client'
import { mapApiErrorToMessage } from '../../api/errorMapping'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  setLostPasswordEmailInput,
  setLostPasswordLoading,
  setLostPasswordMode,
  setLostPasswordNewPasswordInput,
  setLostPasswordStatus,
  setLostPasswordTokenInput,
  setVerifyEmailInput,
  setVerifyEmailLoading,
  setVerifyEmailMode,
  setVerifyEmailStatus,
  setVerifyEmailTokenInput,
} from '../../store/slices/authUiSlice'
import {
  adminConfirmVerifyEmailThunk,
  confirmVerifyEmailThunk,
  requestLostPasswordThunk,
  requestVerifyEmailThunk,
  resetLostPasswordThunk,
} from '../../store/thunks/authThunks'

type Translator = (key: string, options?: Record<string, unknown>) => string

type RecoveryClient = Pick<
  ApiClient,
  | 'requestLostPassword'
  | 'resetLostPassword'
  | 'requestEmailVerification'
  | 'confirmEmailVerification'
  | 'adminConfirmEmailVerification'
>

type SetStateAction<T> = T | ((current: T) => T)

export function useAuthRecoveryController(args: {
  apiClient: RecoveryClient
  t: Translator
}) {
  const { apiClient, t } = args
  const dispatch = useAppDispatch()
  const lostPasswordMode = useAppSelector((state) => state.authUi.lostPasswordMode)
  const lostPasswordEmailInput = useAppSelector((state) => state.authUi.lostPasswordEmailInput)
  const lostPasswordTokenInput = useAppSelector((state) => state.authUi.lostPasswordTokenInput)
  const lostPasswordNewPasswordInput = useAppSelector((state) => state.authUi.lostPasswordNewPasswordInput)
  const lostPasswordStatus = useAppSelector((state) => state.authUi.lostPasswordStatus)
  const lostPasswordLoading = useAppSelector((state) => state.authUi.lostPasswordLoading)
  const verifyEmailMode = useAppSelector((state) => state.authUi.verifyEmailMode)
  const verifyEmailInput = useAppSelector((state) => state.authUi.verifyEmailInput)
  const verifyEmailTokenInput = useAppSelector((state) => state.authUi.verifyEmailTokenInput)
  const verifyEmailStatus = useAppSelector((state) => state.authUi.verifyEmailStatus)
  const verifyEmailLoading = useAppSelector((state) => state.authUi.verifyEmailLoading)

  const handleLostPasswordRequest = useCallback(async () => {
    dispatch(setLostPasswordLoading(true))
    dispatch(setLostPasswordStatus(null))
    try {
      const result = await dispatch(requestLostPasswordThunk({
        apiClient,
        email: lostPasswordEmailInput,
      })).unwrap()
      if (result.kind === 'validation_error') {
        dispatch(setLostPasswordStatus({
          kind: 'error',
          message: t('app.authLostPasswordEmailRequired'),
        }))
        return
      }
      if (result.kind === 'api_error') {
        dispatch(setLostPasswordStatus({
          kind: 'error',
          message: t('app.authLostPasswordRequestError', {
            message: mapApiErrorToMessage(result.error, t),
          }),
        }))
        return
      }
      dispatch(setLostPasswordStatus({
        kind: 'success',
        message: t('app.authLostPasswordRequestSent'),
      }))
    } finally {
      dispatch(setLostPasswordLoading(false))
    }
  }, [apiClient, dispatch, lostPasswordEmailInput, t])

  const handleLostPasswordReset = useCallback(async () => {
    dispatch(setLostPasswordLoading(true))
    dispatch(setLostPasswordStatus(null))
    try {
      const result = await dispatch(resetLostPasswordThunk({
        apiClient,
        token: lostPasswordTokenInput,
        newPassword: lostPasswordNewPasswordInput,
      })).unwrap()
      if (result.kind === 'validation_error') {
        dispatch(setLostPasswordStatus({
          kind: 'error',
          message: t('app.authLostPasswordResetMissing'),
        }))
        return
      }
      if (result.kind === 'api_error') {
        dispatch(setLostPasswordStatus({
          kind: 'error',
          message: t('app.authLostPasswordResetError', {
            message: mapApiErrorToMessage(result.error, t),
          }),
        }))
        return
      }
      dispatch(setLostPasswordNewPasswordInput(''))
      dispatch(setLostPasswordStatus({
        kind: 'success',
        message: t('app.authLostPasswordResetSuccess'),
      }))
    } finally {
      dispatch(setLostPasswordLoading(false))
    }
  }, [apiClient, dispatch, lostPasswordNewPasswordInput, lostPasswordTokenInput, t])

  const handleVerifyEmailRequest = useCallback(async () => {
    dispatch(setVerifyEmailLoading(true))
    dispatch(setVerifyEmailStatus(null))
    try {
      const result = await dispatch(requestVerifyEmailThunk({
        apiClient,
        email: verifyEmailInput,
      })).unwrap()
      if (result.kind === 'validation_error') {
        dispatch(setVerifyEmailStatus({
          kind: 'error',
          message: t('app.authVerifyEmailInputRequired'),
        }))
        return
      }
      if (result.kind === 'api_error') {
        dispatch(setVerifyEmailStatus({
          kind: 'error',
          message: t('app.authVerifyEmailRequestError', {
            message: mapApiErrorToMessage(result.error, t),
          }),
        }))
        return
      }
      dispatch(setVerifyEmailStatus({
        kind: 'success',
        message: t('app.authVerifyEmailRequested'),
      }))
    } finally {
      dispatch(setVerifyEmailLoading(false))
    }
  }, [apiClient, dispatch, t, verifyEmailInput])

  const handleVerifyEmailConfirm = useCallback(async () => {
    dispatch(setVerifyEmailLoading(true))
    dispatch(setVerifyEmailStatus(null))
    try {
      const result = await dispatch(confirmVerifyEmailThunk({
        apiClient,
        token: verifyEmailTokenInput,
      })).unwrap()
      if (result.kind === 'validation_error') {
        dispatch(setVerifyEmailStatus({
          kind: 'error',
          message: t('app.authVerifyEmailTokenRequired'),
        }))
        return
      }
      if (result.kind === 'api_error') {
        dispatch(setVerifyEmailStatus({
          kind: 'error',
          message: t('app.authVerifyEmailConfirmError', {
            message: mapApiErrorToMessage(result.error, t),
          }),
        }))
        return
      }
      dispatch(setVerifyEmailTokenInput(''))
      dispatch(setVerifyEmailStatus({
        kind: 'success',
        message: t('app.authVerifyEmailConfirmed'),
      }))
    } finally {
      dispatch(setVerifyEmailLoading(false))
    }
  }, [apiClient, dispatch, t, verifyEmailTokenInput])

  const handleVerifyEmailAdminConfirm = useCallback(async () => {
    dispatch(setVerifyEmailLoading(true))
    dispatch(setVerifyEmailStatus(null))
    try {
      const result = await dispatch(adminConfirmVerifyEmailThunk({
        apiClient,
        email: verifyEmailInput,
      })).unwrap()
      if (result.kind === 'validation_error') {
        dispatch(setVerifyEmailStatus({
          kind: 'error',
          message: t('app.authVerifyEmailInputRequired'),
        }))
        return
      }
      if (result.kind === 'api_error') {
        dispatch(setVerifyEmailStatus({
          kind: 'error',
          message: t('app.authVerifyEmailAdminConfirmError', {
            message: mapApiErrorToMessage(result.error, t),
          }),
        }))
        return
      }
      dispatch(setVerifyEmailStatus({
        kind: 'success',
        message: t('app.authVerifyEmailAdminConfirmed'),
      }))
    } finally {
      dispatch(setVerifyEmailLoading(false))
    }
  }, [apiClient, dispatch, t, verifyEmailInput])

  return {
    lostPasswordMode,
    setLostPasswordMode: (value: SetStateAction<'request' | 'reset'>) => {
      const nextValue = typeof value === 'function' ? value(lostPasswordMode) : value
      dispatch(setLostPasswordMode(nextValue))
    },
    lostPasswordEmailInput,
    setLostPasswordEmailInput: (value: string) => dispatch(setLostPasswordEmailInput(value)),
    lostPasswordTokenInput,
    setLostPasswordTokenInput: (value: string) => dispatch(setLostPasswordTokenInput(value)),
    lostPasswordNewPasswordInput,
    setLostPasswordNewPasswordInput: (value: string) => dispatch(setLostPasswordNewPasswordInput(value)),
    lostPasswordStatus,
    lostPasswordLoading,
    verifyEmailMode,
    setVerifyEmailMode: (value: 'request' | 'confirm' | 'admin') => dispatch(setVerifyEmailMode(value)),
    verifyEmailInput,
    setVerifyEmailInput: (value: string) => dispatch(setVerifyEmailInput(value)),
    verifyEmailTokenInput,
    setVerifyEmailTokenInput: (value: string) => dispatch(setVerifyEmailTokenInput(value)),
    verifyEmailStatus,
    verifyEmailLoading,
    handleLostPasswordRequest,
    handleLostPasswordReset,
    handleVerifyEmailRequest,
    handleVerifyEmailConfirm,
    handleVerifyEmailAdminConfirm,
  }
}
