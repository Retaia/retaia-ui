import { getStateFromDecision, type Asset, type DecisionAction } from '../domain/assets'
import { BsCheck2Circle, BsEraser, BsInbox, BsXCircle } from 'react-icons/bs'
import type { DisplayType } from '../hooks/useDisplayType'
import { AppButton } from './ui/AppButton'

type AssetListProps = {
  assets: Asset[]
  selectedAssetId: string | null
  batchIds: string[]
  displayType?: DisplayType
  density: 'COMFORTABLE' | 'COMPACT'
  labels: {
    empty: string
    select: string
    asset: string
    stateLabel: string
    actions: string
    keep: string
    reject: string
    clear: string
    state: (value: Asset['state']) => string
  }
  onDecision: (id: string, action: DecisionAction) => void
  onAssetClick: (id: string, shiftKey: boolean) => void
  onBatchSelectionChange?: (id: string, selected: boolean) => void
  showDecisionActions?: boolean
}

export function AssetList({
  assets,
  selectedAssetId,
  batchIds,
  displayType = 'TABLE',
  density,
  labels,
  onDecision,
  onAssetClick,
  onBatchSelectionChange,
  showDecisionActions = true,
}: AssetListProps) {
  if (assets.length === 0) {
    return (
      <p className="text-gray-500 mb-0">
        <BsInbox className="mr-1 inline-block" aria-hidden="true" />
        {labels.empty}
      </p>
    )
  }

  const compact = density === 'COMPACT'
  const showBatchSelection = showDecisionActions && onBatchSelectionChange

  if (displayType === 'TABLE') {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full border-collapse" data-testid="asset-table" aria-label="asset-table">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              {showBatchSelection ? <th className="px-3 py-2 font-semibold">{labels.select}</th> : null}
              <th className="px-3 py-2 font-semibold">{labels.asset}</th>
              <th className="px-3 py-2 font-semibold">{labels.stateLabel}</th>
              {showDecisionActions ? <th className="px-3 py-2 text-right font-semibold">{labels.actions}</th> : null}
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => {
              const keepDisabled = getStateFromDecision('KEEP', asset.state) === asset.state
              const rejectDisabled = getStateFromDecision('REJECT', asset.state) === asset.state
              const clearDisabled = getStateFromDecision('CLEAR', asset.state) === asset.state
              return (
              <tr
                key={asset.id}
                data-asset-id={asset.id}
                className={[
                  'border-t border-gray-200',
                  compact ? 'text-xs' : 'text-sm',
                  selectedAssetId === asset.id ? 'bg-brand-50' : '',
                  batchIds.includes(asset.id) ? 'bg-warning-50' : '',
                ]
                  .join(' ')
                  .trim()}
                onClick={(event) => onAssetClick(asset.id, event.shiftKey)}
                aria-current={selectedAssetId === asset.id ? 'true' : undefined}
              >
                {showBatchSelection ? (
                  <td className="px-3 py-2 align-top">
                    <input
                      type="checkbox"
                      checked={batchIds.includes(asset.id)}
                      aria-label={asset.name}
                      className="h-4 w-4 accent-[var(--color-brand-500)]"
                      onChange={(event) => {
                        event.stopPropagation()
                        onBatchSelectionChange(asset.id, event.currentTarget.checked)
                      }}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </td>
                ) : null}
                <td className="px-3 py-2 align-top">
                  <button
                    type="button"
                    data-asset-open="true"
                    className={[
                      'p-0 text-start font-semibold',
                      selectedAssetId === asset.id ? 'text-brand-700' : 'text-gray-900',
                    ]
                      .join(' ')
                      .trim()}
                    onClick={(event) => {
                      event.stopPropagation()
                      onAssetClick(asset.id, event.shiftKey)
                    }}
                  >
                    {asset.name}
                  </button>
                  <p className={selectedAssetId === asset.id ? 'mb-0 text-brand-700/80' : 'mb-0 text-gray-500'}>
                    {asset.id} - {labels.state(asset.state)}
                  </p>
                </td>
                <td className="px-3 py-2 align-top text-gray-700">{labels.state(asset.state)}</td>
                {showDecisionActions ? (
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap justify-end gap-2">
                      <AppButton
                        size="sm"
                        variant="outline-success"
                        onClick={(event) => {
                          event.stopPropagation()
                          onDecision(asset.id, 'KEEP')
                        }}
                        disabled={keepDisabled}
                      >
                        <BsCheck2Circle className="mr-1" aria-hidden="true" />
                        {labels.keep}
                      </AppButton>
                      <AppButton
                        size="sm"
                        variant="outline-danger"
                        onClick={(event) => {
                          event.stopPropagation()
                          onDecision(asset.id, 'REJECT')
                        }}
                        disabled={rejectDisabled}
                      >
                        <BsXCircle className="mr-1" aria-hidden="true" />
                        {labels.reject}
                      </AppButton>
                      <AppButton
                        size="sm"
                        variant="outline-secondary"
                        onClick={(event) => {
                          event.stopPropagation()
                          onDecision(asset.id, 'CLEAR')
                        }}
                        disabled={clearDisabled}
                      >
                        <BsEraser className="mr-1" aria-hidden="true" />
                        {labels.clear}
                      </AppButton>
                    </div>
                  </td>
                ) : null}
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <ul className="m-0 list-none overflow-hidden rounded-xl" role="list" aria-label="asset-list">
      {assets.map((asset) => {
        const keepDisabled = getStateFromDecision('KEEP', asset.state) === asset.state
        const rejectDisabled = getStateFromDecision('REJECT', asset.state) === asset.state
        const clearDisabled = getStateFromDecision('CLEAR', asset.state) === asset.state
        return (
        <li
          key={asset.id}
          data-asset-id={asset.id}
          className={[
            'flex',
            'justify-between',
            'items-center',
            'gap-3',
            'border border-gray-200 bg-white p-3 first:rounded-t-xl last:rounded-b-xl',
            compact ? 'py-2' : 'py-3',
            selectedAssetId === asset.id ? 'border-brand-500 bg-brand-50' : '',
            batchIds.includes(asset.id) ? 'bg-warning-50' : '',
          ]
            .join(' ')
            .trim()}
          onClick={(event) => onAssetClick(asset.id, event.shiftKey)}
          role="listitem"
          aria-current={selectedAssetId === asset.id ? 'true' : undefined}
        >
          <div className="grow">
            {showBatchSelection ? (
              <label className="mb-1 inline-flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={batchIds.includes(asset.id)}
                  aria-label={asset.name}
                  className="h-4 w-4 accent-[var(--color-brand-500)]"
                  onChange={(event) => {
                    event.stopPropagation()
                    const selected = event.currentTarget.checked
                    onBatchSelectionChange(asset.id, selected)
                  }}
                  onClick={(event) => event.stopPropagation()}
                />
              </label>
            ) : null}
            <button
              type="button"
              data-asset-open="true"
              className={[
                'p-0',
                'text-start',
                'font-semibold',
                selectedAssetId === asset.id ? 'text-brand-700' : 'text-gray-900',
                compact ? 'text-xs' : 'text-sm',
              ]
                .join(' ')
                .trim()}
              onClick={(event) => {
                event.stopPropagation()
                onAssetClick(asset.id, event.shiftKey)
              }}
            >
              {asset.name}
            </button>
            <p className={selectedAssetId === asset.id ? 'mb-0 text-brand-700/80' : 'mb-0 text-gray-500'}>
              {asset.id} - {labels.state(asset.state)}
            </p>
          </div>
          {showDecisionActions ? (
            <div className="flex flex-wrap gap-2">
              <AppButton
                size="sm"
                variant="outline-success"
                onClick={(event) => {
                  event.stopPropagation()
                  onDecision(asset.id, 'KEEP')
                }}
                disabled={keepDisabled}
              >
                <BsCheck2Circle className="mr-1" aria-hidden="true" />
                {labels.keep}
              </AppButton>
              <AppButton
                size="sm"
                variant="outline-danger"
                onClick={(event) => {
                  event.stopPropagation()
                  onDecision(asset.id, 'REJECT')
                }}
                disabled={rejectDisabled}
              >
                <BsXCircle className="mr-1" aria-hidden="true" />
                {labels.reject}
              </AppButton>
              <AppButton
                size="sm"
                variant="outline-secondary"
                onClick={(event) => {
                  event.stopPropagation()
                  onDecision(asset.id, 'CLEAR')
                }}
                disabled={clearDisabled}
              >
                <BsEraser className="mr-1" aria-hidden="true" />
                {labels.clear}
              </AppButton>
            </div>
          ) : null}
        </li>
        )
      })}
    </ul>
  )
}
