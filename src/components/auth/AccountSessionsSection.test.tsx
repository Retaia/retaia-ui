import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { TFunction } from 'i18next'
import { describe, expect, it, vi } from 'vitest'
import { AccountSessionsSection } from './AccountSessionsSection'

const t = ((key: string) => key) as unknown as TFunction

describe('AccountSessionsSection', () => {
  it('renders sessions and disables revoke on current session', () => {
    render(
      <AccountSessionsSection
        t={t}
        sessions={[
          {
            sessionId: 'session-current',
            clientId: 'client-current',
            createdAt: '2026-04-20T08:00:00Z',
            lastUsedAt: '2026-04-23T08:00:00Z',
            expiresAt: '2026-05-20T08:00:00Z',
            isCurrent: true,
            deviceLabel: 'Current browser',
            browser: 'Codex Browser',
            os: 'macOS',
            ipAddressLastSeen: '127.0.0.1',
          },
        ]}
        loading={false}
        availability="ready"
        busySessionId={null}
        revokingOthers={false}
        status={null}
        onRefresh={vi.fn(async () => {})}
        onRevokeSession={vi.fn(async () => {})}
        onRevokeOthers={vi.fn(async () => {})}
      />,
    )

    expect(screen.getByText('Current browser')).toBeInTheDocument()
    expect(screen.getByText('account.sessionCurrent')).toBeInTheDocument()
    expect(screen.getByTestId('account-session-revoke-session-current')).toBeDisabled()
  })

  it('forwards revoke others action', async () => {
    const user = userEvent.setup()
    const onRevokeOthers = vi.fn(async () => {})

    render(
      <AccountSessionsSection
        t={t}
        sessions={[]}
        loading={false}
        availability="ready"
        busySessionId={null}
        revokingOthers={false}
        status={{ kind: 'success', message: 'done' }}
        onRefresh={vi.fn(async () => {})}
        onRevokeSession={vi.fn(async () => {})}
        onRevokeOthers={onRevokeOthers}
      />,
    )

    await user.click(screen.getByTestId('account-sessions-revoke-others'))
    expect(onRevokeOthers).toHaveBeenCalled()
    expect(screen.getByTestId('account-sessions-status')).toHaveTextContent('done')
  })

  it('renders a signed-out sessions state and disables actions', () => {
    render(
      <AccountSessionsSection
        t={t}
        sessions={[]}
        loading={false}
        availability="signed_out"
        busySessionId={null}
        revokingOthers={false}
        status={null}
        onRefresh={vi.fn(async () => {})}
        onRevokeSession={vi.fn(async () => {})}
        onRevokeOthers={vi.fn(async () => {})}
      />,
    )

    expect(screen.getByTestId('account-sessions-unavailable')).toHaveTextContent(
      'account.sessionsUnavailable',
    )
    expect(screen.getByTestId('account-sessions-refresh')).toBeDisabled()
    expect(screen.getByTestId('account-sessions-revoke-others')).toBeDisabled()
  })
})
