import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { BatchExecutionStatusAlerts } from './BatchExecutionStatusAlerts'
import { vi } from 'vitest'

describe('BatchExecutionStatusAlerts', () => {
  it('renders all statuses when provided', () => {
    render(
      <BatchExecutionStatusAlerts
        previewStatus={{ kind: 'success', message: 'preview ok' }}
        executeStatus={{ kind: 'error', message: 'execute failed' }}
        shouldRefreshAssetsAfterConflict={false}
        retryStatus="retrying"
      />,
    )

    expect(screen.getByTestId('batch-preview-status')).toHaveTextContent('preview ok')
    expect(screen.getByTestId('batch-execute-status')).toHaveTextContent('execute failed')
    expect(screen.getByTestId('api-retry-status')).toHaveTextContent('retrying')
  })

  it('renders nothing when no status is provided', () => {
    const { container } = render(
      <BatchExecutionStatusAlerts
        previewStatus={null}
        executeStatus={null}
        shouldRefreshAssetsAfterConflict={false}
        retryStatus={null}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders a refresh CTA when batch conflicts require a list refresh', async () => {
    const user = userEvent.setup()
    const onRefreshAssetsAfterConflict = vi.fn(async () => {})

    render(
      <BatchExecutionStatusAlerts
        previewStatus={null}
        executeStatus={{ kind: 'error', message: 'stale revision' }}
        shouldRefreshAssetsAfterConflict
        onRefreshAssetsAfterConflict={onRefreshAssetsAfterConflict}
        refreshAssetsLabel="Refresh asset list"
        retryStatus={null}
      />,
    )

    await user.click(screen.getByTestId('batch-refresh-assets-action'))
    expect(onRefreshAssetsAfterConflict).toHaveBeenCalled()
  })
})
