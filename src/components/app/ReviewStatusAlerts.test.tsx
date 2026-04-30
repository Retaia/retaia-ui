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
        bulkAvailabilityLoadState="loading"
        bulkDecisionsEnabled={true}
        policySummary={null}
        refreshingPolicy={false}
        onRefreshPolicy={async () => {}}
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
        policyLoadState="ready"
        bulkAvailabilityLoadState="loading"
        bulkDecisionsEnabled={true}
        policySummary={null}
        refreshingPolicy={false}
        onRefreshPolicy={async () => {}}
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
        bulkAvailabilityLoadState="ready"
        bulkDecisionsEnabled={false}
        policySummary={null}
        refreshingPolicy={false}
        onRefreshPolicy={async () => {}}
      />,
    )

    expect(screen.getByTestId('policy-bulk-disabled-status')).toBeInTheDocument()
  })

  it('renders runtime policy summary and refresh action when policy is available', () => {
    render(
      <ReviewStatusAlerts
        t={t}
        isApiAssetSource={true}
        assetsLoadState="ready"
        policyLoadState="ready"
        bulkAvailabilityLoadState="ready"
        bulkDecisionsEnabled={true}
        policySummary={{
          featureFlagsCount: 3,
          contractVersion: '1.2.0',
          pollIntervalSeconds: 30,
        }}
        refreshingPolicy={false}
        onRefreshPolicy={async () => {}}
      />,
    )

    expect(screen.getByTestId('policy-runtime-summary')).toBeInTheDocument()
    expect(screen.getByTestId('policy-contract-version')).toHaveTextContent('1.2.0')
    expect(screen.getByTestId('policy-flag-count')).toHaveTextContent('app.policyFlagCountValue')
    expect(screen.getByTestId('policy-poll-interval')).toHaveTextContent('app.policyPollIntervalValue')
    expect(screen.getByTestId('policy-refresh-action')).toBeInTheDocument()
  })
})
