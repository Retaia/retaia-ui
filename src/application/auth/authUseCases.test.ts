import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/client'
import {
  adminConfirmVerifyEmail,
  confirmVerifyEmail,
  loginWithContext,
  normalizeAuthUser,
  normalizeFeatures,
  requestLostPassword,
  requestVerifyEmail,
  resetLostPassword,
  setupMfa,
  toggleMfa,
} from './authUseCases'

function createApiClientMock() {
  return {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    getUserFeatures: vi.fn(),
    requestLostPassword: vi.fn(),
    resetLostPassword: vi.fn(),
    requestEmailVerification: vi.fn(),
    confirmEmailVerification: vi.fn(),
    adminConfirmEmailVerification: vi.fn(),
    setup2fa: vi.fn(),
    enable2fa: vi.fn(),
    disable2fa: vi.fn(),
  }
}

describe('authUseCases', () => {
  it('normalizes user and features payloads', () => {
    expect(
      normalizeAuthUser({
        email: 'admin@retaia.test',
        display_name: 'Admin',
        mfa_enabled: true,
        roles: ['ADMIN'],
      }),
    ).toEqual({
      email: 'admin@retaia.test',
      displayName: 'Admin',
      mfaEnabled: true,
      isAdmin: true,
    })

    expect(
      normalizeFeatures({
        user_feature_enabled: { a: true, b: 'x' },
        effective_feature_enabled: { a: true, c: false, d: 1 },
        feature_governance: [{ key: 'a', user_can_disable: true }, { key: 12 as never }],
      }),
    ).toEqual({
      userFeatureEnabled: { a: true },
      effectiveFeatureEnabled: { a: true, c: false },
      featureGovernance: [{ key: 'a', user_can_disable: true }],
    })
  })

  it('returns validation error for missing login credentials', async () => {
    const apiClient = createApiClientMock()
    const result = await loginWithContext({
      apiClient,
      email: '',
      password: '',
      otpCode: '',
    })
    expect(result).toEqual({
      kind: 'validation_error',
      reason: 'missing_credentials',
    })
  })

  it('returns mfa_required when backend asks for OTP', async () => {
    const apiClient = createApiClientMock()
    apiClient.login.mockRejectedValue(
      new ApiError(401, 'MFA required', {
        code: 'MFA_REQUIRED',
        message: 'MFA required',
        retryable: false,
        correlation_id: 'x',
      }),
    )

    const result = await loginWithContext({
      apiClient,
      email: 'user@retaia.test',
      password: 'secret',
      otpCode: '',
    })
    expect(result).toEqual({ kind: 'mfa_required' })
  })

  it('returns enriched success payload on login success', async () => {
    const apiClient = createApiClientMock()
    apiClient.login.mockResolvedValue({ access_token: 'token-1' })
    apiClient.getCurrentUser.mockResolvedValue({
      email: 'user@retaia.test',
      display_name: 'User',
      mfa_enabled: false,
      roles: ['REVIEWER'],
    })
    apiClient.getUserFeatures.mockResolvedValue({
      user_feature_enabled: { 'features.auth.2fa': true },
      effective_feature_enabled: { 'features.auth.2fa': true },
      feature_governance: [{ key: 'features.auth.2fa', user_can_disable: true }],
    })

    const result = await loginWithContext({
      apiClient,
      email: ' user@retaia.test ',
      password: 'secret',
      otpCode: '',
    })

    expect(result).toEqual({
      kind: 'success',
      accessToken: 'token-1',
      loginEmail: 'user@retaia.test',
      authUser: {
        email: 'user@retaia.test',
        displayName: 'User',
        mfaEnabled: false,
        isAdmin: false,
      },
      featureState: {
        userFeatureEnabled: { 'features.auth.2fa': true },
        effectiveFeatureEnabled: { 'features.auth.2fa': true },
        featureGovernance: [{ key: 'features.auth.2fa', user_can_disable: true }],
      },
    })
  })

  it('validates and runs lost password flow', async () => {
    const apiClient = createApiClientMock()
    await expect(
      requestLostPassword({
        apiClient,
        email: '',
      }),
    ).resolves.toEqual({
      kind: 'validation_error',
      reason: 'missing_email',
    })

    await expect(
      resetLostPassword({
        apiClient,
        token: '',
        newPassword: '',
      }),
    ).resolves.toEqual({
      kind: 'validation_error',
      reason: 'missing_lost_password_reset_payload',
    })

    await expect(
      requestLostPassword({
        apiClient,
        email: 'user@retaia.test',
      }),
    ).resolves.toEqual({ kind: 'success' })
    expect(apiClient.requestLostPassword).toHaveBeenCalledWith({
      email: 'user@retaia.test',
    })
  })

  it('validates and runs verify email flow', async () => {
    const apiClient = createApiClientMock()

    await expect(
      requestVerifyEmail({
        apiClient,
        email: '',
      }),
    ).resolves.toEqual({
      kind: 'validation_error',
      reason: 'missing_email',
    })
    await expect(
      confirmVerifyEmail({
        apiClient,
        token: '',
      }),
    ).resolves.toEqual({
      kind: 'validation_error',
      reason: 'missing_verify_email_token',
    })
    await expect(
      adminConfirmVerifyEmail({
        apiClient,
        email: '',
      }),
    ).resolves.toEqual({
      kind: 'validation_error',
      reason: 'missing_email',
    })
  })

  it('returns setup payload and validates OTP for toggle', async () => {
    const apiClient = createApiClientMock()
    apiClient.setup2fa.mockResolvedValue({
      secret: 'ABC',
      otpauth_uri: 'otpauth://x',
    })
    apiClient.getCurrentUser.mockResolvedValue({
      email: 'user@retaia.test',
      mfa_enabled: true,
      roles: [],
    })

    await expect(setupMfa({ apiClient })).resolves.toEqual({
      kind: 'success',
      setup: {
        secret: 'ABC',
        otpauthUri: 'otpauth://x',
      },
    })

    await expect(
      toggleMfa({
        apiClient,
        otpCode: '',
        target: 'enable',
      }),
    ).resolves.toEqual({
      kind: 'validation_error',
      reason: 'missing_otp',
    })
  })
})
