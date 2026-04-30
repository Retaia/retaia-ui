import { render, screen } from '@testing-library/react'
import type { TFunction } from 'i18next'
import { describe, expect, it, vi } from 'vitest'
import { RuntimeSettingsSection } from './RuntimeSettingsSection'

const t = ((key: string) => key) as unknown as TFunction

describe('RuntimeSettingsSection', () => {
  it('renders admin governance controls for admin users', () => {
    render(
      <RuntimeSettingsSection
        t={t}
        controller={{
          authUser: {
            email: 'admin@example.com',
            displayName: 'Admin',
            mfaEnabled: false,
            isAdmin: true,
          },
          appMfaFeatureKey: 'features.auth.2fa',
          appMfaFeatureEnabled: true,
          appFeatureBusy: false,
          appFeatureStatus: null,
          setAppFeature: vi.fn(async () => {}),
          isApiAuthLockedByEnv: false,
          isApiConfigLockedByEnv: false,
          apiBaseUrlInput: '/api/v1',
          setApiBaseUrlInput: vi.fn(),
          isApiBaseUrlLockedByEnv: false,
          saveApiConnectionSettings: vi.fn(),
          testApiConnection: vi.fn(async () => {}),
          clearApiConnectionSettings: vi.fn(),
          apiConnectionStatus: null,
          retryStatus: null,
          runtimeDiagnostics: {
            loading: false,
            loadState: 'ready',
            status: 'loaded',
            health: { status: 'ok', self_healing: { active: false, deadline_at: null, max_self_healing_seconds: 300 } },
            healthError: null,
            policy: { server_policy: { feature_flags: { 'features.decisions.bulk': true } } },
            policyError: null,
            featureFlags: [['features.decisions.bulk', true]],
            hasLoaded: true,
            refresh: vi.fn(),
          },
        } as never}
      />,
    )

    expect(screen.getByText('settings.runtimeAdminTitle')).toBeInTheDocument()
    expect(screen.getByTestId('auth-app-feature-toggle')).toBeInTheDocument()
    expect(screen.getByText('settings.runtimeConnectionTitle')).toBeInTheDocument()
    expect(screen.getByTestId('runtime-advanced-connection')).toBeInTheDocument()
    expect(screen.getByTestId('runtime-readiness-status')).toHaveTextContent('settings.runtimeReadinessStatus.ok')
  })

  it('hides admin governance controls for non-admin users', () => {
    render(
      <RuntimeSettingsSection
        t={t}
        controller={{
          authUser: {
            email: 'user@example.com',
            displayName: 'User',
            mfaEnabled: false,
            isAdmin: false,
          },
          appMfaFeatureKey: 'features.auth.2fa',
          appMfaFeatureEnabled: true,
          appFeatureBusy: false,
          appFeatureStatus: null,
          setAppFeature: vi.fn(async () => {}),
          isApiAuthLockedByEnv: false,
          isApiConfigLockedByEnv: false,
          apiBaseUrlInput: '/api/v1',
          setApiBaseUrlInput: vi.fn(),
          isApiBaseUrlLockedByEnv: false,
          saveApiConnectionSettings: vi.fn(),
          testApiConnection: vi.fn(async () => {}),
          clearApiConnectionSettings: vi.fn(),
          apiConnectionStatus: null,
          retryStatus: null,
          runtimeDiagnostics: {
            loading: false,
            loadState: 'idle',
            status: null,
            health: null,
            healthError: null,
            policy: null,
            policyError: null,
            featureFlags: [],
            hasLoaded: false,
            refresh: vi.fn(),
          },
        } as never}
      />,
    )

    expect(screen.queryByText('settings.runtimeAdminTitle')).not.toBeInTheDocument()
    expect(screen.queryByTestId('auth-app-feature-toggle')).not.toBeInTheDocument()
  })

  it('shows signed-out runtime diagnostics guidance when no auth user is available', () => {
    render(
      <RuntimeSettingsSection
        t={t}
        controller={{
          authUser: null,
          appMfaFeatureKey: 'features.auth.2fa',
          appMfaFeatureEnabled: true,
          appFeatureBusy: false,
          appFeatureStatus: null,
          setAppFeature: vi.fn(async () => {}),
          isApiAuthLockedByEnv: false,
          isApiConfigLockedByEnv: false,
          apiBaseUrlInput: '/api/v1',
          setApiBaseUrlInput: vi.fn(),
          isApiBaseUrlLockedByEnv: false,
          saveApiConnectionSettings: vi.fn(),
          testApiConnection: vi.fn(async () => {}),
          clearApiConnectionSettings: vi.fn(),
          apiConnectionStatus: null,
          retryStatus: null,
          runtimeDiagnostics: {
            loading: false,
            loadState: 'idle',
            status: null,
            health: null,
            healthError: null,
            policy: null,
            policyError: null,
            featureFlags: [],
            hasLoaded: false,
            refresh: vi.fn(),
          },
        } as never}
      />,
    )

    expect(screen.getByText('settings.runtimeDiagnosticsSignedOut')).toBeInTheDocument()
    expect(screen.getByTestId('runtime-diagnostics-refresh')).toBeDisabled()
  })

  it('renders partial runtime errors without inventing fallback values', () => {
    render(
      <RuntimeSettingsSection
        t={t}
        controller={{
          authUser: {
            email: 'user@example.com',
            displayName: 'User',
            mfaEnabled: false,
            isAdmin: false,
          },
          appMfaFeatureKey: 'features.auth.2fa',
          appMfaFeatureEnabled: true,
          appFeatureBusy: false,
          appFeatureStatus: null,
          setAppFeature: vi.fn(async () => {}),
          isApiAuthLockedByEnv: false,
          isApiConfigLockedByEnv: false,
          apiBaseUrlInput: '/api/v1',
          setApiBaseUrlInput: vi.fn(),
          isApiBaseUrlLockedByEnv: false,
          saveApiConnectionSettings: vi.fn(),
          testApiConnection: vi.fn(async () => {}),
          clearApiConnectionSettings: vi.fn(),
          apiConnectionStatus: null,
          retryStatus: null,
          runtimeDiagnostics: {
            loading: false,
            loadState: 'partial',
            status: 'partial',
            health: {
              status: 'ok',
              self_healing: { active: true, deadline_at: null, max_self_healing_seconds: 300 },
            },
            healthError: null,
            policy: null,
            policyError: 'policy error',
            featureFlags: [],
            hasLoaded: true,
            refresh: vi.fn(),
          },
        } as never}
      />,
    )

    expect(screen.getByTestId('runtime-readiness-status')).toHaveTextContent(
      'settings.runtimeReadinessStatus.ok',
    )
    expect(screen.getByTestId('runtime-self-healing-status')).toHaveTextContent(
      'settings.runtimeSelfHealingActive',
    )
    expect(screen.getByTestId('runtime-feature-flags-count')).toHaveTextContent(
      'settings.runtimeDiagnosticsUnknown',
    )
    expect(screen.getByTestId('runtime-feature-flags-error')).toHaveTextContent(
      'settings.runtimePolicyUnavailable',
    )
  })
})
