import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  adminConfirmVerifyEmail,
  confirmVerifyEmail,
  loginWithContext,
  requestLostPassword,
  requestVerifyEmail,
  resetLostPassword,
  setupMfa,
  toggleMfa,
} from '../../application/auth/authUseCases'

type LoginClient = Parameters<typeof loginWithContext>[0]['apiClient']
type LostPasswordClient = Parameters<typeof requestLostPassword>[0]['apiClient']
type VerifyEmailClient = Parameters<typeof requestVerifyEmail>[0]['apiClient']
type MfaClient = Parameters<typeof setupMfa>[0]['apiClient']

export const loginWithContextThunk = createAsyncThunk(
  'auth/loginWithContext',
  async (args: { apiClient: LoginClient; email: string; password: string; otpCode: string }) => {
    return loginWithContext({
      apiClient: args.apiClient,
      email: args.email,
      password: args.password,
      otpCode: args.otpCode,
    })
  },
)

export const requestLostPasswordThunk = createAsyncThunk(
  'auth/requestLostPassword',
  async (args: { apiClient: LostPasswordClient; email: string }) => {
    return requestLostPassword({
      apiClient: args.apiClient,
      email: args.email,
    })
  },
)

export const resetLostPasswordThunk = createAsyncThunk(
  'auth/resetLostPassword',
  async (args: { apiClient: LostPasswordClient; token: string; newPassword: string }) => {
    return resetLostPassword({
      apiClient: args.apiClient,
      token: args.token,
      newPassword: args.newPassword,
    })
  },
)

export const requestVerifyEmailThunk = createAsyncThunk(
  'auth/requestVerifyEmail',
  async (args: { apiClient: VerifyEmailClient; email: string }) => {
    return requestVerifyEmail({
      apiClient: args.apiClient,
      email: args.email,
    })
  },
)

export const confirmVerifyEmailThunk = createAsyncThunk(
  'auth/confirmVerifyEmail',
  async (args: { apiClient: VerifyEmailClient; token: string }) => {
    return confirmVerifyEmail({
      apiClient: args.apiClient,
      token: args.token,
    })
  },
)

export const adminConfirmVerifyEmailThunk = createAsyncThunk(
  'auth/adminConfirmVerifyEmail',
  async (args: { apiClient: VerifyEmailClient; email: string }) => {
    return adminConfirmVerifyEmail({
      apiClient: args.apiClient,
      email: args.email,
    })
  },
)

export const setupMfaThunk = createAsyncThunk(
  'auth/setupMfa',
  async (args: { apiClient: MfaClient }) => {
    return setupMfa({ apiClient: args.apiClient })
  },
)

export const toggleMfaThunk = createAsyncThunk(
  'auth/toggleMfa',
  async (args: { apiClient: MfaClient; otpCode: string; target: 'enable' | 'disable' }) => {
    return toggleMfa({
      apiClient: args.apiClient,
      otpCode: args.otpCode,
      target: args.target,
    })
  },
)
