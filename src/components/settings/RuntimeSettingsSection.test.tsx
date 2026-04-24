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
        } as never}
      />,
    )

    expect(screen.getByText('settings.runtimeAdminTitle')).toBeInTheDocument()
    expect(screen.getByTestId('auth-app-feature-toggle')).toBeInTheDocument()
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
        } as never}
      />,
    )

    expect(screen.queryByText('settings.runtimeAdminTitle')).not.toBeInTheDocument()
    expect(screen.queryByTestId('auth-app-feature-toggle')).not.toBeInTheDocument()
  })
})
