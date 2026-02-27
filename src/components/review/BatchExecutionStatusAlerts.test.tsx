import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BatchExecutionStatusAlerts } from './BatchExecutionStatusAlerts'

describe('BatchExecutionStatusAlerts', () => {
  it('renders all statuses when provided', () => {
    render(
      <BatchExecutionStatusAlerts
        previewStatus={{ kind: 'success', message: 'preview ok' }}
        executeStatus={{ kind: 'error', message: 'execute failed' }}
        retryStatus="retrying"
      />,
    )

    expect(screen.getByTestId('batch-preview-status')).toHaveTextContent('preview ok')
    expect(screen.getByTestId('batch-execute-status')).toHaveTextContent('execute failed')
    expect(screen.getByTestId('api-retry-status')).toHaveTextContent('retrying')
  })

  it('renders nothing when no status is provided', () => {
    const { container } = render(
      <BatchExecutionStatusAlerts previewStatus={null} executeStatus={null} retryStatus={null} />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
