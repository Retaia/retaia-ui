import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { TFunction } from 'i18next'
import { ReviewStatusAlerts } from './ReviewStatusAlerts'

const t = ((key: string) => key) as unknown as TFunction

describe('ReviewStatusAlerts', () => {
  it('renders nothing when API source is disabled', () => {
    const { container } = render(
      <ReviewStatusAlerts
        t={t}
        isApiAssetSource={false}
        assetsLoadState="loading"
        policyLoadState="loading"
        bulkDecisionsEnabled={true}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders loading and error alerts from runtime states', () => {
    render(
      <ReviewStatusAlerts
        t={t}
        isApiAssetSource={true}
        assetsLoadState="error"
        policyLoadState="loading"
        bulkDecisionsEnabled={true}
      />,
    )

    expect(screen.getByTestId('assets-error-status')).toBeInTheDocument()
    expect(screen.getByTestId('policy-loading-status')).toBeInTheDocument()
  })

  it('renders bulk-disabled alert when policy is ready and feature is off', () => {
    render(
      <ReviewStatusAlerts
        t={t}
        isApiAssetSource={true}
        assetsLoadState="ready"
        policyLoadState="ready"
        bulkDecisionsEnabled={false}
      />,
    )

    expect(screen.getByTestId('policy-bulk-disabled-status')).toBeInTheDocument()
  })
})
