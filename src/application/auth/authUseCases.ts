import { ApiError, type ApiClient } from '../../api/client'
import {
  normalizeUserFeatures,
  type FeatureState,
} from '../../domain/auth/features'

type AuthClient = Pick<
  ApiClient,
  | 'login'
  | 'logout'
  | 'getCurrentUser'
  | 'getUserFeatures'
  | 'requestLostPassword'
  | 'resetLostPassword'
  | 'requestEmailVerification'
  | 'confirmEmailVerification'
  | 'adminConfirmEmailVerification'
  | 'setup2fa'
  | 'enable2fa'
  | 'disable2fa'
>

type LoginClient = Pick<AuthClient, 'login' | 'getCurrentUser' | 'getUserFeatures'>
type LostPasswordClient = Pick<AuthClient, 'requestLostPassword' | 'resetLostPassword'>
type VerifyEmailClient = Pick<
  AuthClient,
  'requestEmailVerification' | 'confirmEmailVerification' | 'adminConfirmEmailVerification'
>
type MfaClient = Pick<AuthClient, 'setup2fa' | 'enable2fa' | 'disable2fa' | 'getCurrentUser'>

export type AuthUserProfile = {
  email: string
  displayName: string | null
  mfaEnabled: boolean
  isAdmin: boolean
}

type ValidationErrorReason =
  | 'missing_credentials'
  | 'missing_email'
  | 'missing_lost_password_reset_payload'
  | 'missing_verify_email_token'
  | 'missing_otp'

type ValidationErrorResult = {
  kind: 'validation_error'
  reason: ValidationErrorReason
}

type ApiErrorResult = {
  kind: 'api_error'
  error: unknown
}

type SuccessResult = {
  kind: 'success'
}

type LoginResult =
  | ValidationErrorResult
  | ApiErrorResult
  | { kind: 'mfa_required' }
  | {
      kind: 'success'
      accessToken: string
      authUser: AuthUserProfile
      featureState: FeatureState
      loginEmail: string
    }

export function normalizeFeatures(payload: {
  user_feature_enabled?: Record<string, unknown>
  effective_feature_enabled?: Record<string, unknown>
  feature_governance?: Array<{ key?: string; user_can_disable?: boolean }>
}): FeatureState {
  return normalizeUserFeatures(payload)
}

export function normalizeAuthUser(currentUser: {
  email: string
  display_name?: unknown
  mfa_enabled?: unknown
  roles?: unknown
}): AuthUserProfile {
  return {
    email: currentUser.email,
    displayName: typeof currentUser.display_name === 'string' ? currentUser.display_name : null,
    mfaEnabled: currentUser.mfa_enabled === true,
    isAdmin: Array.isArray(currentUser.roles) && currentUser.roles.includes('ADMIN'),
  }
}

export async function loginWithContext(args: {
  apiClient: LoginClient
  email: string
  password: string
  otpCode: string
}): Promise<LoginResult> {
  const email = args.email.trim()
  const otpCode = args.otpCode.trim()
  if (email.length === 0 || args.password.length === 0) {
    return { kind: 'validation_error', reason: 'missing_credentials' }
  }

  try {
    const login = await args.apiClient.login({
      email,
      password: args.password,
      ...(otpCode ? { otp_code: otpCode } : {}),
    })
    const currentUser = await args.apiClient.getCurrentUser()
    const userFeatures = await args.apiClient.getUserFeatures()

    return {
      kind: 'success',
      accessToken: login.access_token,
      authUser: normalizeAuthUser(currentUser),
      featureState: normalizeFeatures(userFeatures),
      loginEmail: email,
    }
  } catch (error) {
    if (error instanceof ApiError && error.payload?.code === 'MFA_REQUIRED') {
      return { kind: 'mfa_required' }
    }
    return {
      kind: 'api_error',
      error,
    }
  }
}

export async function requestLostPassword(args: {
  apiClient: LostPasswordClient
  email: string
}): Promise<SuccessResult | ValidationErrorResult | ApiErrorResult> {
  const email = args.email.trim()
  if (email.length === 0) {
    return { kind: 'validation_error', reason: 'missing_email' }
  }
  try {
    await args.apiClient.requestLostPassword({ email })
    return { kind: 'success' }
  } catch (error) {
    return { kind: 'api_error', error }
  }
}

export async function resetLostPassword(args: {
  apiClient: LostPasswordClient
  token: string
  newPassword: string
}): Promise<SuccessResult | ValidationErrorResult | ApiErrorResult> {
  const token = args.token.trim()
  if (token.length === 0 || args.newPassword.length === 0) {
    return { kind: 'validation_error', reason: 'missing_lost_password_reset_payload' }
  }
  try {
    await args.apiClient.resetLostPassword({
      token,
      new_password: args.newPassword,
    })
    return { kind: 'success' }
  } catch (error) {
    return { kind: 'api_error', error }
  }
}

export async function requestVerifyEmail(args: {
  apiClient: VerifyEmailClient
  email: string
}): Promise<SuccessResult | ValidationErrorResult | ApiErrorResult> {
  const email = args.email.trim()
  if (email.length === 0) {
    return { kind: 'validation_error', reason: 'missing_email' }
  }
  try {
    await args.apiClient.requestEmailVerification({ email })
    return { kind: 'success' }
  } catch (error) {
    return { kind: 'api_error', error }
  }
}

export async function confirmVerifyEmail(args: {
  apiClient: VerifyEmailClient
  token: string
}): Promise<SuccessResult | ValidationErrorResult | ApiErrorResult> {
  const token = args.token.trim()
  if (token.length === 0) {
    return { kind: 'validation_error', reason: 'missing_verify_email_token' }
  }
  try {
    await args.apiClient.confirmEmailVerification({ token })
    return { kind: 'success' }
  } catch (error) {
    return { kind: 'api_error', error }
  }
}

export async function adminConfirmVerifyEmail(args: {
  apiClient: VerifyEmailClient
  email: string
}): Promise<SuccessResult | ValidationErrorResult | ApiErrorResult> {
  const email = args.email.trim()
  if (email.length === 0) {
    return { kind: 'validation_error', reason: 'missing_email' }
  }
  try {
    await args.apiClient.adminConfirmEmailVerification({ email })
    return { kind: 'success' }
  } catch (error) {
    return { kind: 'api_error', error }
  }
}

export async function setupMfa(args: { apiClient: MfaClient }): Promise<
  | { kind: 'success'; setup: { secret: string; otpauthUri: string } }
  | ApiErrorResult
> {
  try {
    const setup = await args.apiClient.setup2fa()
    return {
      kind: 'success',
      setup: {
        secret: setup.secret,
        otpauthUri: setup.otpauth_uri,
      },
    }
  } catch (error) {
    return { kind: 'api_error', error }
  }
}

export async function toggleMfa(args: {
  apiClient: MfaClient
  otpCode: string
  target: 'enable' | 'disable'
}): Promise<
  | SuccessResult
  | ValidationErrorResult
  | ApiErrorResult
  | { kind: 'success_with_user'; authUser: AuthUserProfile }
> {
  const otpCode = args.otpCode.trim()
  if (otpCode.length === 0) {
    return { kind: 'validation_error', reason: 'missing_otp' }
  }

  try {
    if (args.target === 'enable') {
      await args.apiClient.enable2fa({ otp_code: otpCode })
    } else {
      await args.apiClient.disable2fa({ otp_code: otpCode })
    }
    const currentUser = await args.apiClient.getCurrentUser()
    return {
      kind: 'success_with_user',
      authUser: normalizeAuthUser(currentUser),
    }
  } catch (error) {
    return { kind: 'api_error', error }
  }
}
