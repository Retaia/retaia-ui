import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { TFunction } from 'i18next'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AccountProfileSection } from './AccountProfileSection'

const t = ((key: string) => key) as unknown as TFunction

describe('AccountProfileSection', () => {
  it('renders signed-in account details and forwards logout', async () => {
    const user = userEvent.setup()
    const handleLogout = vi.fn(async () => {})

    render(
      <MemoryRouter>
        <AccountProfileSection
          t={t}
          controller={{
            authUser: {
              email: 'operator@example.com',
              displayName: 'Operator One',
              mfaEnabled: true,
              isAdmin: false,
            },
            authLoading: false,
            handleLogout,
          } as never}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Operator One')).toBeInTheDocument()
    expect(screen.getByText('operator@example.com')).toBeInTheDocument()
    expect(screen.getByText('account.identityMfaOn')).toBeInTheDocument()

    await user.click(screen.getByTestId('account-profile-logout'))
    expect(handleLogout).toHaveBeenCalled()
  })

  it('renders auth link when signed out', () => {
    render(
      <MemoryRouter>
        <AccountProfileSection
          t={t}
          controller={{
            authUser: null,
            authLoading: false,
            handleLogout: vi.fn(async () => {}),
          } as never}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('account.identitySignedOut')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'account.identityOpenAuth' })).toHaveAttribute('href', '/auth')
  })
})
