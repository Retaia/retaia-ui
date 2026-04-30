import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { BatchExecutionStatusAlerts } from './BatchExecutionStatusAlerts'
import { vi } from 'vitest'

describe('BatchExecutionStatusAlerts', () => {
  it('renders all statuses when provided', () => {
    render(
      <BatchExecutionStatusAlerts
        t={(key) => key}
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
        t={(key) => key}
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
        t={(key) => key}
        previewStatus={null}
        executeStatus={{ kind: 'error', message: 'stale revision' }}
        shouldRefreshAssetsAfterConflict
        refreshRecommendationReason="precondition_failed"
        onRefreshAssetsAfterConflict={onRefreshAssetsAfterConflict}
        retryStatus={null}
      />,
    )

    expect(screen.getByTestId('batch-refresh-resolution-message')).toHaveTextContent(
      'reviewResolution.body',
    )
    await user.click(screen.getByTestId('batch-refresh-resolution-action'))
    expect(onRefreshAssetsAfterConflict).toHaveBeenCalled()
  })
})
