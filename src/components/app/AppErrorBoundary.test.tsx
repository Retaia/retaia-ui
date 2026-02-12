import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppErrorBoundary } from './AppErrorBoundary'

const reportUiIssue = vi.fn()

vi.mock('../../ui/telemetry', () => ({
  reportUiIssue: (...args: unknown[]) => reportUiIssue(...args),
}))

function Crasher() {
  throw new Error('boom')
  return null
}

describe('AppErrorBoundary', () => {
  it('renders fallback and reports ui issue when child crashes', () => {
    render(
      <AppErrorBoundary>
        <Crasher />
      </AppErrorBoundary>,
    )

    expect(screen.getByTestId('app-fatal-error')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /recharger|reload/i })).toBeInTheDocument()
    expect(reportUiIssue).toHaveBeenCalledWith(
      'ui.error_boundary',
      expect.objectContaining({ message: 'boom' }),
    )
  })
})
