import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { TFunction } from 'i18next'
import { AssetListSection } from './AssetListSection'

const t = ((key: string) => key) as unknown as TFunction

describe('AssetListSection', () => {
  it('renders selection and batch status with asset list', () => {
    const onDecision = vi.fn()
    const onAssetClick = vi.fn()

    render(
      <AssetListSection
        t={t}
        visibleAssets={[
          {
            id: 'A-001',
            name: 'asset-a.mp4',
            state: 'DECISION_PENDING',
          },
        ]}
        selectedAssetId="A-001"
        batchIds={['A-001']}
        selectionStatusLabel="selection"
        densityMode="COMFORTABLE"
        emptyAssetsMessage="empty"
        onDecision={onDecision}
        onAssetClick={onAssetClick}
        assetListRegionRef={{ current: null }}
      />,
    )

    expect(screen.getByTestId('selection-status')).toHaveTextContent('selection')
    expect(screen.getByTestId('batch-status')).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'asset-table' })).toBeInTheDocument()
  })

  it('forwards decision and click interactions to callbacks', async () => {
    const user = userEvent.setup()
    const onDecision = vi.fn()
    const onAssetClick = vi.fn()

    render(
      <AssetListSection
        t={t}
        visibleAssets={[
          {
            id: 'A-001',
            name: 'asset-a.mp4',
            state: 'DECISION_PENDING',
          },
        ]}
        selectedAssetId="A-001"
        batchIds={[]}
        selectionStatusLabel="selection"
        densityMode="COMPACT"
        emptyAssetsMessage="empty"
        onDecision={onDecision}
        onAssetClick={onAssetClick}
        assetListRegionRef={{ current: null }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'actions.decisionKeep' }))
    expect(onDecision).toHaveBeenCalledWith('A-001', 'KEEP')

    await user.click(screen.getByRole('button', { name: 'asset-a.mp4' }))
    expect(onAssetClick).toHaveBeenCalledWith('A-001', false)
  })

  it('hides batch status and decision actions when used in read-only mode', () => {
    render(
      <AssetListSection
        t={t}
        visibleAssets={[
          {
            id: 'A-003',
            name: 'asset-rejected.jpg',
            state: 'REJECTED',
          },
        ]}
        selectedAssetId="A-003"
        batchIds={[]}
        selectionStatusLabel="selection"
        densityMode="COMPACT"
        emptyAssetsMessage="empty"
        showDecisionActions={false}
        helpText="read-only help"
        onDecision={vi.fn()}
        onAssetClick={vi.fn()}
        assetListRegionRef={{ current: null }}
      />,
    )

    expect(screen.queryByTestId('batch-status')).not.toBeInTheDocument()
    expect(screen.getByText('read-only help')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'actions.decisionKeep' })).not.toBeInTheDocument()
  })
})
