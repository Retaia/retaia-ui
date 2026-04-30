import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthPage } from './AuthPage'

const controller: {
  setLostPasswordMode: ReturnType<typeof vi.fn>
  setVerifyEmailMode: ReturnType<typeof vi.fn>
  authSessionLoadState: 'ready' | 'loading'
  effectiveApiToken: string | null
  authUser: {
    email: string
    displayName: string
    mfaEnabled: boolean
    isAdmin: boolean
  } | null
} = {
  setLostPasswordMode: vi.fn(),
  setVerifyEmailMode: vi.fn(),
  authSessionLoadState: 'ready',
  effectiveApiToken: null,
  authUser: null,
}

vi.mock('../hooks/useAuthPageController', () => ({
  useAuthPageController: () => controller,
}))

describe('AuthPage', () => {
  it('keeps auth as a public-only surface without runtime connection controls', () => {
    render(
      <MemoryRouter initialEntries={['/auth']}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Authentification et récupération' })).toBeInTheDocument()
    expect(screen.queryByText('app.apiConnectionTitle')).not.toBeInTheDocument()
  })

  it('redirects an authenticated session to account', () => {
    controller.authUser = {
      email: 'agent@retaia.test',
      displayName: 'Agent',
      mfaEnabled: false,
      isAdmin: false,
    }

    render(
      <MemoryRouter initialEntries={['/auth']}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/account" element={<div>account-destination</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('account-destination')).toBeInTheDocument()

    controller.authUser = null
  })
})
