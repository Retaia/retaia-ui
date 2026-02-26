import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthUserProfile } from '../../application/auth/authUseCases'
import type { FeatureState } from '../../domain/auth/features'
import { readStoredApiBaseUrl, readStoredApiToken, readStoredLoginEmail } from '../../services/apiSession'

type Status = {
  kind: 'success' | 'error'
  message: string
}

export type AuthUiState = {
  retryStatus: string | null
  apiTokenInput: string
  apiBaseUrlInput: string
  apiConnectionStatus: Status | null
  authEmailInput: string
  authPasswordInput: string
  authOtpInput: string
  authStatus: Status | null
  authLoading: boolean
  authRequiresOtp: boolean
  authUser: AuthUserProfile | null
  userFeatureState: FeatureState | null
  lostPasswordMode: 'request' | 'reset'
  lostPasswordEmailInput: string
  lostPasswordTokenInput: string
  lostPasswordNewPasswordInput: string
  lostPasswordStatus: Status | null
  lostPasswordLoading: boolean
  verifyEmailMode: 'request' | 'confirm' | 'admin'
  verifyEmailInput: string
  verifyEmailTokenInput: string
  verifyEmailStatus: Status | null
  verifyEmailLoading: boolean
  authMfaStatus: Status | null
  authMfaBusy: boolean
  authMfaSetup: { secret: string; otpauthUri: string } | null
  authMfaOtpAction: string
}

export function createInitialAuthUiState(): AuthUiState {
  return {
    retryStatus: null,
    apiTokenInput: readStoredApiToken(),
    apiBaseUrlInput: readStoredApiBaseUrl(),
    apiConnectionStatus: null,
    authEmailInput: readStoredLoginEmail(),
    authPasswordInput: '',
    authOtpInput: '',
    authStatus: null,
    authLoading: false,
    authRequiresOtp: false,
    authUser: null,
    userFeatureState: null,
    lostPasswordMode: 'request',
    lostPasswordEmailInput: '',
    lostPasswordTokenInput: '',
    lostPasswordNewPasswordInput: '',
    lostPasswordStatus: null,
    lostPasswordLoading: false,
    verifyEmailMode: 'request',
    verifyEmailInput: '',
    verifyEmailTokenInput: '',
    verifyEmailStatus: null,
    verifyEmailLoading: false,
    authMfaStatus: null,
    authMfaBusy: false,
    authMfaSetup: null,
    authMfaOtpAction: '',
  }
}

const initialState = createInitialAuthUiState()

const authUiSlice = createSlice({
  name: 'authUi',
  initialState,
  reducers: {
    patchAuthUiState: (state, action: PayloadAction<Partial<AuthUiState>>) => ({ ...state, ...action.payload }),
    setAuthRetryStatus: (state, action: PayloadAction<string | null>) => {
      state.retryStatus = action.payload
    },
    setApiTokenInput: (state, action: PayloadAction<string>) => {
      state.apiTokenInput = action.payload
    },
    setApiBaseUrlInput: (state, action: PayloadAction<string>) => {
      state.apiBaseUrlInput = action.payload
    },
    setApiConnectionStatus: (state, action: PayloadAction<Status | null>) => {
      state.apiConnectionStatus = action.payload
    },
    setAuthEmailInput: (state, action: PayloadAction<string>) => {
      state.authEmailInput = action.payload
    },
    setAuthPasswordInput: (state, action: PayloadAction<string>) => {
      state.authPasswordInput = action.payload
    },
    setAuthOtpInput: (state, action: PayloadAction<string>) => {
      state.authOtpInput = action.payload
    },
    setAuthStatus: (state, action: PayloadAction<Status | null>) => {
      state.authStatus = action.payload
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.authLoading = action.payload
    },
    setAuthRequiresOtp: (state, action: PayloadAction<boolean>) => {
      state.authRequiresOtp = action.payload
    },
    setAuthUser: (state, action: PayloadAction<AuthUserProfile | null>) => {
      state.authUser = action.payload
    },
    setUserFeatureState: (state, action: PayloadAction<FeatureState | null>) => {
      state.userFeatureState = action.payload
    },
    setLostPasswordMode: (state, action: PayloadAction<'request' | 'reset'>) => {
      state.lostPasswordMode = action.payload
    },
    setLostPasswordEmailInput: (state, action: PayloadAction<string>) => {
      state.lostPasswordEmailInput = action.payload
    },
    setLostPasswordTokenInput: (state, action: PayloadAction<string>) => {
      state.lostPasswordTokenInput = action.payload
    },
    setLostPasswordNewPasswordInput: (state, action: PayloadAction<string>) => {
      state.lostPasswordNewPasswordInput = action.payload
    },
    setLostPasswordStatus: (state, action: PayloadAction<Status | null>) => {
      state.lostPasswordStatus = action.payload
    },
    setLostPasswordLoading: (state, action: PayloadAction<boolean>) => {
      state.lostPasswordLoading = action.payload
    },
    setVerifyEmailMode: (state, action: PayloadAction<'request' | 'confirm' | 'admin'>) => {
      state.verifyEmailMode = action.payload
    },
    setVerifyEmailInput: (state, action: PayloadAction<string>) => {
      state.verifyEmailInput = action.payload
    },
    setVerifyEmailTokenInput: (state, action: PayloadAction<string>) => {
      state.verifyEmailTokenInput = action.payload
    },
    setVerifyEmailStatus: (state, action: PayloadAction<Status | null>) => {
      state.verifyEmailStatus = action.payload
    },
    setVerifyEmailLoading: (state, action: PayloadAction<boolean>) => {
      state.verifyEmailLoading = action.payload
    },
    setAuthMfaStatus: (state, action: PayloadAction<Status | null>) => {
      state.authMfaStatus = action.payload
    },
    setAuthMfaBusy: (state, action: PayloadAction<boolean>) => {
      state.authMfaBusy = action.payload
    },
    setAuthMfaSetup: (state, action: PayloadAction<{ secret: string; otpauthUri: string } | null>) => {
      state.authMfaSetup = action.payload
    },
    setAuthMfaOtpAction: (state, action: PayloadAction<string>) => {
      state.authMfaOtpAction = action.payload
    },
  },
})

export const {
  patchAuthUiState,
  setAuthRetryStatus,
  setApiTokenInput,
  setApiBaseUrlInput,
  setApiConnectionStatus,
  setAuthEmailInput,
  setAuthPasswordInput,
  setAuthOtpInput,
  setAuthStatus,
  setAuthLoading,
  setAuthRequiresOtp,
  setAuthUser,
  setUserFeatureState,
  setLostPasswordMode,
  setLostPasswordEmailInput,
  setLostPasswordTokenInput,
  setLostPasswordNewPasswordInput,
  setLostPasswordStatus,
  setLostPasswordLoading,
  setVerifyEmailMode,
  setVerifyEmailInput,
  setVerifyEmailTokenInput,
  setVerifyEmailStatus,
  setVerifyEmailLoading,
  setAuthMfaStatus,
  setAuthMfaBusy,
  setAuthMfaSetup,
  setAuthMfaOtpAction,
} = authUiSlice.actions

export const authUiReducer = authUiSlice.reducer
