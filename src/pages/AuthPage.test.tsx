import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setupApp } from '../test-utils/appTestUtils'

describe('AuthPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders dedicated auth route and api connection panel', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 'UNAUTHORIZED',
          message: 'unauthorized',
          retryable: false,
          correlation_id: 'auth-boot-1',
        }),
        { status: 401, headers: { 'content-type': 'application/json' } },
      ),
    )

    setupApp('/auth')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Authentification utilisateur' }),
    ).toBeInTheDocument()
    expect(await screen.findByLabelText('Connexion API')).toBeInTheDocument()
  })

  it('shows missing credentials error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 'UNAUTHORIZED',
          message: 'unauthorized',
          retryable: false,
          correlation_id: 'auth-boot-2',
        }),
        { status: 401, headers: { 'content-type': 'application/json' } },
      ),
    )
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
        return Promise.resolve(
          new Response(
            JSON.stringify({
              code: 'UNAUTHORIZED',
              message: 'unauthorized',
              retryable: false,
              correlation_id: 'auth-boot-3',
            }),
            { status: 401, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      return Promise.resolve(
        new Response('{}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
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
        return Promise.resolve(
          new Response(
            JSON.stringify({
              code: 'UNAUTHORIZED',
              message: 'unauthorized',
              retryable: false,
              correlation_id: 'auth-boot-4',
            }),
            { status: 401, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      return Promise.resolve(
        new Response('{}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
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

  it('authenticates then tests API connection with bearer token', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/auth/login')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              access_token: 'token-auth-1',
              token_type: 'Bearer',
              client_kind: 'UI_RUST',
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              email: 'user@example.com',
              display_name: 'Auth User',
              mfa_enabled: false,
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      if (url.endsWith('/auth/me/features')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              user_feature_enabled: { 'features.auth.2fa': true },
              effective_feature_enabled: { 'features.auth.2fa': true },
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
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
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
          new Response(
            JSON.stringify({
              items: [],
              next_cursor: null,
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      return Promise.resolve(
        new Response('{}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
    })
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock)
    const { user } = setupApp('/auth')

    await user.clear(screen.getByTestId('api-base-url-input'))
    await user.type(screen.getByTestId('api-base-url-input'), 'https://api.local/v1')
    await user.clear(screen.getByTestId('auth-email-input'))
    await user.type(screen.getByTestId('auth-email-input'), 'user@example.com')
    await user.clear(screen.getByTestId('auth-password-input'))
    await user.type(screen.getByTestId('auth-password-input'), 'secret')
    await user.click(screen.getByTestId('auth-login'))

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
            new Response(
              JSON.stringify({
                code: 'MFA_REQUIRED',
                message: 'mfa required',
                retryable: false,
                correlation_id: 'mfa-auth-1',
              }),
              { status: 401, headers: { 'content-type': 'application/json' } },
            ),
          )
        }
        return Promise.resolve(
          new Response(
            JSON.stringify({
              access_token: 'token-auth-mfa',
              token_type: 'Bearer',
              client_kind: 'UI_RUST',
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              email: 'user@example.com',
              display_name: 'MFA User',
              mfa_enabled: true,
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      if (url.endsWith('/auth/me/features')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              user_feature_enabled: { 'features.auth.2fa': true },
              effective_feature_enabled: { 'features.auth.2fa': true },
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
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      return Promise.resolve(
        new Response('{}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
    })
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock)
    const { user } = setupApp('/auth')

    await user.type(screen.getByTestId('auth-email-input'), 'user@example.com')
    await user.type(screen.getByTestId('auth-password-input'), 'secret')
    await user.click(screen.getByTestId('auth-login'))

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
          new Response(
            JSON.stringify({
              access_token: 'token-auth-feature',
              token_type: 'Bearer',
              client_kind: 'UI_RUST',
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              email: 'user@example.com',
              display_name: 'Feature User',
              mfa_enabled: false,
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      if (url.endsWith('/auth/me/features') && (init?.method ?? 'GET') === 'GET') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              user_feature_enabled: { 'features.auth.2fa': true },
              effective_feature_enabled: { 'features.auth.2fa': true },
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
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      if (url.endsWith('/auth/me/features') && init?.method === 'PATCH') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              user_feature_enabled: { 'features.auth.2fa': false },
              effective_feature_enabled: { 'features.auth.2fa': false },
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
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      return Promise.resolve(
        new Response('{}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
    })
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock)
    const { user } = setupApp('/auth')

    await user.type(screen.getByTestId('auth-email-input'), 'user@example.com')
    await user.type(screen.getByTestId('auth-password-input'), 'secret')
    await user.click(screen.getByTestId('auth-login'))

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
          new Response(
            JSON.stringify({
              code: 'UNAUTHORIZED',
              message: 'expired',
              retryable: false,
              correlation_id: 'expired-1',
            }),
            { status: 401, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      if (url.endsWith('/auth/me/features')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              user_feature_enabled: {},
              effective_feature_enabled: {},
              feature_governance: [],
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      return Promise.resolve(
        new Response('{}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
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
          new Response(
            JSON.stringify({
              access_token: 'token-auth-mfa-cycle',
              token_type: 'Bearer',
              client_kind: 'UI_RUST',
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              email: 'user@example.com',
              display_name: 'MFA Cycle User',
              mfa_enabled: currentMfaEnabled,
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      if (url.endsWith('/auth/me/features')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              user_feature_enabled: { 'features.auth.2fa': true },
              effective_feature_enabled: { 'features.auth.2fa': true },
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
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      if (url.endsWith('/auth/2fa/setup')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              secret: 'ABC123',
              otpauth_uri: 'otpauth://totp/retaia',
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
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
        new Response('{}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
    })
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock)
    const { user } = setupApp('/auth')

    await user.type(screen.getByTestId('auth-email-input'), 'user@example.com')
    await user.type(screen.getByTestId('auth-password-input'), 'secret')
    await user.click(screen.getByTestId('auth-login'))

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
})
