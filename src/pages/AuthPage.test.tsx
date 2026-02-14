import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setupApp } from '../test-utils/appTestUtils'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function unauthorizedResponse(correlationId: string) {
  return jsonResponse(
    {
      code: 'UNAUTHORIZED',
      message: 'unauthorized',
      retryable: false,
      correlation_id: correlationId,
    },
    401,
  )
}

function auth2faFeatures({
  enabled,
  effective = enabled,
}: {
  enabled: boolean
  effective?: boolean
}) {
  return {
    user_feature_enabled: { 'features.auth.2fa': enabled },
    effective_feature_enabled: { 'features.auth.2fa': effective },
    feature_governance: [
      {
        key: 'features.auth.2fa',
        tier: 'OPTIONAL',
        user_can_disable: true,
        dependencies: [],
        disable_escalation: [],
      },
    ],
    core_v1_global_features: ['features.core.auth'],
  }
}

async function loginFromAuthPage(user: ReturnType<typeof setupApp>['user'], email: string, password: string) {
  await user.clear(screen.getByTestId('auth-email-input'))
  await user.type(screen.getByTestId('auth-email-input'), email)
  await user.clear(screen.getByTestId('auth-password-input'))
  await user.type(screen.getByTestId('auth-password-input'), password)
  await user.click(screen.getByTestId('auth-login'))
}

describe('AuthPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders dedicated auth route and api connection panel', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(unauthorizedResponse('auth-boot-1'))

    setupApp('/auth')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Authentification utilisateur' }),
    ).toBeInTheDocument()
    expect(await screen.findByLabelText('Connexion API')).toBeInTheDocument()
  })

  it('shows missing credentials error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(unauthorizedResponse('auth-boot-2'))
    const { user } = setupApp('/auth')

    await user.click(screen.getByTestId('auth-login'))

    expect(await screen.findByTestId('auth-status')).toHaveTextContent(
      'Email et mot de passe obligatoires.',
    )
  })

  it('requests lost password reset email', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/auth/lost-password/request')) {
        return Promise.resolve(new Response(null, { status: 202 }))
      }
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(unauthorizedResponse('auth-boot-3'))
      }
      return Promise.resolve(
        jsonResponse({}),
      )
    })
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock)
    const { user } = setupApp('/auth')

    await user.type(screen.getByTestId('auth-lost-password-email-input'), 'user@example.com')
    await user.click(screen.getByTestId('auth-lost-password-request'))

    expect(await screen.findByTestId('auth-lost-password-status')).toHaveTextContent(
      'Demande envoyée. Vérifie ton email.',
    )
  })

  it('resets lost password with token and new password', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/auth/lost-password/reset')) {
        return Promise.resolve(new Response(null, { status: 200 }))
      }
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(unauthorizedResponse('auth-boot-4'))
      }
      return Promise.resolve(
        jsonResponse({}),
      )
    })
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock)
    const { user } = setupApp('/auth')

    await user.click(screen.getByTestId('auth-lost-password-mode-reset'))
    await user.type(screen.getByTestId('auth-lost-password-token-input'), 'token-123')
    await user.type(screen.getByTestId('auth-lost-password-new-password-input'), 'new-secret')
    await user.click(screen.getByTestId('auth-lost-password-reset'))

    expect(await screen.findByTestId('auth-lost-password-status')).toHaveTextContent(
      'Mot de passe réinitialisé.',
    )
  })

  it('requests email verification from auth page', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/auth/verify-email/request')) {
        return Promise.resolve(new Response(null, { status: 202 }))
      }
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(unauthorizedResponse('auth-verify-boot-1'))
      }
      return Promise.resolve(
        jsonResponse({}),
      )
    })
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock)
    const { user } = setupApp('/auth')

    await user.type(screen.getByTestId('auth-verify-email-input'), 'user@example.com')
    await user.click(screen.getByTestId('auth-verify-email-request'))

    expect(await screen.findByTestId('auth-verify-email-status')).toHaveTextContent(
      'Demande de vérification envoyée.',
    )
  })

  it('confirms email token and allows admin confirmation mode', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.endsWith('/auth/login')) {
        return Promise.resolve(
          jsonResponse({
            access_token: 'token-auth-verify-admin',
            token_type: 'Bearer',
            client_kind: 'UI_RUST',
          }),
        )
      }
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(
          jsonResponse({
            email: 'admin@example.com',
            display_name: 'Verify Admin',
            mfa_enabled: false,
            roles: ['ADMIN'],
          }),
        )
      }
      if (url.endsWith('/auth/me/features')) {
        return Promise.resolve(jsonResponse(auth2faFeatures({ enabled: true })))
      }
      if (url.endsWith('/auth/verify-email/confirm')) {
        return Promise.resolve(new Response(null, { status: 200 }))
      }
      if (url.endsWith('/auth/verify-email/admin-confirm') && init?.method === 'POST') {
        return Promise.resolve(new Response(null, { status: 200 }))
      }
      return Promise.resolve(
        jsonResponse({}),
      )
    })
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock)
    const { user } = setupApp('/auth')

    await user.click(screen.getByTestId('auth-verify-email-mode-confirm'))
    await user.type(screen.getByTestId('auth-verify-email-token-input'), 'verify-token')
    await user.click(screen.getByTestId('auth-verify-email-confirm'))
    expect(await screen.findByTestId('auth-verify-email-status')).toHaveTextContent('Email vérifié.')

    await loginFromAuthPage(user, 'admin@example.com', 'secret')

    await user.click(screen.getByTestId('auth-verify-email-mode-admin'))
    await user.clear(screen.getByTestId('auth-verify-email-input'))
    await user.type(screen.getByTestId('auth-verify-email-input'), 'target@example.com')
    await user.click(screen.getByTestId('auth-verify-email-admin-confirm'))
    expect(await screen.findByTestId('auth-verify-email-status')).toHaveTextContent(
      'Email confirmé par admin.',
    )
  })

  it('authenticates then tests API connection with bearer token', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/auth/login')) {
        return Promise.resolve(
          jsonResponse({
            access_token: 'token-auth-1',
            token_type: 'Bearer',
            client_kind: 'UI_RUST',
          }),
        )
      }
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(
          jsonResponse({
            email: 'user@example.com',
            display_name: 'Auth User',
            mfa_enabled: false,
          }),
        )
      }
      if (url.endsWith('/auth/me/features')) {
        return Promise.resolve(jsonResponse(auth2faFeatures({ enabled: true })))
      }
      if (url.endsWith('/app/policy')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              server_policy: { feature_flags: { 'features.decisions.bulk': true } },
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      if (url.includes('/assets')) {
        return Promise.resolve(
          jsonResponse({
            items: [],
            next_cursor: null,
          }),
        )
      }
      return Promise.resolve(
        jsonResponse({}),
      )
    })
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock)
    const { user } = setupApp('/auth')

    await user.clear(screen.getByTestId('api-base-url-input'))
    await user.type(screen.getByTestId('api-base-url-input'), 'https://api.local/v1')
    await loginFromAuthPage(user, 'user@example.com', 'secret')

    expect(await screen.findByTestId('auth-status')).toHaveTextContent('Authentification réussie.')

    await user.click(screen.getByTestId('api-connection-test'))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.local/v1/auth/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token-auth-1',
          }),
        }),
      )
    })

    expect(screen.getByTestId('api-connection-status')).toHaveTextContent('Connexion API valide.')
    expect(window.localStorage.getItem('retaia_api_token')).toBe('token-auth-1')
  })

  it('handles MFA_REQUIRED then retries login with otp', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.endsWith('/auth/login')) {
        const body = JSON.parse(String(init?.body ?? '{}')) as { otp_code?: string }
        if (!body.otp_code) {
          return Promise.resolve(
            jsonResponse(
              {
                code: 'MFA_REQUIRED',
                message: 'mfa required',
                retryable: false,
                correlation_id: 'mfa-auth-1',
              },
              401,
            ),
          )
        }
        return Promise.resolve(
          jsonResponse({
            access_token: 'token-auth-mfa',
            token_type: 'Bearer',
            client_kind: 'UI_RUST',
          }),
        )
      }
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(
          jsonResponse({
            email: 'user@example.com',
            display_name: 'MFA User',
            mfa_enabled: true,
          }),
        )
      }
      if (url.endsWith('/auth/me/features')) {
        return Promise.resolve(jsonResponse(auth2faFeatures({ enabled: true })))
      }
      return Promise.resolve(
        jsonResponse({}),
      )
    })
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock)
    const { user } = setupApp('/auth')

    await loginFromAuthPage(user, 'user@example.com', 'secret')

    expect(await screen.findByTestId('auth-status')).toHaveTextContent('La 2FA est requise')

    await user.type(screen.getByTestId('auth-otp-input'), '123456')
    await user.click(screen.getByTestId('auth-login'))

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authentification réussie.')
    })
    expect(window.localStorage.getItem('retaia_api_token')).toBe('token-auth-mfa')
  })

  it('shows 2FA controls only when globally and user enabled', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.endsWith('/auth/login')) {
        return Promise.resolve(
          jsonResponse({
            access_token: 'token-auth-feature',
            token_type: 'Bearer',
            client_kind: 'UI_RUST',
          }),
        )
      }
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(
          jsonResponse({
            email: 'user@example.com',
            display_name: 'Feature User',
            mfa_enabled: false,
          }),
        )
      }
      if (url.endsWith('/auth/me/features') && (init?.method ?? 'GET') === 'GET') {
        return Promise.resolve(jsonResponse(auth2faFeatures({ enabled: true })))
      }
      if (url.endsWith('/auth/me/features') && init?.method === 'PATCH') {
        return Promise.resolve(jsonResponse(auth2faFeatures({ enabled: false })))
      }
      return Promise.resolve(
        jsonResponse({}),
      )
    })
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock)
    const { user } = setupApp('/auth')

    await loginFromAuthPage(user, 'user@example.com', 'secret')

    expect(await screen.findByLabelText('Authentification à deux facteurs')).toBeInTheDocument()
    await user.click(screen.getByTestId('auth-mfa-user-toggle'))

    expect(await screen.findByTestId('auth-mfa-feature-disabled')).toBeInTheDocument()
  })

  it('clears stale token and shows expired session when boot auth fails with 401', async () => {
    window.localStorage.setItem('retaia_api_token', 'stale-token')

    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(
          jsonResponse(
            {
              code: 'UNAUTHORIZED',
              message: 'expired',
              retryable: false,
              correlation_id: 'expired-1',
            },
            401,
          ),
        )
      }
      if (url.endsWith('/auth/me/features')) {
        return Promise.resolve(
          jsonResponse({
            user_feature_enabled: {},
            effective_feature_enabled: {},
            feature_governance: [],
          }),
        )
      }
      return Promise.resolve(
        jsonResponse({}),
      )
    })
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock)

    setupApp('/auth')

    expect(await screen.findByTestId('auth-status')).toHaveTextContent('Session expirée. Reconnecte-toi.')
    expect(window.localStorage.getItem('retaia_api_token')).toBeNull()
  })

  it('runs 2FA setup then enable and disable actions', async () => {
    let currentMfaEnabled = false
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/auth/login')) {
        return Promise.resolve(
          jsonResponse({
            access_token: 'token-auth-mfa-cycle',
            token_type: 'Bearer',
            client_kind: 'UI_RUST',
          }),
        )
      }
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(
          jsonResponse({
            email: 'user@example.com',
            display_name: 'MFA Cycle User',
            mfa_enabled: currentMfaEnabled,
          }),
        )
      }
      if (url.endsWith('/auth/me/features')) {
        return Promise.resolve(jsonResponse(auth2faFeatures({ enabled: true })))
      }
      if (url.endsWith('/auth/2fa/setup')) {
        return Promise.resolve(
          jsonResponse({
            secret: 'ABC123',
            otpauth_uri: 'otpauth://totp/retaia',
          }),
        )
      }
      if (url.endsWith('/auth/2fa/enable')) {
        currentMfaEnabled = true
        return Promise.resolve(new Response(undefined, { status: 204 }))
      }
      if (url.endsWith('/auth/2fa/disable')) {
        currentMfaEnabled = false
        return Promise.resolve(new Response(undefined, { status: 204 }))
      }
      return Promise.resolve(
        jsonResponse({}),
      )
    })
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock)
    const { user } = setupApp('/auth')

    await loginFromAuthPage(user, 'user@example.com', 'secret')

    expect(await screen.findByTestId('auth-mfa-setup')).toBeInTheDocument()
    await user.click(screen.getByTestId('auth-mfa-setup'))
    expect(await screen.findByTestId('auth-mfa-setup-material')).toBeInTheDocument()

    await user.type(screen.getByTestId('auth-mfa-otp-action-input'), '123456')
    await user.click(screen.getByTestId('auth-mfa-enable'))
    expect(await screen.findByTestId('auth-mfa-status')).toHaveTextContent(
      'La 2FA est maintenant activée.',
    )

    await user.type(screen.getByTestId('auth-mfa-otp-action-input'), '654321')
    await user.click(screen.getByTestId('auth-mfa-disable'))
    expect(await screen.findByTestId('auth-mfa-status')).toHaveTextContent(
      'La 2FA est maintenant désactivée.',
    )
  })

  it('toggles global 2FA app feature for admin users', async () => {
    let appMfaFeatureEnabled = true
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.endsWith('/auth/login')) {
        return Promise.resolve(
          jsonResponse({
            access_token: 'token-auth-admin',
            token_type: 'Bearer',
            client_kind: 'UI_RUST',
          }),
        )
      }
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(
          jsonResponse({
            email: 'admin@example.com',
            display_name: 'Admin User',
            mfa_enabled: false,
            roles: ['ADMIN'],
          }),
        )
      }
      if (url.endsWith('/auth/me/features')) {
        return Promise.resolve(
          jsonResponse(auth2faFeatures({ enabled: true, effective: appMfaFeatureEnabled })),
        )
      }
      if (url.endsWith('/app/features') && (init?.method ?? 'GET') === 'GET') {
        return Promise.resolve(
          jsonResponse({
            app_feature_enabled: { 'features.auth.2fa': appMfaFeatureEnabled },
            feature_governance: auth2faFeatures({ enabled: true }).feature_governance,
            core_v1_global_features: ['features.core.auth'],
          }),
        )
      }
      if (url.endsWith('/app/features') && init?.method === 'PATCH') {
        appMfaFeatureEnabled = false
        return Promise.resolve(
          jsonResponse({
            app_feature_enabled: { 'features.auth.2fa': false },
            feature_governance: auth2faFeatures({ enabled: true }).feature_governance,
            core_v1_global_features: ['features.core.auth'],
          }),
        )
      }
      return Promise.resolve(
        jsonResponse({}),
      )
    })
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock)
    const { user } = setupApp('/auth')

    await loginFromAuthPage(user, 'admin@example.com', 'secret')

    expect(await screen.findByTestId('auth-app-feature-state')).toHaveTextContent(
      'Feature globale 2FA: activée',
    )
    await user.click(screen.getByTestId('auth-app-feature-toggle'))
    expect(await screen.findByTestId('auth-app-feature-status')).toHaveTextContent(
      'Feature globale 2FA désactivée.',
    )
  })
})
